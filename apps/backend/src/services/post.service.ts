import { prisma } from '../config/database'
import type { CreatePostInput, Post } from '@nearworld/types'
import { paginate, paginatedResponse } from '@nearworld/utils'

/**
POST /api/v1/posts — create post (auth) - Done

GET /api/v1/posts — list posts (paginated, filters: post_type, visibility, hashtag) - Done

GET /api/v1/posts/:id — get single post - Done

PATCH /api/v1/posts/:id — update post (owner only) - Done

DELETE /api/v1/posts/:id — soft delete (owner only) - Done

GET /api/v1/posts/nearby — proximity feed (lat, lng, radius) with Haversine query

GET /api/v1/posts/global — global feed (paginated)

GET /api/v1/posts/:id/comments — nested comments

POST /api/v1/posts/:id/comments — add comment (auth)

POST /api/v1/posts/:id/like — like/unlike toggle (auth)

POST /api/v1/posts/:id/bookmark — bookmark toggle (auth)

POST /api/v1/posts/:id/repost — repost (auth)
 */

export async function createPost(userId: string, input: CreatePostInput): Promise<Post> {
  const post = await prisma.posts.create({
    data: {
      id: crypto.randomUUID(),
      user_id: userId,
      content: input.content ?? null,
      post_type: input.post_type,
      visibility: input.visibility ?? 'public',
      location_type: input.location_type ?? 'global',
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      place_name: input.place_name ?? null,
    },
  })

  return post as unknown as Post
}

export async function getPostById(postId: string): Promise<Post | null> {
  const post = await prisma.posts.findUnique({
    where: { id: postId },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          full_name: true,
          avatar_url: true,
        },
      },
    },
  })

  if (!post) {
    return null
  }

  return post as unknown as Post
}

export async function listPosts(options: {
  post_type?: string
  user_id?: string
  page?: number
  limit?: number
}): Promise<{
  data: Post[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10
  const { skip, take } = paginate(page, limit)

  const where: any = {}

  if (options.post_type) {
    where.post_type = options.post_type
  }

  if (options.user_id) {
    where.user_id = options.user_id
  }

  // Don't show deleted  posts
  where.is_deleted = false

  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    }),

    prisma.posts.count({ where }),
  ])

  return paginatedResponse(posts as unknown as Post[], total, page, limit)
}

export async function updatePost(
  postId: string,
  input: {
    content?: string
    visibility?: string
    lat?: number | null
    lng?: number | null
    place_name?: string | null
  }
): Promise<Post> {
  const data: any = {}

  if (input.content !== undefined) data.content = input.content
  if (input.visibility !== undefined) data.visibility = input.visibility
  if (input.lat !== undefined) data.lat = input.lat
  if (input.lng !== undefined) data.lng = input.lng
  if (input.place_name !== undefined) data.place_name = input.place_name

  const post = await prisma.posts.update({
    where: { id: postId },
    data,
  })

  return post as unknown as Post
}

export async function deletePost(postId: string): Promise<void> {
  await prisma.posts.update({
    where: { id: postId },
    data: {
      is_deleted: true,
      updated_at: new Date(),
    },
  })
}

export async function toggleBookmark(
  userId: string,
  postId: string
): Promise<{ bookmarked: boolean }> {
  const exists = await prisma.bookmarks.findFirst({
    where: { post_id: postId, user_id: userId },
  })

  if (exists) {
    await prisma.bookmarks.delete({
      where: { id: exists.id },
    })
    return { bookmarked: false }
  }

  await prisma.bookmarks.create({
    data: {
      id: crypto.randomUUID(),
      user_id: userId,
      post_id: postId,
    },
  })
  return { bookmarked: true }
}

export async function toggleLike(userId: string, postId: string): Promise<{ liked: boolean }> {
  const existing = await prisma.likes.findFirst({
    where: { user_id: userId, post_id: postId },
  })

  if (existing) {
    await prisma.$transaction([
      prisma.likes.delete({ where: { id: existing.id } }),
      prisma.posts.update({
        where: { id: postId },
        data: { likes_count: { decrement: 1 } },
      }),
    ])
    return { liked: false }
  }

  await prisma.$transaction([
    prisma.likes.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        post_id: postId,
      },
    }),
    prisma.posts.update({
      where: { id: postId },
      data: { likes_count: { increment: 1 } },
    }),
  ])
  return { liked: true }
}

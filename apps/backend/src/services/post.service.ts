import { prisma } from '../config/database'
import type { CreatePostInput, Post } from '@nearworld/types'
import { paginate, paginatedResponse, formatDate } from '@nearworld/utils'

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
      updated_at: formatDate(new Date()),
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

export async function getNearbyPosts(options: {
  lat: number
  lng: number
  radius?: number // in km, default 10
  page?: number
  limit?: number
}): Promise<{
  data: Post[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}> {
  const radius = options.radius ?? 10
  const page = options.page ?? 1
  const limit = options.limit ?? 10
  const { skip, take } = paginate(page, limit)

  const lat = options.lat
  const lng = options.lng

  const posts = await prisma.$queryRawUnsafe<Post[]>(
    `SELECT p.*,
      (6371 * acos(cos(radians($1)) * cos(radians(p.lat::float)) * cos(radians(p.lng::float) - radians($2)) + sin(radians($1)) * sin(radians(p.lat::float)))) AS distance
    FROM "posts" p
    WHERE p.is_deleted = false
      AND p.lat IS NOT NULL
      AND p.lng IS NOT NULL
      AND (6371 * acos(cos(radians($1)) * cos(radians(p.lat::float)) * cos(radians(p.lng::float) - radians($2)) + sin(radians($1)) * sin(radians(p.lat::float)))) <= $3
    ORDER BY p.created_at DESC
    LIMIT $4 OFFSET $5`,
    lat,
    lng,
    radius,
    take,
    skip
  )

  const countResult = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count
    FROM "posts" p
    WHERE p.is_deleted = false
      AND p.lat IS NOT NULL
      AND p.lng IS NOT NULL
      AND (6371 * acos(cos(radians($1)) * cos(radians(p.lat::float)) * cos(radians(p.lng::float) - radians($2)) + sin(radians($1)) * sin(radians(p.lat::float)))) <= $3`,
    lat,
    lng,
    radius
  )

  const total = Number(countResult[0]?.count ?? 0)

  return paginatedResponse(posts, total, page, limit)
}

export async function getPostComments(postId: string, page?: number, limit?: number) {
  const p = page ?? 1
  const l = limit ?? 20
  const { skip, take } = paginate(p, l)

  const [comments, total] = await Promise.all([
    prisma.comments.findMany({
      where: { post_id: postId, parent_id: null },
      skip,
      take,
      orderBy: { created_at: 'asc' },
      include: {
        users: {
          select: { id: true, username: true, full_name: true, avatar_url: true },
        },
        other_comments: {
          include: {
            users: {
              select: { id: true, username: true, full_name: true, avatar_url: true },
            },
          },
        },
      },
    }),
    prisma.comments.count({ where: { post_id: postId } }),
  ])

  return paginatedResponse(comments, total, p, l)
}

export async function addComment(
  userId: string,
  postId: string,
  content: string,
  parentId?: string
) {
  const [comment] = await prisma.$transaction([
    prisma.comments.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        post_id: postId,
        content,
        parent_id: parentId ?? null,
      },
      include: {
        users: {
          select: { id: true, username: true, full_name: true, avatar_url: true },
        },
      },
    }),
    prisma.posts.update({
      where: { id: postId },
      data: { comments_count: { increment: 1 } },
    }),
  ])

  return comment
}

export async function getGlobalFeed(options: { page?: number; limit?: number }): Promise<{
  data: Post[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}> {
  const page = options.page ?? 1
  const limit = options.limit ?? 10
  const { skip, take } = paginate(page, limit)

  const where: any = {
    is_deleted: false,
    visibility: 'public',
    OR: [{ location_type: 'global' }, { lat: null, lng: null }],
  }

  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: { id: true, username: true, full_name: true, avatar_url: true },
        },
      },
    }),
    prisma.posts.count({ where }),
  ])

  return paginatedResponse(posts as unknown as Post[], total, page, limit)
}

export async function repost(userId: string, postId: string): Promise<Post> {
  const original = await prisma.posts.findUnique({ where: { id: postId } })

  if (!original) throw new Error('Post not found')

  const [newPost] = await prisma.$transaction([
    prisma.posts.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        content: original.content,
        post_type: original.post_type,
        visibility: original.visibility,
        location_type: original.location_type,
        lat: original.lat,
        lng: original.lng,
        place_name: original.place_name,
      },
      include: {
        users: {
          select: { id: true, username: true, full_name: true, avatar_url: true },
        },
      },
    }),
    prisma.posts.update({
      where: { id: postId },
      data: { reposts_count: { increment: 1 } },
    }),
  ])

  return newPost as unknown as Post
}

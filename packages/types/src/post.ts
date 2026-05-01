export type PostType =
  | 'general'
  | 'event'
  | 'news'
  | 'poll'
  | 'job'
  | 'marketplace'
  | 'broadcast'
  | 'lost_found'

export type Visibility = 'public' | 'followers' | 'private'
export type LocationType = 'point' | 'area' | 'global'

export interface CreatePostInput {
  content?: string
  post_type: PostType
  visibility?: Visibility
  location_type: LocationType
  lat?: number | null
  lng?: number | null
  place_name?: string | null
}

export interface PostMedia {
  id: string
  url: string
  media_type: string
  order_index: number
}

export interface Post {
  id: string
  user_id: string
  content: string | null
  post_type: PostType
  broadcast_id: string | null
  visibility: Visibility
  lat: number | null
  lng: number | null
  place_name: string | null
  likes_count: number
  comments_count: number
  reposts_count: number
  views_count: number
  created_at: string
  updated_at: string
  author?: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
  media?: PostMedia[]
  hashtags?: string[]
  distance?: number // only for nearby queries
}

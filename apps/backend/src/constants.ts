export const API_PREFIX = '/api'

export const API_VERSION = 'v1'

export const API_BASE = `${API_PREFIX}/${API_VERSION}`

export const API_ROUTES = {
  AUTH: `${API_BASE}/auth`,
  USERS: `${API_BASE}/users`,
} as const

import type { H3Event } from 'h3'
import { clearRefreshTokenCookie } from '../../utils/auth-proxy'

export default defineEventHandler((event: H3Event) => {
  clearRefreshTokenCookie(event)
  return { ok: true as const }
})

import { createError } from 'h3'
import type { H3Event } from 'h3'
import { StatusCodes } from 'http-status-codes'
import type { JwtTokensDto } from '../../../shared/dto/jwt-tokens.dto'
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
  restApiUrl,
  setRefreshTokenCookie,
  throwUpstreamAuthError,
} from '../../utils/auth-proxy'

export default defineEventHandler(async (event: H3Event) => {
  const refreshToken = getRefreshTokenFromCookie(event)
  if (!refreshToken) {
    throw createError({
      statusCode: StatusCodes.UNAUTHORIZED,
      statusMessage: 'No refresh token',
    })
  }

  try {
    const data = await $fetch<JwtTokensDto>(restApiUrl(event, '/auth/refresh'), {
      method: 'POST',
      body: { refreshToken },
    })

    if (!data?.refreshToken) {
      clearRefreshTokenCookie(event)
      throw createError({
        statusCode: StatusCodes.BAD_GATEWAY,
        statusMessage: 'Invalid response from authentication service',
      })
    }

    setRefreshTokenCookie(event, data.refreshToken)

    return { accessToken: data.accessToken, refreshToken: data.refreshToken }
  } catch (cause) {
    clearRefreshTokenCookie(event)
    throwUpstreamAuthError(cause)
  }
})

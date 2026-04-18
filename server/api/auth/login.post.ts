import { createError, readBody } from 'h3';
import type { H3Event } from 'h3';
import { StatusCodes } from 'http-status-codes';
import {
  restApiUrl,
  setRefreshTokenCookie,
  throwUpstreamAuthError,
} from '../../utils/auth-proxy';
import type { RegisterResponseDto } from '../../../shared/dto/register-response.dto';

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    throw createError({
      statusCode: StatusCodes.BAD_REQUEST,
      statusMessage: 'Missing email or password',
    });
  }

  try {
    const data = await $fetch<RegisterResponseDto>(
      restApiUrl(event, '/auth/login'),
      {
        method: 'POST',
        body: { email, password },
      },
    );
    const { tokens, user } = data;

    if (!tokens?.refreshToken) {
      throw createError({
        statusCode: StatusCodes.BAD_GATEWAY,
        statusMessage: 'Invalid response from authentication service',
      });
    }

    setRefreshTokenCookie(event, tokens.refreshToken);

    return { accessToken: tokens.accessToken, user };
  } catch (cause) {
    throwUpstreamAuthError(cause);
  }
});

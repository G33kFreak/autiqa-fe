import { createError, readBody } from 'h3';
import type { H3Event } from 'h3';
import { StatusCodes } from 'http-status-codes';
import type { RegisterDto } from '../../../shared/dto/register.dto';
import type { RegisterResponseDto } from '../../../shared/dto/register-response.dto';
import {
  restApiUrl,
  setRefreshTokenCookie,
  throwUpstreamAuthError,
} from '../../utils/auth-proxy';

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<Partial<RegisterDto>>(event);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !name || !password) {
    throw createError({
      statusCode: StatusCodes.BAD_REQUEST,
      statusMessage: 'Missing email, name, or password',
    });
  }

  try {
    const data = await $fetch<RegisterResponseDto>(
      restApiUrl(event, '/auth/register'),
      {
        method: 'POST',
        body: { email, name, password } satisfies RegisterDto,
      },
    );

    if (!data?.tokens?.refreshToken) {
      throw createError({
        statusCode: StatusCodes.BAD_GATEWAY,
        statusMessage: 'Invalid response from authentication service',
      });
    }

    setRefreshTokenCookie(event, data.tokens.refreshToken);

    return data;
  } catch (cause) {
    throwUpstreamAuthError(cause);
  }
});

import { createError, readBody } from 'h3';
import type { H3Event } from 'h3';
import { StatusCodes } from 'http-status-codes';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponseDto,
} from '../../../shared/dto/password-reset.dto';
import { restApiUrl, throwUpstreamAuthError } from '../../utils/auth-proxy';

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<{
    email?: string;
    resetRequestToken?: string;
  }>(event);

  const emailRaw = typeof body.email === 'string' ? body.email.trim() : '';
  const tokenRaw =
    typeof body.resetRequestToken === 'string'
      ? body.resetRequestToken.trim()
      : '';

  const hasEmail = emailRaw.length > 0;
  const hasToken = tokenRaw.length > 0;

  if (hasEmail === hasToken) {
    throw createError({
      statusCode: StatusCodes.BAD_REQUEST,
      statusMessage: 'Provide exactly one of email or resetRequestToken',
    });
  }

  const payload: ForgotPasswordRequest = hasEmail
    ? { email: emailRaw }
    : { resetRequestToken: tokenRaw };

  try {
    const data = await $fetch<ForgotPasswordResponseDto>(
      restApiUrl(event, '/auth/forgot-password'),
      {
        method: 'POST',
        body: payload,
      },
    );

    if (!data?.resetRequestToken) {
      throw createError({
        statusCode: StatusCodes.BAD_GATEWAY,
        statusMessage: 'Invalid response from authentication service',
      });
    }

    return data;
  } catch (cause) {
    throwUpstreamAuthError(cause);
  }
});

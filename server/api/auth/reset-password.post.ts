import { createError, readBody, setResponseStatus } from 'h3';
import type { H3Event } from 'h3';
import { StatusCodes } from 'http-status-codes';
import type { ResetPasswordRequest } from '../../../shared/dto/password-reset.dto';
import { restApiUrl, throwUpstreamAuthError } from '../../utils/auth-proxy';

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<{
    email?: string;
    resetRequestToken?: string;
    code?: string;
    newPassword?: string;
  }>(event);

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const resetRequestToken =
    typeof body.resetRequestToken === 'string'
      ? body.resetRequestToken.trim()
      : '';
  const code = typeof body.code === 'string' ? body.code : '';
  const newPassword =
    typeof body.newPassword === 'string' ? body.newPassword : '';

  if (!code || !newPassword) {
    throw createError({
      statusCode: StatusCodes.BAD_REQUEST,
      statusMessage: 'Missing code or new password',
    });
  }

  const hasToken = resetRequestToken.length > 0;
  const hasEmail = email.length > 0;

  if (!hasToken && !hasEmail) {
    throw createError({
      statusCode: StatusCodes.BAD_REQUEST,
      statusMessage: 'Provide resetRequestToken or email',
    });
  }

  const payload: ResetPasswordRequest = hasToken
    ? { resetRequestToken, code, newPassword }
    : { email, code, newPassword };

  try {
    await $fetch(restApiUrl(event, '/auth/reset-password'), {
      method: 'POST',
      body: payload,
    });
    setResponseStatus(event, StatusCodes.NO_CONTENT);
    return null;
  } catch (cause) {
    throwUpstreamAuthError(cause);
  }
});

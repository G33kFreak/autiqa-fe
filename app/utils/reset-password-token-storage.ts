/** Session tab storage for reset flow; URL `?token=` is primary for refresh. */
export const RESET_PASSWORD_TOKEN_STORAGE_KEY =
  'autiqa:resetPassword:resetRequestToken';

export function readResetPasswordTokenFromStorage(): string | null {
  if (!import.meta.client) return null;
  return sessionStorage.getItem(RESET_PASSWORD_TOKEN_STORAGE_KEY);
}

export function writeResetPasswordTokenToStorage(token: string) {
  if (!import.meta.client) return;
  sessionStorage.setItem(RESET_PASSWORD_TOKEN_STORAGE_KEY, token);
}

export function clearResetPasswordTokenFromStorage() {
  if (!import.meta.client) return;
  sessionStorage.removeItem(RESET_PASSWORD_TOKEN_STORAGE_KEY);
}

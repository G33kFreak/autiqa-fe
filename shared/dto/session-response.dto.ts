import type { UserDto } from './user.dto';

/**
 * BFF response for `/auth/login` (`accessToken` + `user`; refresh token via httpOnly cookie).
 */
export interface SessionResponseDto {
  accessToken: string;
  user: UserDto;
}

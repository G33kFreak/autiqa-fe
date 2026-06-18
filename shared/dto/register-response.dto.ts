import type { JwtTokensDto } from './jwt-tokens.dto';
import type { UserDto } from './user.dto';

/**
 * Successful register payload — mirrors backend `RegisterResponseDto`.
 */
export interface RegisterResponseDto {
  tokens: JwtTokensDto;
  user: UserDto;
}

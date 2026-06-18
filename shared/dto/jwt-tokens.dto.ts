/**
 * Access + refresh pair — mirrors backend `JwtTokensDto`.
 */
export interface JwtTokensDto {
  accessToken: string;
  refreshToken: string;
}

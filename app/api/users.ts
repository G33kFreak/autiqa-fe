import type { UserDto } from '~~/shared/dto/user.dto';
import type { ApiClient } from './types';

export function getMe(client: ApiClient) {
  return client<UserDto>('/users/me', {
    method: 'GET',
  });
}

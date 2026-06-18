/**
 * A single driver in the `POST /drivers` body — mirrors backend `CreateDriverDto`.
 * Only the name fields are required; optional contact fields are omitted when blank.
 */
export interface CreateDriverDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
}

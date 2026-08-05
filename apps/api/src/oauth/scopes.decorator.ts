import { SetMetadata } from '@nestjs/common';

export const SCOPES_KEY = 'required_scopes';

/** Require the Logto access token to carry all of these scopes. */
export const RequiredScopes = (...scopes: string[]) => SetMetadata(SCOPES_KEY, scopes);

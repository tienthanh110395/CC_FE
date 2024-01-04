export class AccessToken {
    acr?: string;
    allowed_origins?: Array<string>;
    aud?: string;
    auth_time: string;
    azp?: string;
    email_verified: boolean;
    exp?: string;
    family_name?: string;
    given_name?: string;
    name: string;
    iat?: string;
    iss: string;
    jti: string;
    nonce: string;
    preferred_username: string;
    realm_access: Array<string>;
    scope: string;
    session_state: string;
    sub: string;
    typ: string;
    shop_id?: number;
    staff_id?: number;
    shop_name?: string;
    partner_type?: string;
    partner_code?: string;
    email?: string;
}

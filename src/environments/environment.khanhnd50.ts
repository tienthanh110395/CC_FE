// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const COMMOM_CONFIG = {
  REALMS_NAME: 'etc-internal',
  BASE_URL: 'http://localhost:4200',
  HOST_KEY_CLOAK: window["env"]["HOST_KEY_CLOAK"],
  CLIENT_ID: 'cc-public',
  DATE_FORMAT: 'dd/MM/yyyy',
  DATE_TIME_FORMAT: 'DD/MM/YYYY 00:00:00',
  DATE_TIME_EXPIRE_FORMAT: 'DD/MM/YYYY 23:59:59',
  MONTH_TIME_FORMAT: 'MM/YYYY',
  DATE_FORMAT_BILLING: 'YYYYMMDD',
  EMAIL_FORMAT: '[ ]*[A-Za-z][A-Za-z0-9._-]*@[A-Za-z0-9._-]+\\.[a-z]{0,}[ ]*',
  NUMBER_PHONE_FORMAT: '^[ ]*((\\84)|0)([0-9]{9,10})[ ]*',
  NUMBER_WEIGHT_FORMAT: '[^.]*([.](.{1,2}))?',
  SEAT_NUMBER_FORMAT: '[^.]+',
  PLATE_NUMBER_FORMAT: '^[a-zA-Z0-9]+$',
  ENGINE_NUMBER_FORMAT: '[^.]+',
  CHASSIC_NUMBER_FORMAT: '[^.]+',
  DATE_FORMAT_MILISECONDS: 'YYYYMMDDHHmmssSSS',
  DATE_TIME_FORMAT_3: 'DD/MM/YYYY HH:mm:ss'
}

export const environment = {
  production: false,
  useHash: true,
  hmr: false,
  serverUrl: {
    // url server
    api: window["env"]["API_CRM"],
    api_dmdc: window["env"]["API_DMDC"],
    api_settle: window["env"]["API_DOISOAT"],
    api_im: window["env"]["API_IM"],
    api_billing: window["env"]["API_BILLING"],
    api_cc: window["env"]["API_CC"],
    api_post_audit: window["env"]["API_HAUKIEM"],
    api_websocket: 'http://localhost:8078/api/v1'
  },
  API_PATH: {
    BASE_API_PATH: '',
    /** =================== API Permissions =================== */
    keycloak_permission: `/auth/realms/${COMMOM_CONFIG.REALMS_NAME}/protocol/openid-connect/token`,
    /** =================== API modules ======================= */
  },
  envName: 'local',
  keycloak: {
    // Url of the Identity Provider
    issuer: `${COMMOM_CONFIG.HOST_KEY_CLOAK}/auth/realms/${COMMOM_CONFIG.REALMS_NAME}`,

    // URL of the SPA to redirect the user to after login
    redirectUri: `${COMMOM_CONFIG.BASE_URL}`,

    // The SPA's id.
    // The SPA is registerd with this id at the auth-serverß
    // clientId: 'crm',
    clientId: `${COMMOM_CONFIG.CLIENT_ID}`,

    // dummyClientSecret: `${COMMOM_CONFIG.CLIENT_SECRET}`,

    responseType: 'code',
    // set the scope for the permissions the client should request
    // The first three are defined by OIDC.
    scope: 'openid profile email',
    // Remove the requirement of using Https to simplify the demo
    // THIS SHOULD NOT BE USED IN PRODUCTION
    // USE A CERTIFICATE FOR YOUR IDP
    // IN PRODUCTION
    requireHttps: false,
    // at_hash is not present in JWT token
    showDebugInformation: true,
    disableAtHashCheck: true,
  },

  logoutUrl: `${COMMOM_CONFIG.HOST_KEY_CLOAK}/auth/realms/${COMMOM_CONFIG.REALMS_NAME}v2/logout?client_id=${COMMOM_CONFIG.CLIENT_ID}&returnTo=${encodeURIComponent(COMMOM_CONFIG.BASE_URL)}`

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

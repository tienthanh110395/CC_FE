import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { COMMOM_CONFIG, environment } from '@env/environment';
import { AuthConfig, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { of, Subscription } from 'rxjs';
import { catchError, delay, filter, tap } from 'rxjs/operators';
import { StartupService } from '../bootstrap/startup.service';
import { AppStorage } from './AppStorage';
import { AuthzService } from './authz.service';

@Injectable()
export class AuthConfigService {
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private _decodedAccessToken: any;
  private _decodedIDToken: any;
  get decodedAccessToken() { return this._decodedAccessToken; }
  get decodedIDToken() { return this._decodedIDToken; }
  timeout;
  tokenSub = new Subscription();
  constructor(
    private readonly oauthService: OAuthService,
    private readonly authConfig: AuthConfig,
    private startupService: StartupService,
    private _oauthStorage?: OAuthStorage,
    private router?: Router,
    private apiAuthzService?: AuthzService
  ) {

  }

  getPermission() {
    const params = new HttpParams({
      fromObject: {
        grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        audience: 'cc',
        response_mode: 'permissions'
        // permission : route.data['resource']
      }
    })
    // TODO: get permission resource by resource
    this.apiAuthzService.checkPermissionResourceName(params).pipe(
      tap(
        res => {
          AppStorage.setResourcePermission(res);
        },
        error => {
          AppStorage.setResourcePermission(null);
        }
      ),
      catchError(err => {
        return of({});
      })
    ).subscribe(rs => {
      if (AppStorage.get('type') == 1) {
        this.router.navigate(['customer-care', 'statistic'], { queryParams: { phone_number: AppStorage.get('phone_number'), ticket_source_id: AppStorage.get('ticket_source_id'), contract_no_user_name: AppStorage.get('contract_no_user_name') } })
      }
      else {
        this.router.navigate(['customer-care', 'receive-reflect'], { queryParams: { phone_number: AppStorage.get('phone_number'), ticket_source_id: AppStorage.get('ticket_source_id'), email: AppStorage.get('email'), cust_name: AppStorage.get('cust_name') } })
      }

    });
  }

  async initAuth(): Promise<any> {
    return new Promise<void>((resolveFn, rejectFn) => {
      // setup oauthService
      this.oauthService.configure(this.authConfig);
      // this.oauthService.dummyClientSecret = environment.keycloak.dummyClientSecret;
      this.oauthService.logoutUrl = environment.logoutUrl;
      this.oauthService.tokenValidationHandler = new JwksValidationHandler();
      // subscribe to token events
      this.oauthService.events.pipe(filter((e: any) => { return e.type === 'token_received'; })).subscribe(() => this.handleNewToken());
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const phoneNumber = urlParams.get('phone_number');
      const type = urlParams.get('type');
      const email = urlParams.get('email');
      const ticketSourceId = urlParams.get('ticket_source_id');
      const nickName = urlParams.get('nick_name');
      const createUser = urlParams.get('create_user');
      const contractNoUserName = urlParams.get('contract_no_user_name');
      const custName = urlParams.get('cust_name');
      AppStorage.set('phone_number', phoneNumber);
      AppStorage.set('type', type);
      AppStorage.set('email', email);
      AppStorage.set('ticket_source_id', ticketSourceId);
      AppStorage.set('nick_name', nickName);
      AppStorage.set('create_user', createUser);
      AppStorage.set('contract_no_user_name', contractNoUserName);
      AppStorage.set('cust_name', custName);
      if (accessToken) {
        // login qua token
        this._oauthStorage.setItem('access_token', accessToken);
        AppStorage.setLoginByToken(true);
        this.handleNewToken();
        this.oauthService.loadDiscoveryDocument().then(isLoggedIn => {
          this.oauthService.tryLogin().then(rs => {
            this.getPermission();
          });
          resolveFn();
        });
      } else {
        AppStorage.setLoginByToken(false);
        // continue initializing app or redirect to login - page
        this.oauthService.loadDiscoveryDocumentAndLogin().then(isLoggedIn => {
          if (this.isAuthenticated()) {
            this.oauthService.setupAutomaticSilentRefresh();
            resolveFn();
          } else {
            this.oauthService.initImplicitFlow();
            rejectFn();
          }
        });
      }
    });
  }

  private handleNewToken() {
    this.tokenSub.unsubscribe();
    this._decodedAccessToken = this.jwtHelper.decodeToken(this.oauthService.getAccessToken());
    this._decodedIDToken = this.jwtHelper.decodeToken(this.oauthService.getIdToken());
    AppStorage.setAccessToken(this._decodedAccessToken);
    AppStorage.setUserLogin(this._decodedAccessToken.preferred_username);
    if (this._decodedAccessToken.env_test) {
      AppStorage.setEnviroment(this._decodedAccessToken.env_test);
    }
    if (this._decodedAccessToken.partner_code) {
      AppStorage.setPartnerCode(this._decodedAccessToken.partner_code);
    } else {
      AppStorage.setPartnerCode(null);
    }

    this.startupService.load();
    this.timeout = this.jwtHelper.getTokenExpirationDate(this.oauthService.getAccessToken()).valueOf() - new Date().valueOf();
    this.tokenSub = of(null).pipe(delay(this.timeout)).subscribe(rs => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userLogin');
      localStorage.removeItem('resourcePermission');
      this.tokenSub.unsubscribe();
      this.oauthService.logOut();
    });
  }

  public isAuthenticated() {
    return this.oauthService.getAccessToken() && !this.jwtHelper.isTokenExpired(this.oauthService.getAccessToken());
  }
}

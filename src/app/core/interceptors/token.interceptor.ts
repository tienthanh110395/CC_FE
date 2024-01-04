import { Injectable, Optional } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppStorage } from '../services/AppStorage';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OAuthService, OAuthResourceServerErrorHandler, OAuthStorage } from 'angular-oauth2-oidc';
import { OAuthModuleConfig } from '@app/core/auth.config';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    public router: Router,
    private oauthService: OAuthService,
    private authStorage: OAuthStorage,
    private errorHandler: OAuthResourceServerErrorHandler,
    @Optional() private moduleConfig: OAuthModuleConfig
  ) { }

  private checkUrl(url: string): boolean {
    // const found = this.moduleConfig.resourceServer.allowedUrls.find(u => url.startsWith(u));
    // return !!found;
    if (this.moduleConfig.resourceServer.customUrlValidation) {
      return this.moduleConfig.resourceServer.customUrlValidation(url);
    }

    if (this.moduleConfig.resourceServer.allowedUrls) {
      return !!this.moduleConfig.resourceServer.allowedUrls.find(u =>
        url.startsWith(u)
      );
    }

    return true;
  }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // console.log('INTERCEPTOR');

    const url = request.url.toLowerCase();

    // if (!this.moduleConfig) { return next.handle(request); }
    // if (!this.moduleConfig.resourceServer) { return next.handle(request); }
    // if (!this.moduleConfig.resourceServer.allowedUrls) { return next.handle(request); }
    // if (!this.checkUrl(url)) { return next.handle(request); }

    // const sendAccessToken = this.moduleConfig.resourceServer.sendAccessToken;

    // if (sendAccessToken) {

    // const token = this.authStorage.getItem('access_token');
    const token = this.oauthService.getAccessToken();
    const header = 'Bearer ' + token;

    // console.log('TOKEN in INTERCEPTOR : ' + token);

    let headers = request.headers.set('Authorization', header);
    if (AppStorage.getEnviroment() && url.indexOf('/auth/realms/etc-internal') == -1) {
      headers = request.headers.set('Authorization', header).set('preUser', AppStorage.getEnviroment());
    }

    request = request.clone({ headers });
    // }

    // return next.handle(req)/*.catch(err => this.errorHandler.handleError(err))*/;
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {

        }
      }, error => {
        if (error.status === 401) {
          AppStorage.clear();
          this.oauthService.logOut();
        }
      })
    );

  }
}

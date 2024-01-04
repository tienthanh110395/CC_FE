import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc'
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private oauthService: OAuthService,
        private router: Router
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): any{
          
          const hasIdToken = this.oauthService.hasValidIdToken();
          const hasAccessToken = this.oauthService.hasValidAccessToken();
          if (this.oauthService.hasValidAccessToken()) {
            return (hasIdToken && hasAccessToken);
          }
      
          this.router.navigate([this.router.url]);
          return this.oauthService.loadDiscoveryDocumentAndLogin();
      }

}

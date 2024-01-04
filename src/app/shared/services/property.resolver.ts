import { catchError, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthzService } from '@app/core/services/authz.service';
import { environment, COMMOM_CONFIG } from '@env/environment';
import { AppStorage } from '@app/core/services/AppStorage';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class PropertyResolver implements Resolve<any> {

  constructor(private apiAuthzService: AuthzService) { }

  resolve(route: ActivatedRouteSnapshot, rstate: RouterStateSnapshot): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        audience: 'cc',
        response_mode: 'permissions'
        // permission : route.data['resource']
      }
    })

    // TODO: get permission resource by resource
    return this.apiAuthzService.checkPermissionResourceName(params)
      .pipe(
        tap( // Log the result or error
          res => {
            // console.log(res);
            AppStorage.setResourcePermission(res);
          },
          error => {
            AppStorage.setResourcePermission(null);
            // console.log(error);
          }
        ),
        catchError(err => {
          console.log('Handling error locally and rethrowing it...', err);
          return of({});
        })
      );
  }
}

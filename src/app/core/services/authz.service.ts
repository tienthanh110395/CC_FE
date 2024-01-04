import { HelperService } from '@app/shared/services/helper.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from './basic.service';
import { Observable, of } from 'rxjs';
import { environment, COMMOM_CONFIG } from '@env/environment';

@Injectable({
    providedIn: 'root'
  })
export class AuthzService extends BasicService {
    constructor(public httpClient: HttpClient, public helperService: HelperService) {
        super(COMMOM_CONFIG.HOST_KEY_CLOAK, environment.API_PATH.keycloak_permission, httpClient, helperService);
    }

    public checkPermissionResourceName(data: any): Observable<any> {
        const url = `${this.serviceUrl}`;
        return this.postRequest(url , data);
      }
}
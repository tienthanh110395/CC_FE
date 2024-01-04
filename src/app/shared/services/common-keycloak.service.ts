import { Injectable } from '@angular/core';
import { BasicService } from '../../core/services/basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment, COMMOM_CONFIG } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonKeycloakService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(
      COMMOM_CONFIG.HOST_KEY_CLOAK,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService
    );
  }

  resetPassword(userId: string, newPassword?: string) {
    const body = {
      temporary: false,
      type: 'password',
      value: newPassword
    };
    const url = `${this.serviceUrl}/auth/admin/realms/${COMMOM_CONFIG.REALMS_NAME}/users/${userId}/reset-password`;
    return this.putRequest(url, body);
  }

  lockUser(userId: string) {
    const body = {
      enabled: true
    };
    const url = `${this.serviceUrl}/auth/admin/realms/${COMMOM_CONFIG.REALMS_NAME}/users/${userId}`;
    return this.putRequest(url, body);
  }
  getListUser() {
    const url = `${this.serviceUrl}/auth/admin/realms/etc-internal/users?briefRepresentation=true&first=0&max=99999`;
    return this.getRequest(url);
  }
}

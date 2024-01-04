import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ACTION_TYPE, CommonUtils } from "@app/shared";
import { HelperService } from "@app/shared/services/helper.service";
import { environment } from "@env/environment";
import { BasicService } from "../../basic.service";

@Injectable({
  providedIn: 'root',
})
export class ResetPassLockOpenAgencyService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  getListUser(keyword: string = '', pageIndex: number, pageSize: number) {
    const url = `${this.serviceUrl}/keycloak/users?keyword=${keyword}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.getRequest(url);
  }

  getActionType(objectId?: any) {
    let params = '';
    if (objectId) {
      params = `?actObject=${objectId}`;
    }
    const url = `${this.serviceUrl}/action-types` + params;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getReason(actTypeId) {
    const url = `${this.serviceUrl}/action-reasons/${actTypeId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  lockAccountCTV(userId: string, isLock: boolean, fileBase64?: any) {
    const body = {
      enabled: isLock,
      actReasonId: 13,
      actTypeId: ACTION_TYPE.KHOA_TK_KH,
      fileBase64: fileBase64
    };
    const url = `${this.serviceUrl}/lock/ctv/${userId}`;
    return this.putRequest(url, body);
  }

  unlockAccountCTV(userId: string, isLock: boolean, fileBase64?: any) {
    const body = {
      enabled: isLock,
      actReasonId: 56,
      actTypeId: ACTION_TYPE.KH_YEUCAU_UNLOCKACC,
      fileBase64: fileBase64
    };
    const url = `${this.serviceUrl}/lock/ctv/${userId}`;
    return this.putRequest(url, body);
  }

  resetPasswordCTV(userId: string, newPassword?: string, fileBase64?: any) {
    const body = {
      value: newPassword,
      actReasonId: 63,
      fileBase64: fileBase64
    };
    const url = `${this.serviceUrl}/reset-pass/users/${userId}`;
    return this.putRequest(url, body);
  }
}

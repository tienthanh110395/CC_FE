import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ACTION_REASON, ACTION_TYPE, CommonUtils } from "@app/shared";
import { HelperService } from "@app/shared/services/helper.service";
import { environment } from "@env/environment";
import { BasicService } from "../../basic.service";

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordLockOpenAccountService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  downloadProfileByContract(profileId: number) {
    const url = `${this.serviceUrl}/customers/contracts/profiles/${profileId}/download`;
    return this.postRequestFile(url);
  }

  downloadProfileByVehicle(vehicleId: number) {
    const url = `${this.serviceUrl}/customers/contracts/vehicles/profiles/${vehicleId}/download`;
    return this.postRequestFile(url);
  }

  resetPassword(userId: string, newPassword?: string, fileBase64?: any) {
    const body = {
      value: newPassword,
      actReasonId: 63,
      fileBase64: fileBase64
    };
    const url = `${this.serviceUrl}/reset/users/${userId}`;
    return this.putRequest(url, body);
  }

  lockAccUser(userId: string, isLock: boolean, fileBase64?: any) {
    const body = {
      enabled: isLock,
      actReasonId: 13,
      actTypeId: ACTION_TYPE.KHOA_TK_KH,
      fileBase64: fileBase64
    };
    const url = `${this.serviceUrl}/lock/users/${userId}`;
    return this.putRequest(url, body);
  }
}

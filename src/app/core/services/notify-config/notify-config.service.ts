import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';

@Injectable({
  providedIn: 'root'
})
export class NotifyConfigService extends BasicService {

  constructor(
    public httpClient: HttpClient,
    public helperService: HelperService,
  ) {
    super(
      environment.serverUrl.api_cc,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService,
    );
  }


  //list nhóm phản ánh
  getNotificationConfigByType(type: number) {
    const url = `${this.serviceUrl}/get-notification-config-by-type/${type}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  //Cap nhat notify-config
  saveNotifyConfig(data: any) {
    const url = `${this.serviceUrl}/notify-config/save-notify-config`;
    return this.postRequest(url, data);
  }

}

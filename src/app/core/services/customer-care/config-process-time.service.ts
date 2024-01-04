import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonUtils } from '@app/shared';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigProcessTimeService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api_cc, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  getTreeTicketData(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/ticket-types/tree`;
    return this.getRequest(url, searchData);
  }

  getDetailTicketSla(id: any) {
    const url = `${this.serviceUrl}/ticket-sla/${id}`;
    return this.getRequest(url);
  }
}

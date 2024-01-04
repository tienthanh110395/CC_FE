import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonUtils } from '@app/shared';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';

@Injectable({
  providedIn: 'root'
})
export class AssignHandleReflectService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api_cc, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchDataReflect(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/tickets-not-assign`;
    return this.getRequest(url, { params: buildParams });
  }

  searchUserHandle(keyword: string = '', pageIndex?: number, pageSize?: number) {
    const url = `${this.serviceUrl}/ticket-site-users?keySearch=${keyword}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.getRequest(url);
  }

  assignHandleReflect(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/ticket-process-shares`;
    return this.postRequest(url, searchData);
  }

  exportExcelTicketNotAssign(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/tickets-not-assign/exports`;
    return this.postRequestFile2(url, searchData);
  }
}

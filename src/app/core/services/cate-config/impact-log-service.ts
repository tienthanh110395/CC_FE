import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
  providedIn: 'root',
})
export class ImpactLogService extends BasicService {

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

  //tim kiem
  doSearch(data: any) {
    const url = `${this.serviceUrl}/search-data-impact`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }

  //lay du lieu chi tiet
  searchActionAuditDetail(actionAuditId?: any, startRecord?: number, pageSize?: number) {
    const url = `${this.serviceUrl}/action-audit-details/${actionAuditId}?startrecord=${startRecord}&pagesize=${pageSize}`;
    return this.getRequest(url);
  }

  //export excel
  exportExcel(data?: any) {
    const headers = new Headers;
    headers.append('Access-Control-Allow-Origin', '*');
    return this.postRequestFile2(`${this.serviceUrl}/export-impact-log`, data);
  }
}

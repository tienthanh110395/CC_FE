import { Injectable } from '@angular/core';
import { BasicService } from '../../core/services/basic.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CommonUtils } from './common-utils.service';

@Injectable({
  providedIn: 'root',
})
export class CommonSettleService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(
      environment.serverUrl.api_settle,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService
    );
  }

  searchVehicleTransactions(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/transactions-vehicles`;
    return this.getRequest(url, { params: buildParams });
  }

  exportFileVehicleTransactions(data?: any) {
    const url = `${this.serviceUrl}/transactions-vehicles/export-excel`;
    let params = new HttpParams();
    Object.keys(data).forEach(function (key) {
      params = params.append(key, data[key]);
    });
    return this.postRequestFileWithLanguage(url, params);
  }
}

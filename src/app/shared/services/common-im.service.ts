import { Injectable } from '@angular/core';
import { BasicService } from '../../core/services/basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CommonUtils } from './common-utils.service';

@Injectable({
  providedIn: 'root',
})
export class CommonIMService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(
      environment.serverUrl.api_im,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService
    );
  }

  getListShops(data?: any, isCombobox?: boolean) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    let url = `${this.serviceUrl}/shops`;
    if(isCombobox){
      url = `${this.serviceUrl}/shops?isCombobox=${isCombobox}`;
    }
    return this.getRequest(url, { params: buildParams });
  }

  exportListShops(data?: any){
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/shops/exports`;
    return this.postRequestFile2(url,searchData);
  }
}

import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';

import { CommonUtils } from '@app/shared/services/common-utils.service';

@Injectable({
  providedIn: 'root'
})
export class PostAuditServiceextends extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api_post_audit, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
   }
   searchHistoryVehicle(body){
    return this.getRequest(`${this.serviceUrl}/car-transactions-vehicles-history`,{ params: this.buildParams(body) });
  }
  buildParams(body){
    this.credentials = Object.assign({}, body);
    const searchData = CommonUtils.convertData(this.credentials);
    return CommonUtils.buildParams(searchData);
     
   }
  }
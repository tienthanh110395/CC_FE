import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ACTION_TYPE } from "@app/shared/constant/common.constant";
import { CommonUtils } from "@app/shared/services/common-utils.service";
import { HelperService } from "@app/shared/services/helper.service";
import { environment } from "@env/environment";
import { BasicService } from "../../basic.service";

@Injectable({
  providedIn: 'root'
})
export class EndContractService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchCustomerInfo(inputSearch?: any) {
    const url = `${this.serviceUrl}/customer-info?inputSearch=${inputSearch}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  searchAllContracts(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts`;
    return this.getRequest(url, { params: buildParams });
  }

  endContracts(data: any, customerId?: number) {
    data.actTypeId = ACTION_TYPE.CHAM_DUT_HD;
    const url = `${this.serviceUrl}/customers/${customerId}/contracts`;
    return this.putRequest(url, data);
  }
}

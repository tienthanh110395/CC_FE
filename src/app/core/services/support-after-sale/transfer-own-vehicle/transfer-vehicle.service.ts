import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CommonUtils } from "@app/shared/services/common-utils.service";
import { HelperService } from "@app/shared/services/helper.service";
import { environment } from "@env/environment";
import { BasicService } from "../../basic.service";

@Injectable({
  providedIn: 'root',
})
export class TransferVehicleService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchContractInfo(inputSearch?: any) {
    const url = `${this.serviceUrl}/contracts-info?inputSearch=${inputSearch}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
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

  searchVehiclesAssignRFID(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/vehicles/assigned-rfid`;
    return this.getRequest(url, { params: buildParams });
  }

  transferVehicle(body) {
    const url = `${this.serviceUrl}/transfer-vehicles`;
    return this.putRequest(url, body);
  }
}

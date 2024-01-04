import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ACTION_TYPE, STATUS_CONTRACT } from "@app/shared/constant/common.constant";
import { CommonUtils } from "@app/shared/services/common-utils.service";
import { HelperService } from "@app/shared/services/helper.service";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { BasicService } from "../../basic.service";

@Injectable({
  providedIn: 'root'
})
export class DetachContractService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  public findOne(id: number, controller?: any): Observable<any> {
    const url = `${this.serviceUrl}${controller}/${id}`;
    return this.getRequest(url);
  }

  searchCustomerInfo(inputSearch?: any) {
    const url = `${this.serviceUrl}/customer-info?inputSearch=${inputSearch}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  searchContractInfo(inputSearch?: any, getAll?: boolean) {
    let url = '';
    if (!getAll) {
      url = `${this.serviceUrl}/contracts-info?inputSearch=${inputSearch}&status=${STATUS_CONTRACT.HOATDONG}`;
    } else {
      url = `${this.serviceUrl}/contracts-info?inputSearch=${inputSearch}&getAll=${getAll}`;
    }
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  searchVehiclesAssignRFID(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/vehicles/assigned-rfid`;
    return this.getRequest(url, { params: buildParams });
  }

  splitContracts(data?: any, customerId?: number, contractId?: number) {
    data.actTypeId = ACTION_TYPE.TACH_HD;
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/split-contracts`;
    return this.putRequest(url, data);
  }
}

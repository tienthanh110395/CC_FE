import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {CommonUtils} from "@app/shared/services/common-utils.service";
import {HelperService} from "@app/shared/services/helper.service";
import {environment} from "@env/environment";
import {Observable} from "rxjs";
import {BasicService} from "../../basic.service";

@Injectable({
  providedIn: 'root'
})
export class ChangeInfoCustomerContractVehicle extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  updateCustomerPersonal(customerId, body) {
    const url = `${this.serviceUrl}/customer-personal/${customerId}`;
    return this.putRequest(url, body);
  }

  public getVietMapDetails(contractId: any): Observable<any> {
    const url = `${this.serviceUrl}/vietmap/link/info-by-service-code?serviceCode=VML_SERVICE&contractId=${contractId}`;
    return this.getRequest(url);
  }

  updateCustomerEnterprise(customerId, body) {
    const url = `${this.serviceUrl}/customer-enterprise/${customerId}`;
    return this.putRequest(url, body);
  }

  getDetailCustomer(customerId: number) {
    const url = `${this.serviceUrl}/customers/${customerId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  public findOne(id: number, controller?: any): Observable<any> {
    const url = `${this.serviceUrl}${controller}/${id}`;
    return this.getRequest(url);
  }

  connectExistsViettelPay(contractId) {
    const url = `${this.serviceUrl}/contract-payments/${contractId}`;
    return this.getRequest(url);
  }

  getBalance(customerId, contractId) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/ocsInfo`;
    return this.getRequest(url);
  }

  updateContract(body: any, customerId: number, contractId: number) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  getMember(accountUser: string) {
    const url = `${this.serviceUrl}/topup-ctv/members?accountUser=${accountUser}`;
    return this.getRequest(url);
  }

  getDocumentByActionandStatus(actTypeId: number, status?: number) {
    const url = `${this.serviceUrl}/act-type-mapping?actTypeId=${actTypeId}&status=${status}`
    return this.getRequest(url);
  }

  downloadFileNew(id: any) {
    const url = `${this.serviceUrl}/ticket-attachment/${id}/download`;
    return this.postRequestFile2(url);
  }

  viewFileNew(id: any) {
    const url = `${this.serviceUrl}/ticket-attachment/${id}/view`;
    return this.getRequest(url);
  }

  getVehicleRegistry(plateNumber) {
    const url = `${this.serviceUrl}/vehicles/registry-info/${plateNumber}`;
    return this.getRequest(url);
  }

  getVehicleGroupType(data: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/vehicle-groups/mapping/type`;
    return this.getRequest(url, {params: buildParams});
  }
}

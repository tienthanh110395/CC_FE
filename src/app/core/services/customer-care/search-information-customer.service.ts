import {Injectable} from '@angular/core';
import {BasicService} from '../basic.service';
import {HttpClient} from '@angular/common/http';
import {HelperService} from '@app/shared/services/helper.service';
import {environment} from '@env/environment';

import {CommonUtils} from '@app/shared/services/common-utils.service';

@Injectable({
  providedIn: 'root'
})
export class SearchInformationCustomerService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchAllCustomers(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers`;
    return this.getRequest(url, {params: buildParams});
  }

  warningAuditVietMap(data?) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/vietmap/warning-audit`;
    return this.getRequest(url, {params: buildParams});
  }

  vietmapDetails(warningAuditId: number) {
    const url = `${this.serviceUrl}/vietmap/warning-audit/detail?warningAuditId=${warningAuditId}`;
    return this.getRequest(url);
  }

  // exportVietMap(fromDate, toDate) {
  //   const url = `${this.serviceUrl}/vietmap/warning-audit/export?fromDate=${fromDate}&toDate=${toDate}`;
  //   return this.postRequestFile2(url);
  // }

  exportVietMap(formData: any) {
    let params = "?";
    for(const key in formData) {
      if(formData[key] != null && formData[key] != undefined){
        params += key + "=" + formData[key] + "&";
      }
    }
    const url = `${this.serviceUrl}/vietmap/warning-audit/export${params}`;
    return this.postRequestFile2(url);
  }

  searchInfoCustomer(body) {
    return this.getRequest(`${this.serviceUrl}/cc/customers/contracts`, {params: this.buildParams(body)});
  }

  searchVehicleNotTagged(contractId, body) {
    return this.getRequest(`${this.serviceUrl}/customers/contracts/${contractId}/vehicles/not-assign-rfid`, {params: this.buildParams(body)});
  }

  searchTaggedMedia(contractId, body) {

    return this.getRequest(`${this.serviceUrl}/customers/contracts/${contractId}/vehicles/find-assigned-rfid`, {params: this.buildParams(body)});
  }

  attachedFile(contractId, body) {
    return this.getRequest(`${this.serviceUrl}/customers/contracts/${contractId}/profiles`, {params: this.buildParams(body)});
  }

  searchContractProfiles(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/profiles`;
    return this.getRequest(url, {params: buildParams});
  }

  searchVehicleProfiles(data?: any, vehicleId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/vehicles/${vehicleId}/profiles`;
    return this.getRequest(url, {params: buildParams});
  }

  downloadAttachedFile(id) {
    return this.postRequestFile2(`${this.serviceUrl}/customers/contracts/profiles/${id}/download`);
  }

  downloadProfileByContract(profileId: number) {
    const url = `${this.serviceUrl}/customers/contracts/profiles/${profileId}/download`;
    return this.postRequestFile(url);
  }

  viewFile(id) {
    return this.postRequest(`${this.serviceUrl}/customers/contracts/vehicles/profiles/${id}/download`);
  }

  searchImpactHistory(custId, contractId, body) {
    return this.getRequest(`${this.serviceUrl}/cc/customers/${custId}/contracts/${contractId}/act-histories`, {params: this.buildParams(body)});
  }

  exportExcelImpactHistory(body) {
    return this.postRequestFile2(`${this.serviceUrl}/cc/action-histories/exports`, body);
  }

  detailCustomer(body) {
    return this.getRequest(`${this.serviceUrl}/cc/customers`, {params: this.buildParams(body)});
  }

  getListVehicle(contractId, body?: any) {
    this.credentials = Object.assign({}, body);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/cc/customers/contracts/${contractId}`;
    return this.getRequest(url, {params: buildParams});
  }

  detailVehicle(vehicleId) {
    return this.getRequest(`${this.serviceUrl}/customers/contracts/vehicles/${vehicleId}`);
  }

  getListFileVehicle(vehicleId) {
    return this.getRequest(`${this.serviceUrl}/customers/contracts/vehicles/${vehicleId}/profiles`);
  }

  downloadFileVehicle(id) {
    return this.postRequestFile2(`${this.serviceUrl}/customers/contracts/vehicles/profiles/${id}/download`);
  }

  downloadProfileByVehicle(vehicleId: number) {
    const url = `${this.serviceUrl}/customers/contracts/vehicles/profiles/${vehicleId}/download`;
    return this.postRequestFile(url);
  }

  viewFileVehicle(id) {
    return this.postRequest(`${this.serviceUrl}/customers/contracts/vehicles/profiles/${id}/download`);
  }

  searchImpactHistoryVehicle(custId, contractId, vehicleId, body) {
    return this.getRequest(`${this.serviceUrl}/customers/${custId}/contracts/${contractId}/vehicles/${vehicleId}/act-vehicle-histories`, {params: this.buildParams(body)});
  }

  exportExcelImpactHistoryVehicle(body) {
    return this.postRequestFile2(`${this.serviceUrl}/vehicles/action-histories/exports`, body)
  }

  searchHistoryRFID(vehicleId, body) {

    return this.getRequest(`${this.serviceUrl}/cc/vehicles/${vehicleId}/rfid-vehicle-histories`, {params: this.buildParams(body)});
  }

  exportExcelHistoryRFID(vehicleId, body) {
    return this.postRequestFile2(`${this.serviceUrl}/cc/vehicles/${vehicleId}/action-histories-rfid/exports`, body)
  }

  searchTicketPurchaseHistoris(vehicleId, body) {
    return this.getRequest(`${this.serviceUrl}/vehicles/${vehicleId}/ticket-purchase-histories`, {params: this.buildParams(body)});
  }

  exportExcelTicketPurchaseHistoris(vehicleId, body) {
    return this.getRequestFile(`${this.serviceUrl}/vehicles/${vehicleId}/ticket-purchase-histories/export`, {params: this.buildParams(body)});
  }

  searchHistotyTransactionOther(contractId, body) {
    return this.getRequest(`${this.serviceUrl}/cc/contracts/${contractId}/other-transaction-histories`, {params: this.buildParams(body)});
  }

  exportExcelHistotyTransactionOther(contractId, body) {
    return this.getRequestFile(`${this.serviceUrl}/cc/contracts/${contractId}/other-transaction-histories/export`, {params: this.buildParams(body)});
  }

  searchImpactHistoryAndReflection(custId, contractId, body) {
    return this.getRequest(`${this.serviceUrl}/cc/customers/${custId}/contracts/${contractId}/act-histories-contract`, {params: this.buildParams(body)});
  }

  exportExcelImpactHistoryAndReflection(body) {
    return this.postRequestFile2(`${this.serviceUrl}/cc/vehicles/act-histories-contract/exports`, body);
  }

  getSurplusAccount(customerId, contractId) {
    return this.getRequest(`${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/ocsInfo`);
  }

  buildParams(body) {
    this.credentials = Object.assign({}, body);
    const searchData = CommonUtils.convertData(this.credentials);
    return CommonUtils.buildParams(searchData);

  }
}

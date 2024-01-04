import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../../core/services/basic.service';
import { CommonUtils } from './common-utils.service';

@Injectable({
  providedIn: 'root',
})
export class CommonCRMService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(
      environment.serverUrl.api,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService
    );
  }

  // Danh sách loại khách hàng
  getListCustomerType() {
    const url = `${this.serviceUrl}/customer-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Lấy theo loại tác động
  getListDocumentTypeObject(actObjTypeId) {
    const url = `${this.serviceUrl}/document-types?id=${actObjTypeId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getReason(actTypeId) {
    const url = `${this.serviceUrl}/action-reasons/${actTypeId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getFees(actionTypeId: number) {
    const url = `${this.serviceUrl}/fees?actionTypeId=${actionTypeId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getCustomer(custId: any) {
    const url = `${this.serviceUrl}/customers/${custId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  //Danh sách loại tác động
  searchActType(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/act-type`;
    return this.getRequest(url, { params: buildParams });
  }

  getListDocumentTypeByCustomer(customerId) {
    const url = `${this.serviceUrl}/document-types/${customerId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getFeesReason(actReasonId: number) {
    const url = `${this.serviceUrl}/service-charges/act-reasons/${actReasonId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getListDocumentType() {
    const url = `${this.serviceUrl}/document-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getTicketPriceTypes() {
    const url = `${this.serviceUrl}/ticket-prices/type`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

      changePass(body: any) {
        const url = `${this.serviceUrl}/mobile/change/user`;
        return this.putRequest(url, body);
    }
}

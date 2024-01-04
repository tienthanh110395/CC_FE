import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonUtils } from '@app/shared';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';
import { WebSocketAPI } from '../websocket-api.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService extends BasicService {
  websocketUrl = environment.serverUrl.api_websocket;
  constructor(public httpClient: HttpClient, public helperService: HelperService, private _webSocketAPI: WebSocketAPI) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService, _webSocketAPI);
  }

  searchDocument(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/cc/briefcases`;
    return this.getRequest(url, { params: buildParams });
  }

  exportExcelDocument(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/cc/briefcases/export-excel`;
    return this.postRequestFile2(url, searchData);
  }

  exportPdfDocument(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/cc/briefcases/export-pdf`;
    return this.postRequestFile2(url, searchData);
  }

  getAttachementByContractId(contractId: number, data?: any) {
    const url = `${this.serviceUrl}/cc/briefcases/${contractId}/attach-files`;
    return this.getRequest(url, { params: this.buildParams(data) });
  }

  getProfileContract(contractId: number) {
    const url = `${this.serviceUrl}/contract-profile-approve?contractId=${contractId}`;
    return this.getRequest(url);
  }

  approvalOrRejectProfile(body: any) {
    const url = `${this.serviceUrl}/contract-profile-approve`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  cancleProfileApproves(contractId: number) {
    const url = `${this.serviceUrl}/cc/profile-approves/${contractId}/cancellation`;
    this.helperService.isProcessing(true);
    return this.putRequest(url);
  }

  removeScanAll(contractId, body: any) {
    const url = `${this.serviceUrl}/contracts/${contractId}/profiles`;
    return this.deleteRequest(url, body);
  }

  getListDocumentTypeofContract(contractId: number) {
    const url = `${this.serviceUrl}/cc/contracts/${contractId}/document-types`;
    return this.getRequest(url);
  }

  getListDocumentTypeofVehicle(vehicleId: number) {
    const url = `${this.serviceUrl}/cc/vehicles/${vehicleId}/document-types`;
    return this.getRequest(url);
  }
  updateDeadline(body: any) {
    const url = `${this.serviceUrl}/briefcases/contracts/update-deadline`;
    return this.putRequest(url, body);
  }
  exportExcelDocumentReport(params?: any) {
    return this.postSocketFile('exportDocumentReportExcel', `${this.websocketUrl}/cc/doucument-report/export-excel`, params);
  }
  exportPdfDocumentReport(params?: any) {
    return this.postSocketFile('exportDocumentReportPdf', `${this.websocketUrl}/cc/doucument-report/export-pdf`, params);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ACTION_TYPE, STATUS_CONTRACT } from '@app/shared/constant/common.constant';
import { CommonUtils } from '@app/shared/services/common-utils.service';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  contractRegister(customerId: number, body: any) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  updateContract(body: any, id: number, contractId: number) {
    const url = `${this.serviceUrl}/customers/${id}/contracts/${contractId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
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

  searchAllContracts(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts`;
    return this.getRequest(url, { params: buildParams });
  }
  searchDetailsContract(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}`;
    return this.getRequest(url, { params: buildParams });
  }

  searchAllContractsByCustomer(data?: any, customerId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/${customerId}/contracts`;
    return this.getRequest(url, { params: buildParams });
  }


  searchContractProfiles(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/profiles`;
    return this.getRequest(url, { params: buildParams });
  }

  searchActionContractHistories(data?: any, customerId?: number, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/act-contract-histories`;
    return this.getRequest(url, { params: buildParams });
  }

  mergeContracts(data?: any, customerId?: number, contractId?: number) {
    data.actTypeId = ACTION_TYPE.GOP_HD;
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/merges`;
    return this.putRequest(url, data);
  }

  downloadProfileByContract(profileId: number) {
    const url = `${this.serviceUrl}/customers/contracts/profiles/${profileId}/download`;
    return this.postRequestFile(url);
  }

  splitContracts(data?: any, customerId?: number, contractId?: number) {
    data.actTypeId = ACTION_TYPE.TACH_HD;
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/split-contracts`;
    return this.putRequest(url, data);
  }

  appendixContracts(data?: any, customerId?: number, contractId?: number) {
    data.actTypeId = ACTION_TYPE.KYPHULUCHOPDONG;
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/append-contacts`;
    return this.putRequest(url, data);
  }

  endContracts(data: any, customerId?: number) {
    data.actTypeId = ACTION_TYPE.CHAM_DUT_HD;
    const url = `${this.serviceUrl}/customers/${customerId}/contracts`;
    return this.putRequest(url, data);
  }
  updateProfiles(data: any, customerId: number, contractId: number) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/profiles`;
    return this.putRequest(url, data);
  }
  deleteProfiles(customerId: number, contractId: number, profileId: number) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/profiles/${profileId}`;
    return this.putRequest(url);
  }

  addContracts(data: any, customerId?: number) {
    data.actTypeId = ACTION_TYPE.KYMOIHOPDONG;
    const url = `${this.serviceUrl}/customers/${customerId}/contracts`;
    return this.postRequest(url, CommonUtils.convertData(data));
  }
  profilesAll(contractId: number, actTypeId: number) {
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/profiles/all?actTypeId=${actTypeId}`;
    return this.getRequest(url);
  }
  adjustBalance(data: any) {
    const url = `${this.serviceUrl}/contract/adjust-balances`;
    return this.postRequest(url, CommonUtils.convertData(data));
  }
  searchAdjustBalance(data: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/contract/adjust-balances`;
    return this.getRequest(url, { params: buildParams });
  }
  downloadAttachmentAdjust(id: number) {
    const url = `${this.serviceUrl}/attachments/download/${id}`;
    return this.postRequestFile2(url);
  }
}

import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Injectable({
  providedIn: 'root'
})
export class BriefCaseService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }
  /**
   * searchBriefCase
   *
   */
  searchBriefCase(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/briefcases`;
    return this.getRequest(url, { params: buildParams });
  }
  detailBrief(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/action-histories`;
    return this.getRequest(url, { params: buildParams });
  }
  approvalContract(acceptBriefcasesDTO: any) {
    const url = `${this.serviceUrl}/briefcases/approval-contract-profiles`;
    return this.putRequest(url, acceptBriefcasesDTO);
  }
  rejectContract(acceptBriefcasesDTO: any) {
    const url = `${this.serviceUrl}/briefcases/reject-contract-profiles`;
    return this.putRequest(url, acceptBriefcasesDTO);
  }
  approvalVehicle(acceptBriefcasesDTO: any) {
    const url = `${this.serviceUrl}/briefcases/approval-vehicles-profiles`;
    return this.putRequest(url, acceptBriefcasesDTO);
  }
  rejectVehicle(acceptBriefcasesDTO: any) {
    const url = `${this.serviceUrl}/briefcases/reject-vehicles-profiles`;
    return this.putRequest(url, acceptBriefcasesDTO);
  }
  additionalBriefcases(contractId: number, additionalBriefcasesDTO: any) {
    const url = `${this.serviceUrl}/briefcases/${contractId}/additional-briefcases`;
    return this.postRequest(url, additionalBriefcasesDTO);
  }
  searchProfileActionAudit(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/profile-action-audit`;
    return this.getRequest(url, { params: buildParams });
  }

  searchProfileActionAuditDetail(profileActionAuditId?: any, startRecord?: number, pageSize?: number) {
    const url = `${this.serviceUrl}/profile-action-audit-details/${profileActionAuditId}?startrecord=${startRecord}&pagesize=${pageSize}`;
    return this.getRequest(url);
  }
}

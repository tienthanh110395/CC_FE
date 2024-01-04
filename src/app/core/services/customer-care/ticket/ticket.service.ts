import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonUtils } from '@app/shared';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { AnyRecord } from 'dns';
import { BasicService } from '../../basic.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api_cc, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchTicketHistory(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/tickets/ticket-histories`;
    return this.getRequest(url, { params: buildParams });
  }

  getTicketById(ticketId: number) {
    const url = `${this.serviceUrl}/tickets/${ticketId}`;
    return this.getRequest(url);
  }

  exportExcelTicketHistory(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/tickets/ticket-histories/exports`;
    return this.postRequestFile2(url, searchData);
  }

  receiveComplain(body: any) {
    const url = `${this.serviceUrl}/tickets`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  saveAdjustCharge(body: any) {
    const url = `${this.serviceUrl}/adjust-charges`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  getHistoryProcess(data: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/tickets/ticket-histories/${data.ticketId}`;
    return this.getRequest(url, { params: buildParams });
  }

  getDetailProcess(id: any) {
    const url = `${this.serviceUrl}/ticket-processes/${id}`;
    return this.getRequest(url);
  }

  requestHandleTicket(body: any) {
    const url = `${this.serviceUrl}/ticket-assigns`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  saveTicketProcess(body: any) {
    const url = `${this.serviceUrl}/ticket-processes`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  searchTicket(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/tickets`;
    return this.getRequest(url, { params: buildParams });
  }

  exportExcelTicket(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/tickets/exports`;
    return this.postRequestFile2(url, searchData);
  }

  searchTicketAssign(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-assigns`;
    return this.getRequest(url, { params: buildParams });
  }

  exportTicketAssign(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/ticket-assigns/exports`;
    return this.postRequestFile2(url, searchData);
  }

  receiveTicketAssign(body: any) {
    const url = `${this.serviceUrl}/ticket-assigns`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  getTicketAssignById(ticketId: number, ticketAssignId: number) {
    const url = `${this.serviceUrl}/tickets/${ticketId}/ticket-assigns/${ticketAssignId}`;
    return this.getRequest(url);
  }

  saveResultProcess(body: any) {
    const url = `${this.serviceUrl}/ticket-assign-processes`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  getTicketAssignInfo(ticketId: any) {
    const url = `${this.serviceUrl}/ticket-assigns/${ticketId}`;
    return this.getRequest(url);
  }

  getAdjustChargeInfo(id: any) {
    const url = `${this.serviceUrl}/adjust-charges/${id}`;
    return this.getRequest(url);
  }

  sendSms(body: any) {
    const url = `${this.serviceUrl}/notify/sms`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  sendEmail(body: any) {
    const url = `${this.serviceUrl}/notify/email`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  sendNotify(body: any) {
    const url = `${this.serviceUrl}/notify/push`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  downloadFileNew(id: any) {
    const url = `${this.serviceUrl}/ticket-attachment/${id}/download`;
    return this.postRequestFile2(url);
  }

  viewFileNew(id: any) {
    const url = `${this.serviceUrl}/ticket-attachment/${id}/view`;
    return this.getRequest(url);
  }

  deleteFile(id: any) {
    const url = `${this.serviceUrl}/ticket-attachment/${id}`;
    return this.deleteRequest(url);
  }

  searchTicketAssignHistory(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-assign-processes`;
    return this.getRequest(url, { params: buildParams });
  }

  searchTicketAssignLog(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-assign-logs`;
    return this.getRequest(url, { params: buildParams });
  }

  addTicketAssignLog(body: any) {
    const url = `${this.serviceUrl}/ticket-assign-logs`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  addTicketAttachment(body: any) {
    const url = `${this.serviceUrl}/ticket-attachment`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  searchTicketAttachment(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-attachment`;
    return this.getRequest(url, { params: buildParams });
  }

  deleteAssignLog(id: any) {
    const url = `${this.serviceUrl}/ticket-assign-logs/${id}`;
    return this.deleteRequest(url);
  }

  deleteTicketAssign(id: any) {
    const url = `${this.serviceUrl}/ticket-assigns/${id}`;
    return this.deleteRequest(url);
  }

  updateTicket(ticketId, body: any) {
    const url = `${this.serviceUrl}/tickets/${ticketId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  searchActionAudit(ticketId?: any, startRecord?: number, pageSize?: number) {
    ;
    const url = `${this.serviceUrl}/action-audits?ticketId=${ticketId}&startrecord=${startRecord}&pagesize=${pageSize}`;
    return this.getRequest(url);
  }

  searchActionAuditDetail(actionAuditId?: any, startRecord?: number, pageSize?: number) {
    const url = `${this.serviceUrl}/action-audit-details/${actionAuditId}?startrecord=${startRecord}&pagesize=${pageSize}`;
    return this.getRequest(url);
  }

  getTicketTypes(ticketTypeId?: any) {
    const url = `${this.serviceUrl}/ticket-types?ticketTypeId=${ticketTypeId}`;
    return this.getRequest(url);
  }

  getTicketStatisticType(parentId?: any) {
    this.credentials = parentId != null && parentId != undefined ? { parentId } : {};
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-statistic-type`;
    this.helperService.isProcessing(true);
    return this.getRequest(url, { params: buildParams });
  }

  getDetailTicketStatisticType(parentId?: any, status?: any) {
    const url = `${this.serviceUrl}/ticket-statistic-type?parentId=${parentId}&status=${status}`;
    return this.getRequest(url);
  }

  insertTicketStatistic(body?: any) {
    const url = `${this.serviceUrl}/ticket-statistic`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  searchTicketStatistic(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-statistic`;
    return this.getRequest(url, { params: buildParams });
  }

  exportExcelTicketStatistic(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/ticket-statistic/exports`;
    return this.postRequestFile2(url, searchData);
  }

  searchTicketReportPerformmance(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/tickets-report-performmance`;
    return this.getRequest(url, { params: buildParams });
  }

  editTicket(ticketId, body: any) {
    const url = `${this.serviceUrl}/ticket/${ticketId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  exportExcelTicketProcess(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/ticket-processes/exports`;
    return this.postRequestFile2(url, searchData);
  }

  getTicketExtentReason() {
    return this.getRequest(`${this.serviceUrl}/ticket-extent-reasons`);
  }

  getTicketSiteUser() {
    return this.getRequest(`${this.serviceUrl}/ticket-sites-user`);
  }

  addTicketExtent(body?: any) {
    const url = `${this.serviceUrl}/ticket-extents`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  editTicketExtent(ticketId, body?: any) {
    const url = `${this.serviceUrl}/ticket-extents/${ticketId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  getDetailTicketExtent(id: any) {
    const url = `${this.serviceUrl}/ticket-extents/${id}`;
    return this.getRequest(url);
  }

  searchTicketType(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/tickets-type`;
    return this.getRequest(url, { params: buildParams });
  }

  getDetailTicketType(id: any) {
    const url = `${this.serviceUrl}/ticket-type/${id}`;
    return this.getRequest(url);
  }

  addTicketType(body?: any) {
    const url = `${this.serviceUrl}/tickets-type`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  editTicketType(ticketTypeId, body?: any) {
    const url = `${this.serviceUrl}/tickets-type/${ticketTypeId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  deleteTicketType(id: any) {
    const url = `${this.serviceUrl}/tickets-type/${id}`;
    return this.deleteRequest(url);
  }

  searchTicketApprove(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-extents`;
    return this.getRequest(url, { params: buildParams });
  }

  approveTicketStatus(body?: any) {
    const url = `${this.serviceUrl}/ticket-extents/approve`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  rejectTicketStatus(ticketId, body?: any) {
    const url = `${this.serviceUrl}/ticket-extents/${ticketId}/reject`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  exportExcelTicketExtent(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/ticket-extents/exports`;
    return this.postRequestFile2(url, searchData);
  }

  searchTicketErrorCause(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/category-reason-error`;
    return this.getRequest(url, { params: buildParams });
  }

  getTreeTicketErrorCause(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/category-reason-error-tree`;
    return this.getRequest(url, { params: buildParams });
  }

  exportExcelTicketReportPerformance(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/tickets-report-performmance/exports`;
    return this.postRequestFile2(url, searchData);
  }

  searchTicketExpireCause(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/category-reason-expire`;
    return this.getRequest(url, { params: buildParams });
  }

  getTreeTicketExpireCause(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/category-reason-expire-tree`;
    return this.getRequest(url, { params: buildParams });
  }

  deleteTicketErrorCause(id: any) {
    const url = `${this.serviceUrl}/category-reason-error/${id}`;
    return this.deleteRequest(url);
  }

  insertTicketErrorCause(body?: any) {
    const url = `${this.serviceUrl}/category-reason-error`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  editTicketErrorCause(ticketErrorCauseId, body?: any) {
    const url = `${this.serviceUrl}/category-reason-error/${ticketErrorCauseId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  insertTicketExpireCause(body?: any) {
    const url = `${this.serviceUrl}/category-reason-expire`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  editTicketExpireCause(ticketExpireCauseId, body?: any) {
    const url = `${this.serviceUrl}/category-reason-expire/${ticketExpireCauseId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  deleteTicketExpireCause(id: any) {
    const url = `${this.serviceUrl}/category-reason-expire/${id}`;
    return this.deleteRequest(url);
  }
}

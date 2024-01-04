import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
  providedIn: 'root',
})
export class TickeErrorService extends BasicService {

  constructor(
    public httpClient: HttpClient,
    public helperService: HelperService,
  ) {
    super(
      environment.serverUrl.api_cc,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService,
    );
  }

  //tim kiem
  doSearch(data: any) {
    const url = `${this.serviceUrl}/search-data-ticket-error-cause`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }

  // xóa nguyên nhân lỗi
  deleteTicketErorCause(ticketErrorCauseId) {
    const url = `${this.serviceUrl}/delete-error-cause/${ticketErrorCauseId}`;
    return this.deleteRequest(url);
  }

  saveOrUpdate(data: any) {
    const url = `${this.serviceUrl}/ticket-error-cause-create`;
    return this.postRequest(url, data);
  }

  //thay doi  trang thai
  changeStatusTicketErrorCause(data: any) {
    const url = `${this.serviceUrl}/change-status-ticket-error-cause`;
    return this.postRequestFile(url, data);
  }

  // thay đoi multiple trang thai
  approveChangeStatusTicketErrorCause(data: any) {
    const url = `${this.serviceUrl}/change-status-multiple-ticket-error-cause`;
    return this.postRequest(url, data);
  }

  //Chi tiết nhóm phản ánh
  getDataDetailTicketErrorCause(ticketErrorCauseId) {
    const url = `${this.serviceUrl}/data-detail/${ticketErrorCauseId}`;
    return this.getRequest(url);
  }
  // lấy list danh sách nguyên nhân lỗi
  getListTickecErrorCauseByParentId(lstParentId?: any) {
    const url = `${this.serviceUrl}/ticket-error-cause-by-id`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, lstParentId);
  }

  // Lấy list danh sách nguyên nhân lỗi màn 'Map nguyên nhân lỗi'
  getErrorCauseByParentId(lstParentId?: any, levelId?: number) {
    const url = `${this.serviceUrl}/error-cause-by-parent-id/${levelId}`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, lstParentId);
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
  providedIn: 'root',
})
export class TicketExpireCauseService extends BasicService {

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

  getTicketExpireCauseByParent(lstParentId?: any) {
    const url = `${this.serviceUrl}/get-ticket-expire-by-parent`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, lstParentId);
  }

  //tim kiem
  doSearch(data: any) {
    // const url = `${this.serviceUrl}/searchDataExpireCause`;
    const url = `${this.serviceUrl}/ticket-expire-cause/search-data`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);

  }

  //Thêm mới nguyên nhân lỗi
  saveOrUpdate(data: any) {
    // const url = `${this.serviceUrl}/saveOrUpdateTicketExpireCaZuse`;
    const url = `${this.serviceUrl}/ticket-expire-cause/save-or-update`;
    return this.postRequest(url, data);
  }

  //Chi tiết nguyen nhan loi
  getDataDetail(ticketExpireCauseId) {
    const url = `${this.serviceUrl}/get-data-detail/${ticketExpireCauseId}`;
    return this.getRequest(url);
  }

  //Xóa nguyen nhan loi
  doDeleteData(ticketExpireCauseId) {
    const url = `${this.serviceUrl}/delete-expire-cause/${ticketExpireCauseId}`;
    return this.deleteRequest(url);
  }

  //Doi trang thai nguyen nhan loi
  changeStatus(data: any) {
    const url = `${this.serviceUrl}/ticket-expire-cause/change-status`;
    return this.postRequestFile(url, data);
  }

  approveChangeStatus(data: any) {
    const url = `${this.serviceUrl}/ticket-expire-cause/change-status-multiple`;
    return this.postRequest(url, data);
  }
}

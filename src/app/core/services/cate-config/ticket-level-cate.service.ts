import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
  providedIn: 'root',
})
export class TicketLevelCateService extends BasicService {

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
  doSearch(data?: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/search-ticket-level-cate`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }
  //Xóa mức độ ưu tiên
  deleteTicketLevelCate(id) {
    const url = `${this.serviceUrl}/ticket-cate-config/delete-ticket-level-cate/${id}`;
    return this.deleteRequest(url);
  }
  //Chi tiết mức độ ưu tiên
  getDataDetail(id) {
    const url = `${this.serviceUrl}/ticket-cate-config/data-detail-level-cate/${id}`;
    return this.getRequest(url);
  }

  //lưu hoac cap nhat
  saveOrUpdate(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/save-or-update-ticket-level-cate`;
    return this.postRequest(url, data);
  }
  //thay doi trang thai
  changeStatus(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/change-status-ticket-level-cate`;
    return this.postRequestFile(url, data);
  }
  saveListTicketGroup(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/save-list-ticket-level-cate`;
    return this.postRequest(url, data);
  }

  /* get list Mức độ ưu tiên cho cấu hình thời gian xử lý */
  getTicketOtherCate() {
    const url = `${this.serviceUrl}/ticket-cate-config/get-list-ticket-other-cate`;
    return this.getRequest(url);
  }
  getTicketLevelCateById(lstLevelCateId?: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/get-list-ticket-level-cate`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, lstLevelCateId);
  }
}

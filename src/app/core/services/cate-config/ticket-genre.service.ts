import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
  providedIn: 'root',
})
export class TicketGenreService extends BasicService {

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
    const url = `${this.serviceUrl}/ticket-cate-config/search-data`;

    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }
  //lưu hoac cap nhat
  saveOrUpdate(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/save-or-update`;
    return this.postRequest(url, data);
  }
  //Xóa thể loại phản ánh
  deleteTicketGenre(ticketTypeId) {
    const url = `${this.serviceUrl}/ticket-cate-config/delete/${ticketTypeId}`;
    return this.deleteRequest(url);
  }

  //Chi tiết thể loại phản ánh
   getDataDetail(ticketTypeId) {
    const url = `${this.serviceUrl}/ticket-cate-config/data-detail/${ticketTypeId}`;
    return this.getRequest(url);
  }
  //thay doi trang thai
  changeStatus(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/change-status`;
    return this.postRequestFile(url, data);
  }
  //Them moi the loai phan anh
  saveListTicketGroup(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/save-list-ticket-group`;
    return this.postRequest(url, data);
  }

  approveChangeStatus(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/change-status-multiple`;
    return this.postRequest(url, data);
  }

  getTicketTypeByParentId(lstParentId?: any) {
    const url = `${this.serviceUrl}/ticket-cate-config/ticket-type-by-parent-id`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, lstParentId);
  }
}

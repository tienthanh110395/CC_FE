import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
  providedIn: 'root',
})

export class TicketSiteService extends BasicService {

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
    const url = `${this.serviceUrl}/ticket-site/search-data`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }

  //lưu hoac cap nhat
  saveOrUpdate(data: any) {
    const url = `${this.serviceUrl}/ticket-site/save-or-update`;
    return this.postRequest(url, data);
  }

  //list don vi chiu trach nhiem
  getTicketSite() {
    const url = `${this.serviceUrl}/ticket-site/get-ticket-site`;
    this.helperService.isProcessing(true);
    return this.postRequest(url);
  }

  //thay doi trang thai multiple
  approveChangeStatus(data: any) {
    const url = `${this.serviceUrl}/ticket-site/change-status-multiple`;
    return this.postRequest(url, data);
  }

  //thay doi trang thai
  changeStatus(data: any) {
    const url = `${this.serviceUrl}/ticket-site/change-status`;
    return this.postRequestFile(url, data);
  }

  //xoa
  doDelete(ticketSiteId: any) {
    const url = `${this.serviceUrl}/ticket-site/delete/${ticketSiteId}`;
    return this.postRequestFile(url, ticketSiteId);
  }


  //lay du lieu chi tiet
  getDataDetail(ticketSiteId: any) {
    const url = `${this.serviceUrl}/ticket-site/data-detail/${ticketSiteId}`;
    return this.getRequest(url);
  }

  getAllUserByClientId() {
    const url = `${this.serviceUrl}/ticket-site/get-all-user-by-client`;
    return this.getRequest(url);
  }

  getAllSiteUser() {
    const url = `${this.serviceUrl}/ticket-site/get-all-ticket-site-user`;
    return this.getRequest(url);
  }
}

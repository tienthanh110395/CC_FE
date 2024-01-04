import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
  providedIn: 'root',
})
export class TicketCateStatisticService extends BasicService {

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
    const url = `${this.serviceUrl}/ticket-cate-statistic/search-data-ticket-cate-statistic`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }

  //thay doi  trang thai
  changeStatusTicketCateStatistic(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-statistic/change-status-ticket-cate-statistic`;
    return this.postRequestFile(url, data);
  }

  // lấy list danh sách thống kê
  getListTickecCateStatisticByParentId(data?: any) {
    const url = `${this.serviceUrl}/ticket-cate-statistic/ticket-cate-statistic-by-id`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }

  // thay đoi multiple trang thai
  approveChangeStatusTicketStatistic(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-statistic/change-multiple-status-ticket-cate-statistic`;
    return this.postRequest(url, data);
  }

  // xóa nguyên nhân lỗi
  onDeleteStatistic(statisticTypeId) {
    const url = `${this.serviceUrl}/ticket-cate-statistic/delete-statistic/${statisticTypeId}`;
    return this.deleteRequest(url);
  }

  saveOrUpdate(data: any) {
    const url = `${this.serviceUrl}/ticket-cate-statistic/ticket-cate-statistic-create`;
    return this.postRequest(url, data);
  }

  //Chi tiết thống kê
  getDataDetailStatistic(statisticTypeId) {
    const url = `${this.serviceUrl}/ticket-cate-statistic/data-detail-statistic/${statisticTypeId}`;
    return this.getRequest(url);
  }
  //export excel
  exportExcel(data?: any) {
    const headers = new Headers;
    headers.append('Access-Control-Allow-Origin', '*');
    return this.postRequestFile2(`${this.serviceUrl}/ticket-cate-statistic/export-cate-statistic-log`, data);
  }
}

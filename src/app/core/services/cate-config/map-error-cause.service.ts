import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
  providedIn: 'root',
})
export class MapErrorCauseService extends BasicService {

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
    const url = `${this.serviceUrl}/search-data-map-error-cause`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }

  // xóa map nguyên nhân lỗi
  deleteMapErrorCause(mapErrorCauseId) {
    const url = `${this.serviceUrl}/delete-map-error-cause/${mapErrorCauseId}`;
    return this.deleteRequest(url);
  }

  saveOrUpdate(data: any) {
    const url = `${this.serviceUrl}/map-error-cause-create`;
    return this.postRequest(url, data);
  }


  getTicketTypeByParentIdForMap(parentId?: number) {
    const url = `${this.serviceUrl}/ticket-type-by-parent-id-for-map/${parentId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getDataForUpdateMapByTicketType(ticketTypeId) {
    const url = `${this.serviceUrl}/search-data-update_map-error-cause/${ticketTypeId}`;
    return this.postRequest(url);
  }

  /* Export Excel Mapping Ticket Error */
  exportExcel(data?: any) {
    const headers = new Headers;
    headers.append('Access-Control-Allow-Origin', '*');
    return this.postRequestFile2(`${this.serviceUrl}/map-error/exports`, data);
  }

  // import file price ticket
  importFileMapError(data: any) {
    const url = `${this.serviceUrl}/map-eror/import`;
    return this.postRequestFile2(url, data);
  }

  // service dowload file dữ liệu mẫu
  downloadTemplateMapError() {
    const headers = new Headers;
    headers.append('Access-Control-Allow-Origin', '*');
    return this.postRequestFile2(`${this.serviceUrl}/map-error/download-template`);
  }

  //tim kiem
  getErrorCauseByParentIdForUpdateMap(data: any) {
    const url = `${this.serviceUrl}/error-cause-by-parent-id-for-update-map`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, data);
  }

  updateMap(data: any) {
    const url = `${this.serviceUrl}/map-error-cause-update`;
    return this.postRequest(url, data);
  }


}

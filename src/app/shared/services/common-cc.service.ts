import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../../core/services/basic.service';
import { CommonUtils } from './common-utils.service';

@Injectable({
  providedIn: 'root',
})
export class CommonCCService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(
      environment.serverUrl.api_cc,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService
    );
  }

  // Danh sách loại phản ánh các cấp
  getListTicketType(parentId?: any) {
    this.credentials = parentId != null && parentId != undefined ? { parentId } : {};
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url, { params: buildParams });
  }

  // Danh sách hình thức tiếp nhận
  getListTicketSource() {
    const url = `${this.serviceUrl}/ticket-sources`;
    return this.getRequest(url);
  }

  // Danh sách đơn vị
  getListTicketSite(parentId?: any) {
    this.credentials = parentId != null && parentId != undefined ? { parentId } : {};
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-sites`;
    this.helperService.isProcessing(true);
    return this.getRequest(url, { params: buildParams });
  }

  // SLA
  getTicketSLA(data: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-slas-new`;
    this.helperService.isProcessing(true);
    return this.getRequest(url, { params: buildParams });
  }

  // Lấy thông tin user đăng nhập trong CC
  getUserInfo(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/ticket-site-user`;
    return this.getRequest(url, { params: buildParams });
  }
  /**
   * Danh mục nguyên nhân lỗi
   * @param parentId
   * @returns
   */
  getTicketErrorCause(parentId?: any) {
    const url = `${this.serviceUrl}/ticket-error-causes?parentId=${parentId}`;
    return this.getRequest(url);
  }
  /**
   * Danh mục nguyên nhân hết hạn
   * @param parentId
   * @returns
   */
  getExpireCause(parentId?: any) {
    const url = `${this.serviceUrl}/ticket-expire-causes?parentId=${parentId}`;
    return this.getRequest(url);
  }

}

import { Injectable } from '@angular/core';
import { BasicService } from '../../core/services/basic.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { CommonUtils } from './common-utils.service';

@Injectable({
  providedIn: 'root',
})
export class CommonBillingService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(
      environment.serverUrl.api_billing,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService
    );
  }

  getCustomerInvoices(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/cust-invoices`;
    return this.getRequest(url, { params: buildParams });
  }
  postInvoiceFile(custInvoiceId: number) {
    const url = `${this.serviceUrl}/cust-invoice-file/${custInvoiceId}`;
    return this.postRequestFile2(url);
  }
}

import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { CommonUtils } from '@app/shared/services/common-utils.service';
@Injectable({
  providedIn: 'root'
})
export class BillingService extends BasicService  {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api_billing, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
   }
   exportExcelInvoice(body){
    return this.postRequestFile2(`${this.serviceUrl}/cust-invoices-export`,body );
   }
   viewFileInvoice(custInvoiceId){
    return this.postRequestFile2(`${this.serviceUrl}/cust-invoice-file/${custInvoiceId}`,{} );
   }
   getInvoice(body){
    return this.getRequest(`${this.serviceUrl}/cust-invoices`,{ params: this.buildParams(body) });
   }
   buildParams(body){
    this.credentials = Object.assign({}, body);
    const searchData = CommonUtils.convertData(this.credentials);
    return CommonUtils.buildParams(searchData);
   }
}

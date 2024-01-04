import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HelperService } from "@app/shared/services/helper.service";
import { environment } from "@env/environment";
import { BasicService } from "../../basic.service";

@Injectable({
  providedIn: 'root'
})
export class UpdateCancelTicketNoRefundService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  destroyTicketNotRefund(saleTransDetailId: number, saleTransDetailDTO: any) {
    const url = `${this.serviceUrl}/ticket/destroy/not-refund/${saleTransDetailId}`;
    return this.postRequest(url, saleTransDetailDTO);
  }

  cancelAutoRenew(saleTransDetailId: number, saleTransDetailDTO: any) {
    const url = `${this.serviceUrl}/ticket/cancel/autoRenew/${saleTransDetailId}`;
    return this.postRequest(url, saleTransDetailDTO);
  }

  registerAutoRenew(saleTransDetailId: number, saleTransDetailDTO: any) {
    const url = `${this.serviceUrl}/ticket/auto-renew/${saleTransDetailId}`;
    return this.postRequest(url, saleTransDetailDTO);
  }

  searchTicketHistories(contractId: number, startRecord: any, pageSize: number) {
    const url = `${this.serviceUrl}/ticket-histories?contractId=${contractId}&startRecord=${startRecord}&pageSize=${pageSize}`;
    return this.getRequest(url);
  }

  searchContractInfo(inputSearch?: any) {
    const url = `${this.serviceUrl}/contracts-info?inputSearch=${inputSearch}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
}

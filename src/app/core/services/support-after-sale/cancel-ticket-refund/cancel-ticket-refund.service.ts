import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { STATUS_CONTRACT } from "@app/shared/constant/common.constant";
import { HelperService } from "@app/shared/services/helper.service";
import { environment } from "@env/environment";
import { BasicService } from "../../basic.service";

@Injectable({
  providedIn: 'root'
})
export class TicketPurchaseHistoryService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchContractInfo(inputSearch?: any, getAll?: boolean) {
    let url = '';
    if (!getAll) {
      url = `${this.serviceUrl}/contracts-info?inputSearch=${inputSearch}&status=${STATUS_CONTRACT.HOATDONG}`;
    } else {
      url = `${this.serviceUrl}/contracts-info?inputSearch=${inputSearch}&getAll=${getAll}`;
    }
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getTicketbyContractId(idContract: number, startRecord: number, pageSize: number) {
    const url = `${this.serviceUrl}/ticket-purchase-efficiency-histories?contractId=${idContract}&startRecord=${startRecord}&pageSize=${pageSize}`;
    return this.getRequest(url);
  }

  cancelTicket(body: any, saleTransDetailId) {
    const url = `${this.serviceUrl}/ticket/confirm/destroy/${saleTransDetailId}`;
    return this.postRequest(url, body);
  }

  destroyTicketRefund(subscriptionTicketId: number, saleTransDelBoo1DTO: any) {
    const url = `${this.serviceUrl}/ticket/destroy/refund/${subscriptionTicketId}`;
    return this.postRequest(url, saleTransDelBoo1DTO);
  }

  searchHistoryVehicleTicketRequest(contractId: number, pagesize: number, startrecord: number) {
    const url = `${this.serviceUrl}/ticket/del-boo1/${contractId}?pagesize=${pagesize}&startrecord=${startrecord}`;
    return this.getRequest(url);
  }

  getDocumentByActionandStatus(actTypeId: number, status?: number) {
    const url = `${this.serviceUrl}/act-type-mapping?actTypeId=${actTypeId}&status=${status}`
    return this.getRequest(url);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicService } from '@core/services/basic.service';
import { environment } from '@env/environment';
import { HelperService } from '@shared/services/helper.service';

@Injectable({
    providedIn: 'root',
})
export class TicketSlaService extends BasicService {
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
        const url = `${this.serviceUrl}/ticket-sla/search-data`;
        this.helperService.isProcessing(true);
        return this.postRequest(url, data);
    }

    //lưu hoac cap nhat
    saveOrUpdate(data: any) {
        const url = `${this.serviceUrl}/ticket-sla/save-or-update`;
        return this.postRequest(url, data);
    }

    //xoa
    doDelete(ticketTypeId: any) {
        const url = `${this.serviceUrl}/ticket-sla/delete-ticket-sla/${ticketTypeId}`;
        return this.deleteRequest(url);
    }

    //lay du lieu chi tiet
    getDataDetail(ticketTypeId: any) {
        const url = `${this.serviceUrl}/ticket-sla/get-data-detail/${ticketTypeId}`;
        return this.getRequest(url);
    }

    //thay doi trang thai multiple
    approveChangeStatus(data: any) {
        const url = `${this.serviceUrl}/ticket-cate-config/change-status-multiple`;
        return this.postRequest(url, data);
    }

    //thay doi trang thai
    changeStatus(data: any) {
        const url = `${this.serviceUrl}/ticket-cate-config/change-status`;
        return this.postRequestFile(url, data);
    }

    // service dowload file dữ liệu mẫu
    downloadTemplateTicketTime() {
        const headers = new Headers;
        headers.append('Access-Control-Allow-Origin', '*');
        return this.postRequestFile2(`${this.serviceUrl}/ticket-sla/download-template`);
    }

    // import file price ticket
    importFileTicketTime(data: any) {
        const url = `${this.serviceUrl}/ticket-sla/import-processing-time`;
        return this.postRequestFile2(url, data);
    }

    /* Export Excel ticket processing time config */
    exportExcel(data?: any) {
        const headers = new Headers;
        headers.append('Access-Control-Allow-Origin', '*');
        return this.postRequestFile2(`${this.serviceUrl}/ticket-sla/exports`, data);
    }

    //lưu hoac cap nhat
    updateReceptionTime(data: any) {
        const url = `${this.serviceUrl}/ticket-sla/update-reception-time`;
        return this.postRequest(url, data);
    }

    /* get list loai cau hinh thoi gian */
    getTicketTypeFordConfigTime(parentId?: number) {
        const url = `${this.serviceUrl}/ticket-sla/ticket-type-for-map-config-time/${parentId}`;
        this.helperService.isProcessing(true);
        return this.getRequest(url);
    }

    getTicketTypeFordConfigTimeDetail(ticketTypeId?: number) {
        const url = `${this.serviceUrl}/ticket-sla/ticket-type-for-config-time-detail/${ticketTypeId}`;
        this.helperService.isProcessing(true);
        return this.getRequest(url);
    }
}

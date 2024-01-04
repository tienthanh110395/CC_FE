import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RESOURCE } from '@app/core/app-config';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketPurchaseHistoryService } from '@app/core/services/support-after-sale/cancel-ticket-refund/cancel-ticket-refund.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ACTION_TYPE, BUY_TICKET, HTTP_CODE, TRANSACTION_STATUS } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cancel-ticket-refund',
  templateUrl: './cancel-ticket-refund.component.html',
  styleUrls: ['./cancel-ticket-refund.component.scss']
})
export class CancelTicketRefundComponent extends BaseComponent implements OnInit {

  constructor(
    private matDialog: MatDialog,
    private _ticketPurchaseHistoryService: TicketPurchaseHistoryService,
    private _commonCRMService: CommonCRMService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService
  ) {
    super(null, RESOURCE.CC);
  }

  contracts = [];
  index = 0;
  listDocument = [];

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'support-after-sale.detach-contract.license_plates', field: 'plateNumber' },
      { i18n: 'support-after-sale.detach-contract.stationPhase', field: 'stage' },
      { i18n: 'support-after-sale.detach-contract.type_ticket', field: 'servicePlanTypeName' },
      { i18n: 'support-after-sale.detach-contract.calculation', field: 'chargeMethodName' },
      { i18n: 'support-after-sale.detach-contract.money', field: 'price', type: 'currency' },
      { i18n: 'support-after-sale.detach-contract.register_Date', field: 'saleTransDate', type: 'datetime' },
      { i18n: 'support-after-sale.detach-contract.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'support-after-sale.detach-contract.endDate', field: 'expDate', type: 'datetime' },
      { i18n: 'support-after-sale.detach-contract.ghtd', field: 'autoRenew' },
      { i18n: 'common.status', field: 'status' },
      { i18n: 'common.action', field: 'action', type: 'actions' },
    ];
    this.buildForm();
  }

  getListDocument() {
    this._ticketPurchaseHistoryService.getDocumentByActionandStatus(ACTION_TYPE.HUY_VE_CO_HOAN_TIEN, 1).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.listDocument = res.data.listData;
      }
    });
  }

  buildForm() {
    this.formSearch = new FormGroup({
      searchContract: new FormControl(),
      documentType: new FormControl()
    });
  }

  async filter() {
    if (this.formSearch.value.searchContract.trim()) {
      const cInfo = (await this._ticketPurchaseHistoryService.searchContractInfo(this.formSearch.value.searchContract.trim(), true).toPromise());
      if (cInfo.data.listData.length > 0) {
        this.dataModel = { ...this.dataModel, ...cInfo.data.listData[0] };
        await this.getListDocumentTypeByCustomer();
        await this.getData();
      }
    }
  }

  getListDocumentTypeByCustomer() {
    this._commonCRMService.getListDocumentTypeByCustomer(this.dataModel.custTypeId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.attachType = res.data.find(x => x.id == this.dataModel.documentTypeId)?.val;
      }
    });
  }

  getData() {
    this.isLoading = true;
    this._ticketPurchaseHistoryService.getTicketbyContractId(this.dataModel.contractId, this.searchModel.startrecord, this.searchModel.pagesize).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        this.dataModel.dataSource.map(d => {
          if (d.stageId) {
            const stageInfo = AppStorage.get('stages').find(x => x.id === d.stageId);
            d.stage = stageInfo?.name;
            d.stationInId = stageInfo?.stationInId;
            d.stationOutId = stageInfo?.stationOutId;
          }
          if (d.stationId) {
            const stageInfo = AppStorage.get('stations').find(x => x.id === d.stationId);
            d.stage = stageInfo?.name;
          }
          d.autoRenew = d.autoRenew === '1' ? this._translateService.instant('common.yes') : this._translateService.instant('common.no');
          d.status = d.status === TRANSACTION_STATUS.UNPAID
            ? this._translateService.instant('exchangeHistory.unpaid') : d.status === TRANSACTION_STATUS.PAID_NO_INVOICE
              ? this._translateService.instant('exchangeHistory.paid_no_invoice') : d.status === TRANSACTION_STATUS.BILLED
                ? this._translateService.instant('exchangeHistory.billed') : this._translateService.instant('common.cancel');
          return d;
        })
        this.isLoading = false;
      }
    });
  }
  async cancel(item) {
    let mess = '';
    mess = (await this._translateService.get('cancel-ticket-refund.popup-destroy-message', { 0: item.servicePlanTypeName, 1: item.plateNumber }).toPromise());
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('cancel-ticket-refund.popup-title-header'),
      mess
    );
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          stationInId: item?.stationInId,
          stationOutId: item?.stationOutId,
          stationType: item?.stage ? BUY_TICKET.TRAM_MO : BUY_TICKET.TRAM_KIN,
        };
        this._ticketPurchaseHistoryService.cancelTicket(body, item.saleTransDetailId).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('cancel-ticket-refund.cancel-success'));
            this.getData();
          } else {
            this._toastrService.warning(this._translateService.instant(rs.mess.description));
          }
        }, (error) => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    });
  }
  changeTab(event) {
    this.index = event;
  }
}

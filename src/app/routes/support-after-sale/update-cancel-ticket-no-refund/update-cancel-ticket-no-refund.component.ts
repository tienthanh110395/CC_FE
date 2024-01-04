import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RESOURCE } from '@app/core/app-config';
import { AppStorage } from '@app/core/services/AppStorage';
import { UpdateCancelTicketNoRefundService } from '@app/core/services/support-after-sale/update-cancel-ticket-no-refund/update-cancel-ticket-no-refund.service';
import { HTTP_CODE, TRANSACTION_STATUS, ACTION_TYPE, BUY_TICKET, CommonCRMService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-update-cancel-ticket-no-refund',
  templateUrl: './update-cancel-ticket-no-refund.component.html',
  styleUrls: ['./update-cancel-ticket-no-refund.component.scss']
})
export class UpdateCancelTicketNoRefundComponent extends BaseComponent implements OnInit {

  contracts = [];

  constructor(
    private _updateCancelTicketNoRefundService: UpdateCancelTicketNoRefundService,
    private _commonCRMService: CommonCRMService,
    private _translateService: TranslateService,
    private _matDialog: MatDialog,
    private _toastrService: ToastrService
  ) {
    super(null, RESOURCE.CC);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', width: '60px' },
      { i18n: 'support-after-sale.detach-contract.license_plates', field: 'plateNumber' },
      { i18n: 'support-after-sale.detach-contract.stationPhase', field: 'stage' },
      { i18n: 'support-after-sale.detach-contract.type_ticket', field: 'servicePlanTypeName' },
      { i18n: 'support-after-sale.detach-contract.calculation', field: 'chargeMethodName' },
      { i18n: 'support-after-sale.detach-contract.money', field: 'price', type: 'currency' },
      { i18n: 'support-after-sale.detach-contract.register_Date', field: 'saleTransDate', type: 'datetime' },
      { i18n: 'support-after-sale.detach-contract.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'support-after-sale.detach-contract.endDate', field: 'expDate', type: 'datetime' },
      { i18n: 'support-after-sale.detach-contract.ghtd', field: 'autoRenew', type: 'autoRenews' },
      { i18n: 'common.status', field: 'status' },
      { i18n: 'common.action', field: 'action', type: 'actions' },
    ];
    this.buildForm();
  }

  buildForm() {
    this.formSearch = new FormGroup({
      searchContract: new FormControl(),
    });
    this.formSearch.controls.searchContract.valueChanges
      .pipe(
        debounceTime(1000),
        tap(() => {
          this.searchModel.isLoadingContract = true;
          this.contracts = [];
        }),
        switchMap(value =>
          iif(() => typeof value !== 'object', this._updateCancelTicketNoRefundService.searchContractInfo(value), null).pipe(finalize(() => (this.searchModel.isLoadingContract = false)))
        )
      )
      .subscribe(rs => {
        this.contracts = rs.data.listData;
      });
  }
  displayFn(contract: any) {
    if (contract) {
      return contract.contractNo;
    }
  }
  onSelectedContract(event) {
    this.dataModel = event.option.value;
    this.getListDocumentTypeByCustomer();
    this.getData();
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
    this._updateCancelTicketNoRefundService.searchTicketHistories(this.dataModel.contractId, this.searchModel.startrecord, this.searchModel.pagesize).subscribe(rs => {
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
            const stationInfo = AppStorage.get('stations').find(x => x.id === d.stationId);
            d.stage = stationInfo?.name;
          }
          d.status = d.status === TRANSACTION_STATUS.UNPAID
            ? this._translateService.instant('exchangeHistory.unpaid') : d.status === TRANSACTION_STATUS.PAID_NO_INVOICE
              ? this._translateService.instant('exchangeHistory.paid_no_invoice') : d.status === TRANSACTION_STATUS.BILLED
                ? this._translateService.instant('exchangeHistory.billed') : this._translateService.instant('common.cancel');
          return d;
        });
        this.isLoading = false;
      }
    });
  }
  async renew(item) {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('update-cancel-ticket-no-refund.title-popup-renew', { 0: item.servicePlanTypeName ?? '' }),
      this._translateService.instant('update-cancel-ticket-no-refund.mess-popup-renew', { 0: item.servicePlanTypeName ?? '' })
    );
    const dialogRef = this._matDialog.open(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          // actTypeId: ACTION_TYPE.HUY_VE_KHONG_HOAN_TIEN,
          // stationInId: item?.stationInId,
          // stationOutId: item?.stationOutId,
          // stationType: item?.stage ? BUY_TICKET.TRAM_MO : BUY_TICKET.TRAM_KIN,
        };
        this._updateCancelTicketNoRefundService.registerAutoRenew(item.saleTransDetailId, body).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('update-cancel-ticket-no-refund.success-renew'));
            this.getData();
          } else {
            this._toastrService.warning(this._translateService.instant(res.mess.description));
          }
        }, (error) => {
          this._toastrService.error('common.500Error');
        });
      }
    });
  }
  async cancelAutoRenew(item) {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('update-cancel-ticket-no-refund.title-popup-renew', { 0: item.servicePlanTypeName ?? '' }),
      this._translateService.instant('update-cancel-ticket-no-refund.mess-popup-cancel-renew', { 0: item.servicePlanTypeName ?? '' })
    );
    const dialogRef = this._matDialog.open(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          // actTypeId: ACTION_TYPE.HUY_VE_KHONG_HOAN_TIEN,
          // stationInId: item?.stationInId,
          // stationOutId: item?.stationOutId,
          // stationType: item?.stage ? BUY_TICKET.TRAM_MO : BUY_TICKET.TRAM_KIN,
        };
        this._updateCancelTicketNoRefundService.cancelAutoRenew(item.saleTransDetailId, body).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('update-cancel-ticket-no-refund.success-cancel-renew'));
            this.getData();
          } else {
            this._toastrService.warning(this._translateService.instant(res.mess.description));
          }
        }, (error) => {
          this._toastrService.error('common.500Error');
        });
      }
    });
  }
  async cancel(item) {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('update-cancel-ticket-no-refund.title-popup-cancel', { 0: item.servicePlanTypeName ?? '' }),
      this._translateService.instant('update-cancel-ticket-no-refund.mess-popup-cancel', { 0: item.servicePlanTypeName ?? '' })
    );
    const dialogRef = this._matDialog.open(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          actTypeId: ACTION_TYPE.HUY_VE_KHONG_HOAN_TIEN,
          stationInId: item?.stationInId,
          stationOutId: item?.stationOutId,
          stationType: item?.stage ? BUY_TICKET.TRAM_MO : BUY_TICKET.TRAM_KIN,
        };
        this._updateCancelTicketNoRefundService.destroyTicketNotRefund(item.saleTransDetailId, body).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('cancel-ticket-refund.cancel-success'));
            this.getData();
          } else {
            this._toastrService.warning(this._translateService.instant(res.mess.description));
          }
        }, (error) => {
          this._toastrService.error('common.500Error');
        });
      }
    });
  }
}

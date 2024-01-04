import { Input } from '@angular/core';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketPurchaseHistoryService } from '@app/core/services/support-after-sale/cancel-ticket-refund/cancel-ticket-refund.service';
import { HTTP_CODE, BOT_COMFIRM } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { CancelDetailComponent } from '../cancel-detail/cancel-detail.component';

@Component({
  selector: 'app-requied-refund',
  templateUrl: './requied-refund.component.html',
  styleUrls: ['./requied-refund.component.scss']
})
export class RequiedRefundComponent extends BaseComponent implements OnChanges, OnInit {

  @Input() infoContract: any;
  dataOptionStages = [];
  dataOptionStations = [];
  dataOptionTicketType = [];
  dataOptionMethodCharge = [];

  constructor(
    private _ticketPurchaseHistoryService: TicketPurchaseHistoryService,
    private _translateService: TranslateService,
    private _matDialog: MatDialog,
  ) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getData();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'support-after-sale.detach-contract.license_plates', field: 'plateNumber' },
      { i18n: 'support-after-sale.detach-contract.stationPhase', field: 'stationStagename' },
      { i18n: 'support-after-sale.detach-contract.boo', field: 'booCode' },
      { i18n: 'support-after-sale.detach-contract.type_ticket', field: 'ticketTypeName' },
      { i18n: 'support-after-sale.detach-contract.calculation', field: 'methodChargeName' },
      { i18n: 'support-after-sale.detach-contract.money', field: 'price', type: 'currency' },
      { i18n: 'support-after-sale.detach-contract.register_Date', field: 'createDate', type: 'datetime' },
      { i18n: 'common.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'common.endDate', field: 'expDate', type: 'datetime' },
      { i18n: 'support-after-sale.detach-contract.status_req', field: 'statusReq' },
      { i18n: 'support-after-sale.detach-contract.status_bot', field: 'statusBot' },
      { i18n: 'common.action', field: 'function', type: 'functions' },
    ];
  }

  request(item) {
    const dialogRef = this._matDialog.open(CancelDetailComponent, {
      width: '60%',
      data: item,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        this.getData();
      }
    });
  }

  getData() {
    this._ticketPurchaseHistoryService.searchHistoryVehicleTicketRequest(this.infoContract.contractId, this.searchModel.pagesize, this.searchModel.startrecord).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.totalRecord = res.data.count;
        this.dataModel.dataSource = res.data.listData.map(x => {
          if (x.stationId) {
            x.stationStagename = AppStorage.get('stations').find(n => n.id === x.stationId)?.name;
          } else if (x.stationId) {
            x.stationStagename = AppStorage.get('stages').find(n => n.id === x.stageId)?.name;
          }
          x.ticketTypeName = AppStorage.get('ticket').find(n => n.servicePlanTypeId === x.servicePlanTypeId)?.name;
          x.methodChargeName = AppStorage.get('methodCharge').find(n => n.code === x.methodChargeId)?.val;
          x.statusReq = x.status === BOT_COMFIRM.RECEIVED
            ? this._translateService.instant('cancel-ticket-refund.pending') : x.status === BOT_COMFIRM.SUCCESS
              ? this._translateService.instant('cancel-ticket-refund.success') : x.status === BOT_COMFIRM.REJECT
                ? this._translateService.instant('cancel-ticket-refund.denial') : '';
          x.statusBot = x.botStatus === BOT_COMFIRM.RECEIVED
            ? this._translateService.instant('cancel-ticket-refund.remaining') : x.botStatus === BOT_COMFIRM.SUCCESS
              ? this._translateService.instant('cancel-ticket-refund.yes') : x.botStatus === BOT_COMFIRM.REJECT
                ? this._translateService.instant('cancel-ticket-refund.no') : '';
          return x;
        });
      }
    });
  }
}

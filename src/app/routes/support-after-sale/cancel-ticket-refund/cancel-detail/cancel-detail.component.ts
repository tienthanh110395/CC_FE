import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketPurchaseHistoryService } from '@app/core/services/support-after-sale/cancel-ticket-refund/cancel-ticket-refund.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { ACTION_TYPE, BOT_COMFIRM, HTTP_CODE, TRANSACTION_STATUS } from '@app/shared/constant/common.constant';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cancel-detail',
  templateUrl: './cancel-detail.component.html',
  styleUrls: ['./cancel-detail.component.scss']
})
export class CancelDetailComponent extends BaseComponent implements OnInit {

  transactionStatus = TRANSACTION_STATUS;
  botComfirm = BOT_COMFIRM;
  @ViewChild('crmtable') crmTable: CrmTableComponent;
  columnProfiles = [];

  constructor(
    private _ticketPurchaseHistoryService: TicketPurchaseHistoryService,
    private _toastrService: ToastrService,
    private _translateService: TranslateService,
    private _dialogRef: MatDialogRef<CancelDetailComponent>,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
  ) {
    super();
    this.dataModel.dataSourceProfile = [];
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      { i18n: 'customer-care.search-information-customer.stage_station', field: 'stationStagename' },
      { i18n: 'exchangeHistory.type_ticket', field: 'ticketTypeName' },
      { i18n: 'exchangeHistory.money', field: 'price', type: 'currency' },
      { i18n: 'support-after-sale.detach-contract.register_Date', field: 'createDate', type: 'datetime' },
      { i18n: 'common.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'common.endDate', field: 'expDate', type: 'datetime' },
      { i18n: 'common.status', field: 'status', type: 'statusCustom' },
    ];
    this.columnProfiles = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'actions', type: 'actionCustom' },
    ]
    this.buildForm();
    this.getData();
  }
  buildForm() {
    this.formSearch = new FormGroup({
      botComfirm: new FormControl(Validators.required),
      reason: new FormControl('', Validators.required),
      documentNumber: new FormControl(),
      refundDate: new FormControl(new Date(), Validators.required),
    });
  }
  getData() {
    this.dataModel.dataSource = [];
    this.dataModel.dataSource.push(this.dataDialog);
  }
  save() {
    const body = {
      botStatus: Number(this.formSearch.controls.botComfirm.value),
      actTypeId: ACTION_TYPE.HUY_VE_CO_HOAN_TIEN,
      botConfirmContent: this.formSearch.controls.reason.value,
      botConfirmDate: this.formSearch.controls.refundDate.value
    };
    this._ticketPurchaseHistoryService.destroyTicketRefund(this.dataDialog.subscriptionTicketId, body).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('cancel-ticket-refund.cancel-success'));
        this.dialogRef.close(true);
      } else {
        this._toastrService.warning(this._translateService.instant(rs.mess.description));
      }
    });
  }

  chooseFileChange() {
    this.chooseFileModal(AttachFileComponent);
  }

  chooseFileModal(componentTemplate?) {
    const dialog = this.matDialog.open(componentTemplate,
      {
        width: '600px',
        data: { isMultil: false }
      }
    );
    dialog.afterClosed().subscribe(res => {
      res.forEach(file => {
        const license = {
          fileName: file.fileName,
          base64Data: file.fileBase64,
        };
        this.dataModel.dataSourceProfile.push(license);
      });
      this.crmTable.renderTable();
      this.dataModel.totalRecordProfile = this.dataModel.dataSourceProfile.length;
    });
  }
  removeSelectedFile(i) {
    this.dataModel.dataSourceProfile.splice(i, 1);
    this.crmTable.renderTable();
  }
  getHeightProfile(source) {
    if (source) {
      if (source.length > 4) {
        return '250px';
      } else {
        return 'fit-content';
      }
    }
  }
}

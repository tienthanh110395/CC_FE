import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CC_PRIORITY, CC_TICKET_STATUS, CommonCRMService, HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { TicketHistoryDetailComponent } from './detail/detail.component';
import { TicketEditHistoryComponent } from './ticket-edit-history/ticket-edit-history.component';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-ticket-history',
  templateUrl: './ticket-history.component.html',
  styleUrls: ['./ticket-history.component.scss']
})
export class TicketHistoryComponent extends BaseComponent implements OnInit {

  @Input() data: any = {};
  priorityList = [
    { value: CC_PRIORITY.NORMAL, label: this._translateService.instant('customer-care.dropdown.priority.normal') },
    { value: CC_PRIORITY.HOT, label: this._translateService.instant('customer-care.dropdown.priority.hot') },
    { value: CC_PRIORITY.VIP, label: this._translateService.instant('customer-care.dropdown.priority.vip') }
  ];
  ticketSourceList = [
    { value: 0, label: "Facebook" },
    { value: 1, label: "Email" },
    { value: 2, label: "Chat" },
    { value: 3, label: "Web" }
  ];
  ticketTypeLv1List = [];
  ticketTypeLv2List = [];
  ticketTypeLv3List = [];
  ticketStatusList = [
    { value: CC_TICKET_STATUS.TAO_MOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.new') },
    { value: CC_TICKET_STATUS.DANG_XU_LY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.process') },
    { value: CC_TICKET_STATUS.XU_LY_XONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.doneProcess') },
    { value: CC_TICKET_STATUS.DONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.close') },
    { value: CC_TICKET_STATUS.HUY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.cancel') },
    { value: CC_TICKET_STATUS.THEO_DOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.follow') }
  ];
  provinceList = [];
  districtList = [];
  communeList = [];

  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    public dialog: MtxDialog,
    private matDialog: MatDialog,
    private _ticketService: TicketService,
    private _commonCRMService: CommonCRMService
  ) {
    super();
    this.formSearch = this.fb.group({
      impactDateFrom: [],
      impactDateTo: [],
      startDate: [''],
      endDate: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-cc.ticketCode', field: 'ticketId' },
      { i18n: 'customer-care.search-cc.ticketTypeLv1', field: 'groupPA' },
      { i18n: 'customer-care.search-cc.ticketTypeLv3', field: 'detailPA' },
      { i18n: 'customer-care.search-cc.ticketContent', field: 'contentReceive' },
      { i18n: 'customer-care.ticket-history.processStatus', field: 'ticketStatus' },
      { i18n: 'customer-care.ticket.ticketTimes', field: 'ticketTimes', width: '100px', class: 'ui-text-center' },
      { i18n: 'customer-care.ticket-history.recieveDate', field: 'receiveDate' },
      { i18n: 'customer-care.search-cc.ticketClosedDate', field: 'concludeDate' },
      { i18n: 'customer-care.search-cc.receiveUser', field: 'receiveUser' },
      { i18n: 'customer-care.ticket-history.closedTicketUser', field: 'concludeUserName' },
      { i18n: 'common.detail', field: 'detail' },
    ];
    super.mapColumn();
    this.searchTicketHistory();
  }

  searchTicketHistory() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      this.formSearch.controls.startDate.setValue(
        this.formSearch.controls.impactDateFrom.value ? format(this.formSearch.controls.impactDateFrom.value, COMMOM_CONFIG.DATE_FORMAT) : null
      );
      this.formSearch.controls.endDate.setValue(
        this.formSearch.controls.impactDateTo.value ? format(this.formSearch.controls.impactDateTo.value, COMMOM_CONFIG.DATE_FORMAT) : null
      );
      let searchObj = Object.assign({}, this.formSearch.value);
      for (const item in searchObj) {
        if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
          delete searchObj[item]
        }
      }
      if (this.formSearch.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this.handleValidSearchObject(searchObj);
      this._ticketService.searchTicketHistory(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoading = false;
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, error => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.searchTicketHistory();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.searchTicketHistory();
  }

  exportFile() {
    if (this.formSearch.valid) {
      this.formSearch.controls.startDate.setValue(
        this.formSearch.controls.impactDateFrom.value ? format(this.formSearch.controls.impactDateFrom.value, COMMOM_CONFIG.DATE_FORMAT) : null
      );
      this.formSearch.controls.endDate.setValue(
        this.formSearch.controls.impactDateTo.value ? format(this.formSearch.controls.impactDateTo.value, COMMOM_CONFIG.DATE_FORMAT) : null
      );
      const searchModelExcel = Object.assign({}, this.formSearch.value);
      this.handleValidSearchObject(searchModelExcel);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this._ticketService.exportExcelTicketHistory(searchModelExcel).subscribe(
        res => {
          const contentDisposition = res.headers.get('content-disposition');
          const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
          saveAs(res.body, filename);
        },
        err => {
          this.toastr.warning(this.translateService.instant('common.notify.fail'));
        }
      );
    }
  }

  handleValidSearchObject(object: any) {
    object.contractNo = this.data?.length > 0 && this.data[0].listContract?.length > 0 ? this.data[0].listContract[0].contractNo : null;
    delete object.impactDateFrom;
    delete object.impactDateTo;
  }

  viewTicket(item: any) {
    this._ticketService.getTicketById(item.ticketId).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        const data = rs.data || null;
        if (data) {
          this._commonCRMService.getCustomer(data.custId).subscribe(rs => {
            if (rs.mess.code == HTTP_CODE.SUCCESS) {
              const customer = rs.data.listData && rs.data.listData.length > 0 ? rs.data.listData[0] : null;
              const dialogRef = this.dialog.originalOpen(TicketHistoryDetailComponent, {
                width: '80%',
                data: Object.assign({}, customer, data),
                disableClose: true
              });
            } else {
              this._toastrService.error(rs.mess.description);
            }
          }, error => {
            this._toastrService.error(this._translateService.instant('common.500Error'));
          });
        }
      } else {
        this._toastrService.error(rs.mess.description);
      }
    }, error => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  showStatusName(value: number): string {
    const status = this.ticketStatusList.find(item => item.value + '' === value + '');
    if (status) return status.label;
    // nếu không có return về open
    return this._translateService.instant('customer-care.dropdown.ticketStatus.open');
  }

  checkFormatDate(value: string): boolean {
    if (!value) return false;
    if (!(/^\d{2}\/\d{2}\/\d{4}$/.test(value))) return true;
    let parts = value.split("/");
    let day = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    let year = parseInt(parts[2]);

    if (day === NaN || month === NaN || year === NaN) return true;

    return false;
  }

  openEditTicket(row) {
    const dialogRef = this.matDialog.open(
      TicketEditHistoryComponent,
      {
        width: '2500px',
        panelClass: 'my-dialog',
        disableClose: true,
        data: row,
      }
    );
    dialogRef.afterClosed().subscribe(rs => {
      if (row) {
        this.onSearch();
      } else {
        this.getData();
      }
    });
  }
}

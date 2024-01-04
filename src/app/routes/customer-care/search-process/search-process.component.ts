import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { RESOURCE } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { HTTP_CODE, TICKET_ASSIGN_STATUS } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { UpdateAssignProcessComponent } from './update-assign-process/update-assign-process.component';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-search-process',
  templateUrl: './search-process.component.html',
  styleUrls: ['./search-process.component.scss']
})
export class SearchProcessComponent extends BaseComponent implements OnInit {

  statusList = [
    { value: TICKET_ASSIGN_STATUS.NEW, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.new') },
    // { value: TICKET_ASSIGN_STATUS.CANCEL, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.cancel') },
    { value: TICKET_ASSIGN_STATUS.REJECT, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.reject') },
    { value: TICKET_ASSIGN_STATUS.RECEIVE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.receive') },
    // { value: TICKET_ASSIGN_STATUS.CONCLUDE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.conclude') },
    // { value: TICKET_ASSIGN_STATUS.COMPLETE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.complete') },
    { value: TICKET_ASSIGN_STATUS.CLOSE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.close') }
  ];
  isEdit: boolean = false;
  @ViewChild('updateProcess') updateProcess: UpdateAssignProcessComponent;
  objectEdit: any = {};
  @ViewChild('allStatus') private allStatus: MatOption;

  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    public dialog: MtxDialog,
    private _ticketService: TicketService,
  ) {
    super(_ticketService, RESOURCE.CC_CUSTOMER, _toastrService, _translateService);
    this.formSearch = this.fb.group({
      startReceiveDate: [null],
      endReceiveDate: [null],
      startProcessDate: [null],
      endProcessDate: [null],
      ticketId: [''],
      ticketStatus: [],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'common.action', field: 'action', type: 'actionCustom' },
      { i18n: 'customer-care.search-cc.ticketCode', field: 'ticketId' },
      { i18n: 'customer-care.search-cc.plateNumber', field: 'plateNumber' },
      { i18n: 'customer-care.search-cc.contractNo', field: 'contractNo' },
      { i18n: 'customer-care.search-cc.ticketContent', field: 'contentReceive' },
      { i18n: 'customer-care.search-cc.reasonLevel1', field: 'ticketErrorCauseIdL1Name' },
      { i18n: 'customer-care.search-cc.reasonLevel2', field: 'ticketErrorCauseIdL2Name' },
      { i18n: 'customer-care.search-cc.reasonLevel3', field: 'ticketErrorCauseIdL3Name' },
      { i18n: 'customer-care.search-process.status', field: 'ticketStatus', type: 'ticketStatus' },
      { i18n: 'customer-care.search-cc.assignDate', field: 'createDate' },
      { i18n: 'customer-care.search-cc.resolveDate', field: 'processTime' },
      { i18n: 'customer-care.search-cc.staffName', field: 'userProcess' },
      { i18n: 'customer-care.search-cc.progress', field: 'txtProcessTicket' },
      { i18n: 'customer-care.search-cc.timeProgress', field: 'hourProcessTicket' },
      { i18n: 'customer-care.search-cc.contentProgress', field: 'processContent' },
      { i18n: 'customer-care.search-cc.processUnit', field: 'toSiteName' },
      { i18n: 'customer-care.search-cc.assignUnit', field: 'assignUnit' },
      { i18n: 'customer-care.search-cc.responsibleUnit', field: 'fromSiteName' },
      // { i18n: 'customer-care.search-cc.processContent', field: 'processContent' },
    ];
    super.mapColumn();
    this.searchTicketAssign();
  }

  handleProcessAction(item: any, action: string) {
    if (action === 'delete') {
      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        width: '30%',
        data: {
          title: this._translateService.instant('common.confirm.title.delete'),
          message: this._translateService.instant('common.confirm.delete')
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this._ticketService.deleteTicketAssign(item.ticketAssignId).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.searchTicketAssign();
              this._toastrService.success(this._translateService.instant('common.notify.delete.success'));
            } else {
              this._toastrService.error(res.mess.description);
            }
          }, err => {
            this._toastrService.error(this._translateService.instant('common.500Error'));
          });
        }
      });
    } else if (action === 'process') {
      this._ticketService.getTicketAssignById(item.ticketId, item.ticketAssignId).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          const data = rs.data.listData ? rs.data.listData[0] : null;
          if (data) {
            this.objectEdit = data;
            this.isEdit = true;
          }
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, error => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.formSearch.controls.ticketStatus.value.length == this.statusList.length) {
      this.allStatus.select();
    }
  }

  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.formSearch.controls.ticketStatus.setValue([...this.statusList, -1]);
    } else {
      this.formSearch.controls.ticketStatus.setValue([]);
    }
  }

  searchTicketAssign() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      let searchObj = Object.assign({}, this.formSearch.value);
      for (const item in searchObj) {
        if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
          delete searchObj[item]
        }
      }
      if (this.formSearch.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this.setValueToObject(searchObj);
      this._ticketService.searchTicketAssign(searchObj).subscribe(rs => {
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
    this.searchTicketAssign();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.searchTicketAssign();
  }

  exportFile() {
    if (this.formSearch.valid) {
      const searchModelExcel = Object.assign({}, this.formSearch.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._ticketService.exportTicketAssign(searchModelExcel).subscribe(
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

  setValueToObject(searchObj: any) {
    if (searchObj.startReceiveDate) {
      searchObj.startReceiveDate = format(searchObj.startReceiveDate, COMMOM_CONFIG.DATE_FORMAT);
    } else {
      delete searchObj.startReceiveDate;
    }
    if (searchObj.endReceiveDate) {
      searchObj.endReceiveDate = format(searchObj.endReceiveDate, COMMOM_CONFIG.DATE_FORMAT);
    } else {
      delete searchObj.endReceiveDate;
    }
    if (searchObj.startProcessDate) {
      searchObj.startProcessDate = format(searchObj.startProcessDate, COMMOM_CONFIG.DATE_FORMAT);
    } else {
      delete searchObj.startProcessDate;
    }
    if (searchObj.endProcessDate) {
      searchObj.endProcessDate = format(searchObj.endProcessDate, COMMOM_CONFIG.DATE_FORMAT);
    } else {
      delete searchObj.endProcessDate;
    }
    searchObj.ticketId = searchObj.ticketId ? searchObj.ticketId.trim() : null;
    searchObj.ticketStatus = searchObj.ticketStatus ? searchObj.ticketStatus.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.toSiteId = AppStorage.get('user-info')?.siteId || -1;
    searchObj.createUser = AppStorage.getUserLogin();
  }

  showStatusName(value: any): string {
    const status = this.statusList.find(item => item.value + '' === value + '');
    if (status) return status.label;
    return '';
  }

  //load lại data trong table khi submit bên màn thông tin
  changeIsEdit(isEdit: boolean) {
    this.isEdit = isEdit;
    if (!isEdit) {
      this.searchTicketAssign();
    }
  }

  checkVisibleDelete(user: string) {
    return user === AppStorage.getUserLogin();
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
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

}

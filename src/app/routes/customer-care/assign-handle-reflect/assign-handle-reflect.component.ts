import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatTable } from '@angular/material/table';
import { AppStorage } from '@app/core/services/AppStorage';
import { AssignHandleReflectService } from '@app/core/services/customer-care/assign-handle-reflect.service';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { ACTION_TYPE, CC_PRIORITY, CC_TICKET_STATUS, HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver'

class SearchModel {
  processUsers?: {};
}
@Component({
  selector: 'app-assign-handle-reflect',
  templateUrl: './assign-handle-reflect.component.html',
  styleUrls: ['./assign-handle-reflect.component.scss']
})
export class AssignHandleReflectComponent extends BaseComponent implements OnInit {
  assignTicketForm: FormGroup;
  userHandleForm: FormGroup;
  assignReflectForm: FormGroup;
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
  priorityList = [
    { value: CC_PRIORITY.NORMAL, label: this._translateService.instant('customer-care.dropdown.priority.normal') },
    { value: CC_PRIORITY.HOT, label: this._translateService.instant('customer-care.dropdown.priority.hot') },
    { value: CC_PRIORITY.VIP, label: this._translateService.instant('customer-care.dropdown.priority.vip') }
  ];
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild('allPriority') private allPriority: MatOption;
  @ViewChild('allTicketTypeLv1') private allTicketTypeLv1: MatOption;
  @ViewChild('allTicketTypeLv2') private allTicketTypeLv2: MatOption;
  @ViewChild('allTicketTypeLv3') private allTicketTypeLv3: MatOption;
  statusPriorty = CC_PRIORITY;
  statusTicket = CC_TICKET_STATUS;
  listUserHandle = [];
  displayedColumnsUserHandle: string[] = ['orderNumberUserHandle', 'action', 'staffName', 'userName', 'email', 'phone', 'siteName'];
  columnsUserHandle: MtxGridColumn[];

  states = [];
  filterUserHandle = this.states;
  selectedUser: any = {};
  isLoadingAuto: boolean;
  totalRecordUserHandle = 0;
  startUserHandle = 0;
  sizeUserHandle = 0;
  @ViewChild('userHandle') userHandle: CrmTableComponent;
  @ViewChild('assignTicket') assignTicket: CrmTableComponent;

  assignType = [
    {
      value: 1,
      label: this._translateService.instant('customer-management.equally-divided'),
    },
    {
      value: 2,
      label: this._translateService.instant('customer-management.end-complement-sequential-division'),
    }
  ];
  actionList = [
    { value: 1, label: this._translateService.instant('ticket-statistic.assign') },
  ];
  selection = new SelectionModel<any>(true, []);
  checkCheckBox: boolean;

  constructor(private fb: FormBuilder,
    protected _translateService: TranslateService,
    private _assignHandleReflectService: AssignHandleReflectService,
    private _toastrService: ToastrService,
    private _commonCCService: CommonCCService,
    public dialog?: MtxDialog) {
    super();
  }

  ngOnInit() {
    this.buildFormAssignTicket();
    this.buildFormUserHandle();
    this.buildFormAssignReflect();
    this.buildColumn();
    this.getListTicketTypeLv1();
    this.searchDataReflect();

    this.userHandleForm.get('keySearch').valueChanges.pipe(debounceTime(1000), tap(() => { this.isLoadingAuto = true; this.filterUserHandle = []; })).subscribe(value => {
      if (typeof value !== 'object') {
        this._assignHandleReflectService.searchUserHandle(value.trim(), this.pageIndex, this.searchModel.pagesize).subscribe(rs => {
          this.isLoadingAuto = false;
          this.filterUserHandle = rs.data.listData;
        });
      }
    });
  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'common.action', field: 'action' },
      { i18n: 'customer-care.search-cc.ticketCode', field: 'ticketId' },
      { i18n: 'customer-care.search-cc.ticketContent', field: 'contentReceive' },
      { i18n: 'customer-care.search-cc.ticketStatus', field: 'status' },
      { i18n: 'contract.number', field: 'contractNo' },
      { i18n: 'support-after-sale.transfer-own-vehicle.customer-name', field: 'custName' },
      { i18n: 'info.actor', field: 'createUser' },
      { i18n: 'customer-care.search-cc.receiveTime', field: 'createDate' },
      { i18n: 'customer-care.search-cc.ticketTypeLv1', field: 'l1TicketTypeName' },
      { i18n: 'customer-care.search-cc.ticketTypeLv2', field: 'l2TicketTypeName' },
      { i18n: 'customer-care.search-cc.ticketTypeLv3', field: 'l3TicketTypeName' },
      { i18n: 'customer-care.search-cc.priority', field: 'priorityId' },
    ];

    this.columnsUserHandle = [
      { i18n: 'common.orderNumber', field: 'orderNumberUserHandle' },
      { i18n: 'common.action', field: 'action' },
      { i18n: 'customer.fullName', field: 'staffName' },
      { i18n: 'customer-management.account', field: 'userName' },
      { i18n: 'customer-management.formCustomerRegister.email', field: 'email' },
      { i18n: 'info.phoneNumber', field: 'phone' },
      { i18n: 'customer-care.search-process.unit', field: 'siteName' },
    ];
    super.mapColumn();
  }

  buildFormAssignTicket() {
    this.assignTicketForm = this.fb.group({
      ticketId: ['', Validators.pattern(COMMOM_CONFIG.SEAT_NUMBER_FORMAT)],
      contractNos: [''],
      l1TicketTypeId: [''],
      l2TicketTypeId: [''],
      l3TicketTypeId: [''],
      fromDate: [''],
      toDate: [''],
      status: [''],
      priorityId: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
  }

  buildFormUserHandle() {
    this.userHandleForm = this.fb.group({
      keySearch: [''],
      // startrecordUser: [0],
      // pagesizeUser: [this.pageSizeList[0]]
    })
  }

  buildFormAssignReflect() {
    this.assignReflectForm = this.fb.group({
      sttTo: [''],
      sttFrom: [''],
      action: [1],
      assignType: [1, Validators.required],
      isSms: [''],
    })
  }

  onChangeTicketTypeLv1(option) {
    this.assignTicketForm.controls.l2TicketTypeId?.setValue(null);
    this.assignTicketForm.controls.l3TicketTypeId?.setValue(null);
    this.ticketTypeLv2List = [];
    this.ticketTypeLv3List = [];
    if (option?.value) {
      this.getListTicketTypeLv2(option.value);
    }
  }

  onChangeTicketTypeLv2(option) {
    this.assignTicketForm.controls.l3TicketTypeId?.setValue(null);
    this.ticketTypeLv3List = [];
    if (option?.value) {
      this.getListTicketTypeLv3(option.value);
      const sourceId = this.assignTicketForm.controls.sourceId?.value;
      const priorityId = this.assignTicketForm.controls.priorityId?.value;
      this.getTicketSla(option.value, sourceId, priorityId);
    }
  }

  onChangeTicketTypeLv3(option) {
    if (option?.value) {
      const sourceId = this.assignTicketForm.controls.sourceId?.value;
      const priorityId = this.assignTicketForm.controls.priorityId?.value;
      this.getTicketSla(option.value, sourceId, priorityId);
    } else {
      const sourceId = this.assignTicketForm.controls.sourceId?.value;
      const l2TicketTypeId = this.assignTicketForm.controls.l2TicketTypeId?.value;
      const priorityId = this.assignTicketForm.controls.priorityId?.value;
      this.getTicketSla(l2TicketTypeId, sourceId, priorityId);
    }
  }

  getTicketSla(ticketTypeId, sourceId, priorityId) {
    if (priorityId) {
      this._commonCCService.getTicketSLA({ siteId: AppStorage.get('user-info')?.siteId || null, ticketTypeId, sourceId, priorityId }).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          const data = res.data?.listData?.length > 0 ? res.data.listData[0] : null;
          if (data && data.sla) {
            this.assignTicketForm.controls.sla.setValue(data.sla);
          }
        } else {
          this._toastrService.error(res.mess.description);
        }
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  getListTicketTypeLv1() {
    if (AppStorage.get('list-ticket-type')) {
      this.ticketTypeLv1List = AppStorage.get('list-ticket-type').map(val => ({ value: val.ticketTypeId, label: val.name }));
    } else {
      this._commonCCService.getListTicketType().subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketTypeLv1List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
      });
    }
  }

  getListTicketTypeLv2(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data.listData || [];
      this.ticketTypeLv2List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  getListTicketTypeLv3(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data.listData || [];
      this.ticketTypeLv3List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  handleChangeTicketTypeLv1() {
    this.assignTicketForm.controls.l2TicketTypeId.setValue(null);
    this.assignTicketForm.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv2List = [];
    this.ticketTypeLv3List = [];
    if (this.assignTicketForm.controls.l1TicketTypeId.value?.length > 0) {
      this.getListTicketTypeLv2(this.assignTicketForm.controls.l1TicketTypeId.value.filter(item => item !== -1).map(item => item.value).join(','));
    }
  }

  onChangeTicketTypeLv1One() {
    if (this.allTicketTypeLv1.selected) {
      this.allTicketTypeLv1.deselect();
    }
    if (this.assignTicketForm.controls.l1TicketTypeId.value.length == this.ticketTypeLv1List.length) {
      this.allTicketTypeLv1.select();
    }
    this.handleChangeTicketTypeLv1();
  }

  onChangeTicketTypeLv1All() {
    if (this.allTicketTypeLv1.selected) {
      this.assignTicketForm.controls.l1TicketTypeId.setValue([...this.ticketTypeLv1List, -1]);
    } else {
      this.assignTicketForm.controls.l1TicketTypeId.setValue([]);
    }
    this.handleChangeTicketTypeLv1();
  }

  handleChangeTicketTypeLv2() {
    this.assignTicketForm.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv3List = [];
    if (this.assignTicketForm.controls.l2TicketTypeId.value?.length > 0) {
      this.getListTicketTypeLv3(this.assignTicketForm.controls.l2TicketTypeId.value.filter(item => item !== -1).map(item => item.value).join(','));
    }
  }

  onChangeTicketTypeLv2One() {
    if (this.allTicketTypeLv2.selected) {
      this.allTicketTypeLv2.deselect();
    }
    if (this.assignTicketForm.controls.l2TicketTypeId.value.length == this.ticketTypeLv2List.length) {
      this.allTicketTypeLv2.select();
    }
    this.handleChangeTicketTypeLv2();
  }

  onChangeTicketTypeLv2All() {
    if (this.allTicketTypeLv2.selected) {
      this.assignTicketForm.controls.l2TicketTypeId.setValue([...this.ticketTypeLv2List, -1]);
    } else {
      this.assignTicketForm.controls.l2TicketTypeId.setValue([]);
    }
    this.handleChangeTicketTypeLv2();
  }

  onChangeTicketTypeLv3One() {
    if (this.allTicketTypeLv3.selected) {
      this.allTicketTypeLv3.deselect();
    }
    if (this.assignTicketForm.controls.l3TicketTypeId.value.length == this.ticketTypeLv3List.length) {
      this.allTicketTypeLv3.select();
    }
  }

  onChangeTicketTypeLv3All() {
    if (this.allTicketTypeLv3.selected) {
      this.assignTicketForm.controls.l3TicketTypeId.setValue([...this.ticketTypeLv3List, -1]);
    } else {
      this.assignTicketForm.controls.l3TicketTypeId.setValue([]);
    }
  }

  onChangePriorityOne() {
    if (this.allPriority.selected) {
      this.allPriority.deselect();
    }
    if (this.assignTicketForm.controls.priorityId.value.length == this.priorityList.length) {
      this.allPriority.select();
    }
  }

  onChangePriorityAll() {
    if (this.allPriority.selected) {
      this.assignTicketForm.controls.priorityId.setValue([...this.priorityList, -1]);
    } else {
      this.assignTicketForm.controls.priorityId.setValue([]);
    }
  }

  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.assignTicketForm.controls.status.value.length == this.ticketStatusList.length) {
      this.allStatus.select();
    }
  }

  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.assignTicketForm.controls.status.setValue([...this.ticketStatusList, -1]);
    } else {
      this.assignTicketForm.controls.status.setValue([]);
    }
  }

  checkFormatDate(value: string): boolean {
    if (!value) return false;
    if (!(/^\d{2}\/\d{2}\/\d{4}$/.test(value))) return true;
    const parts = value.split("/");
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return true;

    return false;
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  //////////////////////////////Xử lý tìm kiếm phản ánh
  searchDataReflect() {
    if (this.assignTicketForm.valid) {
      let searchObj = Object.assign({}, this.assignTicketForm.value);
      this.setValueToObject(searchObj);
      for (const item in searchObj) {
        if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
          delete searchObj[item]
        }
      }
      if (this.assignTicketForm.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this._assignHandleReflectService.searchDataReflect(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.selection.clear();
          this.selection.selected.length = 0;
          this.assignReflectForm.controls.sttTo.enable();
          this.assignReflectForm.controls.sttFrom.enable();
          this.isLoading = false;
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      }
      )
    }
  }

  setValueToObject(searchObj: any) {
    searchObj.ticketId = searchObj.ticketId || null;
    searchObj.contractNos = searchObj.contractNos ? searchObj.contractNos.trim() : null;
    searchObj.l1TicketTypeId = searchObj.l1TicketTypeId && Array.isArray(searchObj.l1TicketTypeId) ? searchObj.l1TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.l2TicketTypeId = searchObj.l2TicketTypeId && Array.isArray(searchObj.l2TicketTypeId) ? searchObj.l2TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.l3TicketTypeId = searchObj.l3TicketTypeId && Array.isArray(searchObj.l3TicketTypeId) ? searchObj.l3TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.fromDate = searchObj.fromDate ? format(searchObj.fromDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.toDate = searchObj.toDate ? format(searchObj.toDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.status = searchObj.status && Array.isArray(searchObj.status) ? searchObj.status.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.priorityId = searchObj.priorityId && Array.isArray(searchObj.priorityId) ? searchObj.priorityId.filter(item => item !== -1).map(item => item.value).join(';') : null;
  }

  onSearch() {
    this.pageIndex = 0;
    this.assignTicketForm.controls.startrecord.setValue(0);
    this.searchDataReflect();
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.assignTicketForm.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.assignTicketForm.controls.pagesize.setValue(event.pageSize);
    this.searchDataReflect();
  }
  /////////////////////////////////////

  ////////////////Xử lý auto complete người xử lý
  onSelectedUser(event) {
    this.selectedUser = event.option.value;
    let userName = this.selectedUser;
    if (!this.listUserHandle.filter(x => x.userName == this.selectedUser.userName).length) {
      this.listUserHandle.push(userName);
    }
    this.userHandle.renderTable();
    this.totalRecordUserHandle = this.userHandle.dataSource.length;
  }

  async filterUser(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filterUserHandle = [];
    const data = (await this._assignHandleReflectService.searchUserHandle(value.trim(), this.pageIndex, this.searchModel.pagesize).toPromise()).data;
    if (data.listData.length > 0) {
      this.filterUserHandle = data.listData;
    }
    return this.filterUserHandle;
  }

  getOptionText(option) {
    if (option) {
      return option.staffName + ' - ' + option.siteName;
    }
  }

  getUserHandle() {
    this._assignHandleReflectService.searchUserHandle(this.userHandleForm.controls.keySearch.value.userName ||
      this.userHandleForm.controls.keySearch.value.email || this.userHandleForm.controls.keySearch.value.phone, this.pageIndex, this.searchModel.pagesize).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.listUserHandle = res.data.listData;
          this.totalRecordUserHandle = this.listUserHandle.length;
        } else {
          this._toastrService.error(res.mess.description)
        }
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      }
      )
  }

  onSearchUserHandle() {
    this.pageIndex = 0;
    this.userHandleForm.controls.startrecordUser.setValue(0);
    this.getUserHandle();
  }

  onPageChangeUserHandle(event) {
    this.pageIndex = event.pageIndex
    this.userHandleForm.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.userHandleForm.controls.pagesizeUser.setValue(event.pageSize);
    this.getUserHandle();
  }

  deleteUserHandle(dataIndex: number) {
    this.listUserHandle.splice(dataIndex, 1);
    this.userHandle.renderTable();
    this.totalRecordUserHandle = this.listUserHandle.length;
  }
  /////////////////////////////////

  /////////////////////Xử lý giao việc phản ánh
  validCheckbox(value: string): void {
    if (!value) {
      this.checkCheckBox = false;
    } else {
      this.checkCheckBox = true;
    }
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataModel.dataSource.forEach(row => this.selection.select(row));
    if (this.selection.selected.length == 0) {
      this.assignReflectForm.controls.sttTo.enable();
      this.assignReflectForm.controls.sttFrom.enable();
    } else {
      this.assignReflectForm.controls.sttTo.disable();
      this.assignReflectForm.controls.sttFrom.disable();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
    return numSelected === numRows;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  checkChange(row) {
    this.selection.toggle(row);
    row.selected = !this.selection.isSelected(row) ? false : true;
    if (this.selection.selected.length == 0) {
      this.assignReflectForm.controls.sttTo.enable();
      this.assignReflectForm.controls.sttFrom.enable();
    } else {
      this.assignReflectForm.controls.sttTo.disable();
      this.assignReflectForm.controls.sttFrom.disable();
    }
  }

  assignHandleReflect() {
    if (this.selection.selected.length == 0 && !this.assignReflectForm.value.sttTo && !this.assignReflectForm.value.sttFrom) {
      this._toastrService.warning(this._translateService.instant('ticket-error-cause.valid-ticket-assign'));
      return;
    }
    if (this.assignReflectForm.value.sttTo > this.assignReflectForm.value.sttFrom) {
      this._toastrService.warning(this._translateService.instant('ticket-error-cause.valid-record-number'));
      return;
    }
    if (this.listUserHandle == null) {
      this._toastrService.warning(this._translateService.instant('ticket-error-cause.valid-user-assign'));
      return;
    }
    if (this.selection.selected.length < this.listUserHandle.length
      && !this.assignReflectForm.value.sttTo && !this.assignReflectForm.value.sttFrom
      && (this.assignReflectForm.value.sttTo - this.assignReflectForm.value.sttFrom + 1) > this.selection.selected.length) {
      this._toastrService.warning(this._translateService.instant('ticket-error-cause.valid-compare-user-ticket'));
      return;
    }

    let listDataTicket = this.dataModel.dataSource.slice(this.assignReflectForm.value.sttTo - 1, this.assignReflectForm.value.sttFrom);

    const object = Object.assign({}, this.assignReflectForm.value ? this.assignReflectForm.value : null);

    // object.authorization = AppStorage.getUserLogin();
    object.assignType = this.assignReflectForm.controls.assignType.value;
    object.processUsers = this.listUserHandle.map(x => x.userName);
    object.isSms = this.assignReflectForm.controls.isSms.value ? 1 : 0;
    object.actTypeId = ACTION_TYPE.TICKET_ASSIGN;

    if (this.assignReflectForm.value.sttTo && this.assignReflectForm.value.sttFrom) {
      object.ticketIds = listDataTicket.map(x => Number(x.ticketId));
    } else if (this.selection.selected.length > 0) {
      object.ticketIds = this.selection.selected.map(x => Number(x.ticketId));
    }

    this._assignHandleReflectService.assignHandleReflect(object).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('customer-management.assign-handle-reflect-success'));
        this.selection.clear();
        this.assignReflectForm.controls.sttTo.enable();
        this.assignReflectForm.controls.sttFrom.enable();
      } else {
        this._toastrService.warning(res.mess.description);
      }
    }, err => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    })
  }
  ////////////////////////////////////

  /////////////Xuất excel
  exportExcelTicketNotAssign() {
    if (this.assignReflectForm.valid) {
      const searchModelExcel = Object.assign({}, this.assignTicketForm.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._assignHandleReflectService.exportExcelTicketNotAssign(searchModelExcel).subscribe(
        res => {
          const contentDisposition = res.headers.get('content-disposition');
          const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
          saveAs(res.body, filename);
        },
        () => {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      );
    }
  }
  ////////////////////////////////////
}

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { HTTP_CODE, CC_PRIORITY, CC_TICKET_STATUS, SharedDirectoryService, CommonCRMService, ACTION_TYPE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import _ from 'lodash';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-search-tab',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchTicketTabComponent extends BaseComponent implements OnInit {

  @Input() data: any = {};
  @Output() onChangeTabProcess: EventEmitter<any> = new EventEmitter();
  @ViewChild('allTicketTypeLv1') private allTicketTypeLv1: MatOption;
  @ViewChild('allTicketTypeLv2') private allTicketTypeLv2: MatOption;
  @ViewChild('allTicketTypeLv3') private allTicketTypeLv3: MatOption;
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild('allPriority') private allPriority: MatOption;
  @ViewChild('allTicketSource') private allTicketSource: MatOption;
  priorityList = [
    { value: CC_PRIORITY.NORMAL, label: this._translateService.instant('customer-care.dropdown.priority.normal') },
    { value: CC_PRIORITY.HOT, label: this._translateService.instant('customer-care.dropdown.priority.hot') },
    { value: CC_PRIORITY.VIP, label: this._translateService.instant('customer-care.dropdown.priority.vip') }
  ];
  ticketSourceList = [];
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
  errorTypeList = [
    { value: '1', label: this._translateService.instant('customer-care.dropdown.errorType.incurred') },
    { value: '2', label: this._translateService.instant('customer-care.dropdown.errorType.single') }
  ];
  customerTypeList = [];
  priority = CC_PRIORITY;

  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private _sharedDirectoryService: SharedDirectoryService,
    private _commonCCService: CommonCCService,
    private _commonCRMService: CommonCRMService,
    public dialog: MtxDialog,
    private _router: Router,
  ) {
    super();
  }

  ngOnInit() {
    this.formSearch = this.fb.group({
      contractNo: [this.data?.length > 0 && this.data[0].listContract?.length > 0 ? this.data[0].listContract[0].contractNo : null],
      startReceiveDate: [],
      endReceiveDate: [],
      startProcessDate: [],
      endProcessDate: [],
      ticketId: [''],
      plateNumber: [''],
      priorityId: [],
      sourceId: [],
      l1TicketTypeId: [],
      l2TicketTypeId: [],
      l3TicketTypeId: [],
      status: [],
      province: [],
      district: [],
      commune: [],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
    this.buildColumn();
  }

  onInit() {
    this.getListCustomerType();
    this.getListTicketSource();
    this.getListTicketTypeLv1();
    this.getListProvince();
    this.getData();
  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', width: '50px', sticky: true }, //STT
      { i18n: 'common.action', field: 'action', width: '60px', sticky: true, type: 'actionCustom' },
      { i18n: 'customer-care.search-cc.ticketCode', field: 'ticketId', width: '80px' }, //Mã phản ánh
      { i18n: 'customer-care.search-cc.plateNumber', field: 'plateNumber', width: '80px' }, //Biển số xe
      { i18n: 'customer-care.search-cc.contractNo', field: 'contractNo', width: '80px' }, //Số hợp đồng
      { i18n: 'customer-care.search-cc.phoneNumber', field: 'phoneNumber', width: '80px' }, //Số điện thoại theo hợp đồng
      { i18n: 'customer-care.ticket-history.custName', field: 'custName', width: '100px' }, //Tên khách hàng
      { i18n: 'customer-care.search-cc.address', field: 'custAddress', width: '200px' }, //Địa chỉ
      { i18n: 'customer-care.search-process.location', field: 'location', width: '200px' }, //Địa chỉ chi tiết
      { i18n: 'customer-care.search-cc.receiveUser', field: 'createUser', width: '80px' }, //Người tiếp nhận
      { i18n: 'customer-care.search-cc.receiveDate', field: 'receiveDate', width: '100px' }, //Ngày tiếp nhận
      { i18n: 'customer-care.search-cc.receiveHour', field: 'receiveTime', width: '100px' }, //Giờ tiếp nhận
      { i18n: 'customer-care.search-cc.ticketTypeLv1', field: 'groupPA', width: '200px' }, //Nhóm phản ánh
      { i18n: 'customer-care.search-cc.ticketTypeLv2', field: 'subgroupPA', width: '200px' }, //Thể loại
      { i18n: 'customer-care.search-cc.ticketTypeLv3', field: 'detailPA', width: '200px' }, //Loại phản ánh
      { i18n: 'customer-care.search-cc.ticketSource', field: 'sourceName', width: '100px' }, //Hình thức tiếp nhận
      { i18n: 'customer-care.search-cc.priority', field: 'priority', width: '100px' }, //Mức độ ưu tiên
      { i18n: 'customer-care.ticket.ticketTimes', field: 'ticketTimes', width: '100px', type: 'ticketTimeCustom' }, //Số lần phản ánh
      { i18n: 'customer-care.search-cc.ticketContent', field: 'contentReceive', width: '400px' }, //Nội dung phản ánh
      { i18n: 'customer-care.search-cc.requestDate', field: 'requestDate', width: '100px' }, //Ngày hẹn khách hàng
      { i18n: 'customer-care.search-cc.slaDate', field: 'deadlineProcess', width: '100px' }, //Ngày hết hạn xử lý
      { i18n: 'customer-care.search-cc.ticketStatus', field: 'statusName', width: '100px' }, //Trạng thái phản ánh
      { i18n: 'customer-care.search-cc.dateCloseTicket', field: 'closeDateTicket', width: '100px' }, //Ngày đóng PA
      { i18n: 'customer-care.search-cc.hourCloseTicket', field: 'closeHourTicket', width: '100px' }, //Giờ đóng PA
      { i18n: 'customer-care.search-cc.processContent', field: 'processContent', width: '100px' }, //Nội dung xử lý phản ánh
      { i18n: 'customer-care.search-cc.processCreateUser', field: 'updateUser', width: '100px' }, //Người xử lý phản ánh
      { i18n: 'customer-care.search-cc.totalProcessTime', field: 'totalProcessTime', width: '80px' }, //Tổng thời gian xử lý (Giờ)
      { i18n: 'customer-care.search-cc.timeOverdue', field: 'expireTime', width: '80px' }, //Thời gian quá hạn (Giờ)
      { i18n: 'customer-care.search-cc.progress', field: 'processingProgress', width: '80px' }, //Tiến độ xử lý
      { i18n: 'customer-care.search-cc.errorStation', field: 'stageName', width: '200px' }, //Trạm lỗi
      { i18n: 'customer-care.search-cc.assignUnit', field: 'toSiteName', width: '100px' }, //Đơn vị phối hợp
      { i18n: 'customer-care.search-cc.assignUser', field: 'userHandle', width: '100px' }, //Người phối hợp
      { i18n: 'customer-care.search-cc.assignTime', field: 'dateHandle', width: '100px' }, //Thời gian phối hợp
      { i18n: 'customer-care.search-cc.custType', field: 'customerType', width: '100px' }, //Loại khách hàng
      { i18n: 'customer-care.search-cc.contactNumber', field: 'phoneContact', width: '80px' }, //Số liên lạc
    ];
  }

  getListTicketSource() {
    if (AppStorage.get('list-ticket-source')) {
      this.ticketSourceList = AppStorage.get('list-ticket-source').map(val => ({ value: val.ticketSourceId, label: val.name }));
    } else {
      this._commonCCService.getListTicketSource().subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketSourceList = data.map(val => ({ value: val.ticketSourceId, label: val.name }));
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
      const data = res.data?.listData || [];
      this.ticketTypeLv2List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  getListTicketTypeLv3(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketTypeLv3List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  handleChangeTicketTypeLv1() {
    this.formSearch.controls.l2TicketTypeId.setValue(null);
    this.formSearch.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv2List = [];
    this.ticketTypeLv3List = [];
    if (this.formSearch.controls.l1TicketTypeId.value?.length > 0) {
      this.getListTicketTypeLv2(this.formSearch.controls.l1TicketTypeId.value.filter(item => item !== -1).map(item => item.value).join(','));
    }
  }

  onChangeTicketTypeLv1One() {
    if (this.allTicketTypeLv1.selected) {
      this.allTicketTypeLv1.deselect();
    }
    if (this.formSearch.controls.l1TicketTypeId.value.length == this.ticketTypeLv1List.length) {
      this.allTicketTypeLv1.select();
    }
    this.handleChangeTicketTypeLv1();
  }

  onChangeTicketTypeLv1All() {
    if (this.allTicketTypeLv1.selected) {
      this.formSearch.controls.l1TicketTypeId.setValue([...this.ticketTypeLv1List, -1]);
    } else {
      this.formSearch.controls.l1TicketTypeId.setValue([]);
    }
    this.handleChangeTicketTypeLv1();
  }

  handleChangeTicketTypeLv2() {
    this.formSearch.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv3List = [];
    if (this.formSearch.controls.l2TicketTypeId.value?.length > 0) {
      this.getListTicketTypeLv3(this.formSearch.controls.l2TicketTypeId.value.filter(item => item !== -1).map(item => item.value).join(','));
    }
  }

  onChangeTicketTypeLv2One() {
    if (this.allTicketTypeLv2.selected) {
      this.allTicketTypeLv2.deselect();
    }
    if (this.formSearch.controls.l2TicketTypeId.value.length == this.ticketTypeLv2List.length) {
      this.allTicketTypeLv2.select();
    }
    this.handleChangeTicketTypeLv2();
  }

  onChangeTicketTypeLv2All() {
    if (this.allTicketTypeLv2.selected) {
      this.formSearch.controls.l2TicketTypeId.setValue([...this.ticketTypeLv2List, -1]);
    } else {
      this.formSearch.controls.l2TicketTypeId.setValue([]);
    }
    this.handleChangeTicketTypeLv2();
  }

  onChangeTicketTypeLv3One() {
    if (this.allTicketTypeLv3.selected) {
      this.allTicketTypeLv3.deselect();
    }
    if (this.formSearch.controls.l3TicketTypeId.value.length == this.ticketTypeLv3List.length) {
      this.allTicketTypeLv3.select();
    }
  }

  onChangeTicketTypeLv3All() {
    if (this.allTicketTypeLv3.selected) {
      this.formSearch.controls.l3TicketTypeId.setValue([...this.ticketTypeLv3List, -1]);
    } else {
      this.formSearch.controls.l3TicketTypeId.setValue([]);
    }
  }

  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.formSearch.controls.status.value.length == this.ticketStatusList.length) {
      this.allStatus.select();
    }
  }

  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.formSearch.controls.status.setValue([...this.ticketStatusList, -1]);
    } else {
      this.formSearch.controls.status.setValue([]);
    }
  }

  onChangePriorityOne() {
    if (this.allPriority.selected) {
      this.allPriority.deselect();
    }
    if (this.formSearch.controls.priorityId.value.length == this.priorityList.length) {
      this.allPriority.select();
    }
  }

  onChangePriorityAll() {
    if (this.allPriority.selected) {
      this.formSearch.controls.priorityId.setValue([...this.priorityList, -1]);
    } else {
      this.formSearch.controls.priorityId.setValue([]);
    }
  }

  onChangeTicketSourceOne() {
    if (this.allTicketSource.selected) {
      this.allTicketSource.deselect();
    }
    if (this.formSearch.controls.sourceId.value.length == this.ticketSourceList.length) {
      this.allTicketSource.select();
    }
  }

  onChangeTicketSourceAll() {
    if (this.allTicketSource.selected) {
      this.formSearch.controls.sourceId.setValue([...this.ticketSourceList, -1]);
    } else {
      this.formSearch.controls.sourceId.setValue([]);
    }
  }

  getListProvince() {
    if (AppStorage.get('list-province')) {
      this.provinceList = AppStorage.get('list-province').map(val => ({ value: val.area_code, label: val.name }));
    } else {
      this._sharedDirectoryService.getListAreas().subscribe(res => {
        this.provinceList = res.data.map(val => ({ value: val.area_code, label: val.name }));
      });
    }
  }

  getListDistrict(province) {
    this._sharedDirectoryService.getListAreas(province).subscribe(res => {
      this.districtList = res.data.map(val => ({ value: val.area_code, label: val.name }));
    });
  }

  getListCommune(district) {
    this._sharedDirectoryService.getListAreas(district).subscribe(res => {
      this.communeList = res.data.map(val => ({ value: val.area_code, label: val.name }));
    });
  }

  onChangeProvince(option) {
    this.formSearch.controls.district.setValue(null);
    this.formSearch.controls.commune.setValue(null);
    this.districtList = [];
    this.communeList = [];
    if (option && option.value) {
      this.getListDistrict(option.value);
    }
  }

  onChangeDistrict(option) {
    this.formSearch.controls.commune.setValue(null);
    this.communeList = [];
    if (option && option.value) {
      this.getListCommune(option.value);
    }
  }

  getData() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      const searchObj = Object.assign({}, this.formSearch.value);
      this.setValueToObject(searchObj);
      if (this.formSearch.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this._ticketService.searchTicket(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData.map(x => {
            // x.expireStatusName = x.expireStatus == 1 ? 'Trong hạn' : x.expireStatus == 2 ? 'Quá hạn' : '';
            x.statusName = this.ticketStatusList.find(item => item.value == x.status)?.label;
            x.priority = this.priorityList.find(item => item.value == x.priorityId)?.label;
            x.ticketKindName = this.errorTypeList.find(item => item.value == x.ticketKind)?.label;
            x.customerType = this.customerTypeList.find(item => item.value == x.custTypeId)?.label;
            x.expireTime = x.expireTime > 0 ? x.expireTime : '';
            return x
          });
          this.totalRecord = rs.data.count;
          this.isLoading = false;
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, () => {
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
    this.getData();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }

  setValueToObject(searchObj: any) {
    searchObj.startReceiveDate = searchObj.startReceiveDate ? format(searchObj.startReceiveDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.endReceiveDate = searchObj.endReceiveDate ? format(searchObj.endReceiveDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.startProcessDate = searchObj.startProcessDate ? format(searchObj.startProcessDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.endProcessDate = searchObj.endProcessDate ? format(searchObj.endProcessDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.ticketId = searchObj.ticketId ? searchObj.ticketId.trim() : null;
    searchObj.plateNumber = searchObj.plateNumber ? searchObj.plateNumber.trim() : null;
    searchObj.areaCode = searchObj.commune || searchObj.district || searchObj.province || null;
    delete searchObj.commune;
    delete searchObj.district;
    delete searchObj.province;
    searchObj.priorityId = searchObj.priorityId && Array.isArray(searchObj.priorityId) ? searchObj.priorityId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.sourceId = searchObj.sourceId && Array.isArray(searchObj.sourceId) ? searchObj.sourceId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.l1TicketTypeId = searchObj.l1TicketTypeId && Array.isArray(searchObj.l1TicketTypeId) ? searchObj.l1TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.l2TicketTypeId = searchObj.l2TicketTypeId && Array.isArray(searchObj.l2TicketTypeId) ? searchObj.l2TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.l3TicketTypeId = searchObj.l3TicketTypeId && Array.isArray(searchObj.l3TicketTypeId) ? searchObj.l3TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.status = searchObj.status && Array.isArray(searchObj.status) ? searchObj.status.filter(item => item !== -1).map(item => item.value).join(';') : null;
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item];
      }
    }
  }

  exportFile() {
    if (this.formSearch.valid) {
      const searchModelExcel = Object.assign({}, this.formSearch.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._ticketService.exportExcelTicket(searchModelExcel).subscribe(
        res => {
          const contentDisposition = res.headers.get('content-disposition');
          const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
          saveAs(res.body, filename);
        },
        () => {
          this.toastr.warning(this.translateService.instant('common.notify.fail'));
        }
      );
    }
  }

  viewTicket(item: any) {
    this._ticketService.getTicketById(item.ticketId).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        const data = rs.data || null;
        if (data) {
          data.expireStatus = item.expireStatus;
          data.phoneContact = item.phoneContact;
          data.deadlineProcess = item.deadlineProcess;
          data.siteId = item.siteId;
          data.sourceId = item.sourceId;
          data.createDate = item.createDate;
          data.priority = item.priority;
          this.onChangeTabProcess.emit(data);
        }
      } else {
        this._toastrService.error(rs.mess.description);
      }
    }, () => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  getListCustomerType() {
    if (AppStorage.get('list-cust-type')) {
      this.customerTypeList = AppStorage.get('list-cust-type').map(val => ({ value: val.cust_type_id, label: val.name }));
    } else {
      this._sharedDirectoryService.getListCustomerType().subscribe(res => {
        this.customerTypeList = res.data?.map(val => ({ value: val.cust_type_id, label: val.name }));
      });
    }
  }

  showCustomerTypeName(value: any): string {
    const customerType = this.customerTypeList.find(item => item.value == value);
    if (customerType) return customerType.label;
    return '';
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
    const parts = value.split("/");
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return true;

    return false;
  }

  addTicketTimes(item) {
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      width: '30%',
      data: {
        title: this._translateService.instant('common.button.confirm'),
        message: this._translateService.instant('customer-care.ticket.message.confirm.ticketTimes')
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const object = _.cloneDeep(item);
        object.ticketTimes = (object.ticketTimes || 1) + 1;
        object.actTypeId = ACTION_TYPE.TICKET_REPEAT;
        object.slaDate = null;
        this._ticketService.updateTicket(object.ticketId, object).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.getData();
            this._toastrService.success(this._translateService.instant('common.notify.save.success'));
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, () => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    });
  }

  changeHot(item) {
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      width: '30%',
      data: {
        title: this._translateService.instant('common.button.confirm'),
        message: this._translateService.instant('customer-care.ticket.message.confirm.changeHot')
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const object = _.cloneDeep(item);
        object.priorityId = CC_PRIORITY.HOT;
        object.actTypeId = ACTION_TYPE.TICKET_HOT;
        this._ticketService.updateTicket(object.ticketId, object).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.getData();
            this._toastrService.success(this._translateService.instant('common.notify.save.success'));
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, () => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    });
  }

}

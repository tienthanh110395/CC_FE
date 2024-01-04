import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VehicleService } from '@app/core';
import { HTTP_CODE, REGISTER_STATUS, SYNC_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-list-order',
  templateUrl: './list-order.component.html',
  styleUrls: ['./list-order.component.scss']
})
export class ListOrderComponent extends BaseComponent implements OnInit {
  formListOrder: FormGroup;
  syncStatusList = [
    { value: 1, label: this._translateService.instant('etag-change-regis.yes-sync-status') },
    { value: 2, label: this._translateService.instant('etag-change-regis.no-sync-status') }
  ];
  regStatusList = [
    { value: null, label: this._translateService.instant('briefcase.all') },
    { value: 1, label: this._translateService.instant('etag-change-regis.order-new') },
    { value: 2, label: this._translateService.instant('etag-change-regis.order-process') },
  ];
  registerStatus = REGISTER_STATUS;
  syncStatusOnline = SYNC_STATUS;
  constructor(
    private fb: FormBuilder,
    protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    protected _vehicleService: VehicleService,
  ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
    this.buildColumn();
    this.getDataChangeEtag();
  }

  buildForm() {
    this.formListOrder = this.fb.group({
      regDateFrom: [''],
      regDateTo: [''],
      regStatus: [''],
      syncStatus: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });

  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'order', type: 'order', width: '50px', sticky: true }, //STT
      { i18n: 'etag-change-regis.account-regis', field: 'accountUser', width: '120px' },//Tài khoản tạo ĐK
      { i18n: 'contract.number', field: 'contractNo', width: '120px' }, //Số hđ
      { i18n: 'support-after-sale.transfer-own-vehicle.customer-name', field: 'custName', width: '100px' }, //Tên khách hàng
      { i18n: 'etag-change-regis.phoneNumber', field: 'phoneNumber', width: '60px' }, //Số điện thoại khách hàng
      { i18n: 'etag-change-regis.plateRegis', field: 'plateNumber', width: '60px' }, //Biển số xe liên quan
      { i18n: 'etag-change-regis.serial-epc', field: 'rfidSerial', width: '70px' }, //Số serial thẻ EPC liên quan
      { i18n: 'etag-change-regis.dateRegis', field: 'regDate', width: '100px' }, //Ngày đăng ký
      { i18n: 'etag-change-regis.processStatus', field: 'processStatus', width: '60px' }, //Tiến độ xử lý
      { i18n: 'etag-change-regis.dateChange', field: 'changeDate', width: '100px' }, //Ngày đổi
      { i18n: 'etag-change-regis.regis-status', field: 'regStatus', width: '80px', type: 'customRegStatus' }, //Trạng thái xử lý đơn
      { i18n: 'etag-change-regis.ordernumber-code', field: 'orderNumber', width: '80px' }, //Mã OrderNumber
      { i18n: 'etag-change-regis.sync-status', field: 'syncStatusName', type: 'customSyncStatus', width: '100px' }, //Trạng thái đồng bộ online
    ];
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

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formListOrder.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formListOrder.controls.pagesize.setValue(event.pageSize);
    this.getDataChangeEtag();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formListOrder.controls.startrecord.setValue(0);
    this.getDataChangeEtag();
  }

  setValueToObject(searchObj: any) {
    searchObj.regDateFrom = searchObj.regDateFrom ? format(searchObj.regDateFrom, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.regDateTo = searchObj.regDateTo ? format(searchObj.regDateTo, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.regStatus = searchObj.regStatus ? searchObj.regStatus : null;
    searchObj.syncStatus = searchObj.syncStatus ? searchObj.syncStatus : null;
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item];
      }
    }
  }

  getDataChangeEtag() {
    if (this.formListOrder.valid) {
      const searchObj = Object.assign({}, this.formListOrder.value);
      this.setValueToObject(searchObj);
      if (this.formListOrder.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      if (this.formListOrder.value.regStatus.value == 1) {
        searchObj.regStatus = 1;
      } else if (this.formListOrder.value.regStatus.value == 2) {
        searchObj.regStatus = 2;
      } else {
        searchObj.regStatus = null;
      }
      this._vehicleService.getChangeEPC(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  exportExcelChangeEtag() {
    if (this.formListOrder.valid) {
      const searchModelExcel = Object.assign({}, this.formListOrder.value);
      if (this.formListOrder.value.regStatus.value == 1) {
        searchModelExcel.regStatus = 1;
      } else if (this.formListOrder.value.regStatus.value == 2) {
        searchModelExcel.regStatus = 2;
      } else {
        searchModelExcel.regStatus = null;
      }
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._vehicleService.exportExcelChangeEtag(searchModelExcel).subscribe(
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
}

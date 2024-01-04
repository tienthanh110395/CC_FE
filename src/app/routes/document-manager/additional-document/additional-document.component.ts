import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { RESOURCE, VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { DocumentService } from '@app/core/services/document/document.service';
import { ACTION_TYPE, CommonCRMService, HTTP_CODE, STATUS_BRIEFCASE, STATUS_CONTRACT } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-additional-document',
  templateUrl: './additional-document.component.html',
  styleUrls: ['./additional-document.component.scss']
})
export class AdditionalDocumentComponent extends BaseComponent implements OnInit {
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild('allActType') private allActType: MatOption;
  isLoadingShop = false;
  actTypeList = [];
  showDetail = false;
  currentTabVehicle = 0;
  statusContract = STATUS_CONTRACT;
  statusProfile = STATUS_BRIEFCASE;
  statuses = [
    {
      value: STATUS_BRIEFCASE.CHUATIEPNHAN,
      label: this._translateService.instant('briefcase.unreception'),
    },
    {
      value: STATUS_BRIEFCASE.DAPHEDUYET,
      label: this._translateService.instant('briefcase.approval'),
    },
    { value: STATUS_BRIEFCASE.BITUCHOI, label: this._translateService.instant('briefcase.deny') },
    {
      value: STATUS_BRIEFCASE.BOSUNG,
      label: this._translateService.instant('briefcase.additional'),
    },
  ];
  listOptionVehicle = [];
  listOptionContract = [];
  contractHasVehicle = [
    {
      value: true,
      label: this._translateService.instant('briefcase.noCar'),
    },
    {
      value: true,
      label: this._translateService.instant('briefcase.haveCar'),
    }
  ];

  constructor(
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private _translateService: TranslateService,
    private _documentService: DocumentService,
    private _commonCRMService: CommonCRMService,
    private _vehicleService: VehicleService,
    private _toastrService: ToastrService
  ) {
    super(_documentService, RESOURCE.CC_PROFILE, _toastrService, _translateService)
  }

  ngOnInit() {
    this.getListDocumentTypeContract();
    this.getListDocumentTypeVehicle();
    this.getActTypeList();
    this.buildForm();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'order', type: 'order', sticky: true },
      { i18n: 'briefcase.number_contract', field: 'contractNo' },
      { i18n: 'info.documentNumber', field: 'documentNumber' },
      { i18n: 'customer-care.search-information-customer.name_customer', field: 'custName' },
      { i18n: 'info.actor', field: 'createUser' },
      { i18n: 'contract.recieveDate', field: 'createDate', type: 'number' },
      { i18n: 'document.approve_person', field: 'approvedUser' },
      { i18n: 'document.approve_date', field: 'approvedDate', type: 'number' },
      { i18n: 'document.status', field: 'contractProfileStatus', type: 'profileStatusName' },
      { i18n: 'document.additional_time', field: 'expDate', type: 'number' },
      { i18n: 'common.action', field: 'view', type: 'customView', class: 'ui-text-center', width: '120px', stickyEnd: true },
    ];
    this.onSearch();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      contractNo: [''],
      plateNumber: [''],
      phoneNumber: [''],
      documentNumber: [''],
      actTypeId: [''],
      profileStatus: [''],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      contractHasVehicle: [null],
      startrecord: [''],
      pagesize: [this.pageSizeList[0]],
    });
  }

  getListDocumentTypeContract() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.KYMOIHOPDONG).subscribe(res => {
      this.listOptionContract = res.data.map(val => {
        return {
          id: Number(val.id),
          value: val.val
        };
      });
    });
  }

  getListDocumentTypeVehicle() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.DANG_KY_PT).subscribe(res => {
      this.listOptionVehicle = res.data.map(val => {
        return {
          id: Number(val.id),
          value: val.val
        };
      });
    });
  }

  getActTypeList() {
    if (AppStorage.get('list-act-type')) {
      this.actTypeList = AppStorage.get('list-act-type').map(val => ({ value: val.actTypeId, label: val.name }));
    } else {
      this._commonCRMService.searchActType().subscribe(res => {
        const data = res.data?.listData || [];
        this.actTypeList = data.map(val => ({ value: val.actTypeId, label: val.name }));
      });
    }
  }

  displayFn() {

  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }

  getData() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      let searchObj = Object.assign(this.formSearch.value);
      this.setValueToObject(searchObj);
      this._documentService.searchDocument(searchObj).subscribe(rs => {
        if (rs.mess.code = HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoading = false;
          this.showDetail = false;
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, error => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  setValueToObject(searchObj: any) {
    searchObj.contractNo = searchObj.contractNo ? searchObj.contractNo.trim() : '';
    searchObj.plateNumber = searchObj.plateNumber ? searchObj.plateNumber.trim() : '';
    searchObj.phoneNumber = searchObj.phoneNumber ? searchObj.phoneNumber.trim() : '';
    searchObj.documentNumber = searchObj.documentNumber ? searchObj.documentNumber.trim() : '';
    if (searchObj.fromDate) {
      searchObj.fromDate = searchObj.fromDate ? format(searchObj.fromDate, COMMOM_CONFIG.DATE_FORMAT) : '';
    }
    if (searchObj.toDate) {
      searchObj.toDate = searchObj.toDate ? format(searchObj.toDate, COMMOM_CONFIG.DATE_FORMAT) : '';
    }
    searchObj.profileStatus = (searchObj.profileStatus && searchObj.profileStatus.length > 0) ? searchObj.profileStatus.filter(item => item !== -1).map(item => item.value).join(';') : null;
  }

  getStickyWidth(): string {
    let w = window.innerWidth - 100;
    return `${w}px`;
  }

  removeScan(item: any) {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('common.button.confirm'),
      this._translateService.instant('document.confirm_remove_scan_mess'),
      this._translateService.instant('document.remove_scan')
    );
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._documentService.removeScanAll(item.contractId, { contractId: item.contractId, profileStatus: item.profileStatus }).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.onSearch();
            this._toastrService.success(this._translateService.instant('common.notify.save.success'));
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, err => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    });
  }

  action(item: any) {
    this.showDetail = false;
    this.currentTabVehicle = 0;
    this._vehicleService.searchVehiclesAssignRFID(null, item.contractId).subscribe(res => {
      const listVehicle = res.data?.listData;
      this._documentService.getAttachementByContractId(item.contractId, {}).subscribe(rs => {
        if (rs.mess.code === 1) {
          this.showDetail = true;
          this.dataModel.selectedItem = item;
          const data = rs.data.listData || [];
          const listFileContract = data.filter(item => !item.plateNumber);
          const listFileVehicle = data.filter(item => item.plateNumber);
          this.dataModel.listContract = listFileContract;
          let objectVehicle = {};
          for (const item of listVehicle) {
            objectVehicle[item.plateNumber] = { ...item, listData: [] };
            for (const element of listFileVehicle) {
              if (item.plateNumber === element.plateNumber) {
                objectVehicle[item.plateNumber].listData.push(element);
              }
            }
          }
          this.dataModel.listVehicle = objectVehicle;
          if (item.tabIndex) {
            this.currentTabVehicle = item.tabIndex;
          }
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, error => {
        this._toastrService.error(this._translateService.instant('common.notify.fail'));
      });
    }, error => {
      this._toastrService.error(this._translateService.instant('common.notify.fail'));
    });
  }

  groupBy(items, key) {
    return items.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  changeTabVehicle(event) {
    this.currentTabVehicle = event;
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }

  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.formSearch.controls.profileStatus.setValue([...this.statuses, -1]);
    } else {
      this.formSearch.controls.profileStatus.setValue([]);
    }
  }

  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.formSearch.controls.profileStatus.value.length == this.statuses.length) {
      this.allStatus.select();
    }
  }

  onChangeActTypeAll() {
    if (this.allActType.selected) {
      this.formSearch.controls.actTypeId.setValue([...this.actTypeList, -1]);
    } else {
      this.formSearch.controls.actTypeId.setValue([]);
    }
  }

  onChangeActTypeOne() {
    if (this.allActType.selected) {
      this.allActType.deselect();
    }
    if (this.formSearch.controls.actTypeId.value.length == this.statuses.length) {
      this.allActType.select();
    }
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  handleCancel() {
    this.showDetail = false;
    this.currentTabVehicle = 0;
  }
}

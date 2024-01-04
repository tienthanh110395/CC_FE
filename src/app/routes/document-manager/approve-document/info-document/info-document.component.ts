import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { ContractService, VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DocumentService } from '@app/core/services/document/document.service';
import {ACTION_TYPE, HTTP_CODE, PLATE_TYPE_COLOR, STATUS_CONTRACT_PROFILE, STATUS_CONTRACT_VEHICLE} from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { IColumn } from '@shared/models/icolumn';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogBoldFormComponent } from '@shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import FileSaver from 'file-saver';
interface OptionStatusContract {
  status?: String;
}
@Component({
  selector: 'app-info-document-approve',
  templateUrl: './info-document.component.html',
  styleUrls: ['./info-document.component.scss'],
})
export class InfoDocumentApproveComponent extends BaseComponent implements OnInit, AfterViewInit {
  columnsDocumentAttach: IColumn[] = [];
  statusContractProfile = STATUS_CONTRACT_PROFILE;
  config: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    suppressScrollY: true
  };
  fileData = null;
  fileName = null;
  fullFileData = null;
  fileExtension = null;
  isFullSize = false;
  pageSize = 1000;

  vehicleGroup = [];
  vehicleType = [];
  displayedColumnsAttach = [];
  listFile = [];
  checkDisable = true;

  dataSource = new MatTableDataSource<any>();
  @ViewChild('paginator') paginator: MatPaginator;
  dataSourceDocumentAttach = new MatTableDataSource<any>();
  @ViewChild('paginatorDocumentAttach') paginatorDocumentAttach: MatPaginator;
  dataSourceVehicleAttach = new MatTableDataSource<any>();
  @ViewChild('paginatorVehicleAttach') paginatorVehicleAttach: MatPaginator;

  formDocument: FormGroup;
  formInfoVehicle: FormGroup;
  checkValidForm: boolean;
  statusContractVehicle = STATUS_CONTRACT_VEHICLE;
  checkValidButton = false;
  _viewer: PhotoViewer;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _searchInformationCustomerService: SearchInformationCustomerService,
    private _vehicleService: VehicleService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _contractService: ContractService,
    private _documentService: DocumentService,
    private cd: ChangeDetectorRef,
    private _domSanitizationService?: DomSanitizer,
    public _dialogRef?: MatDialogRef<ConfirmDialogBoldFormComponent>,
  ) {
    super();
  }

  get checkDisableOptionContract() {
    if (this.dataSourceDocumentAttach.filteredData.length == 0) {
      return true
    }
    return this.dataSourceDocumentAttach.data.some(
      item => item.checkStatus + '' != '1',
    );
  }

  get checkDisableOptionVehicle() {
    if (this.dataSourceVehicleAttach.filteredData.length == 0) {
      return true
    }
    return this.dataSourceVehicleAttach.data.some(
      item => item.checkStatus + '' != '1',
    );
  }

  ngOnInit() {
    this.vehicleGroup = AppStorage.get('vehicle-group') || [];
    this.vehicleType = AppStorage.get('vehicle-type') || [];
    this.buildForm({});
    this.dataModel.titlePopup = 'Thông tin khách hàng';
    this.dataModel.optionContractStatus = STATUS_CONTRACT_VEHICLE.PHE_DUYET;
    this.dataModel.optionContractStatus = STATUS_CONTRACT_VEHICLE.TU_CHOI;
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'vehicle.colorPlates', field: 'plateTypeNm' },
      { i18n: 'vehicle.owner', field: 'owner' },
      { i18n: 'vehicle.vehicleType', field: 'vehicleTypeName' },
      { i18n: 'vehicle.vehicleTypeFee', field: 'vehicleTypeFee' },
      { i18n: 'vehicle.seatNumber', field: 'seatNumber', class: 'ui-text-center' },
      { i18n: 'vehicle.cargoWeight', field: 'cargoWeight', class: 'ui-text-center' },
      { i18n: 'vehicle.frameNumber', field: 'chassicNumber' },
      { i18n: 'vehicle.machineNumber', field: 'engineNumber' },
      { i18n: 'vehicle.rfid_epc', field: 'rfidSerial' },
      { i18n: 'Trạng thái hồ sơ hiện tại', field: 'profileStatusName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.columnsDocumentAttach = [
      { i18n: 'common.orderNumber', field: 'orderNumber', width: '30%' },
      { i18n: 'document.type', field: 'documentTypeName', width: '100%' },
      { i18n: 'document.scanner', field: 'createUser', width: '100%' },
      { i18n: 'document.check_date', field: 'approvedDate', width: '100%' },
      { i18n: 'document.check_status', field: 'checkStatus' },
      { i18n: 'document.failed_scan', field: 'scanFalse' },
      { i18n: 'document.wrong_info', field: 'infoFalse' },
      { i18n: 'document.fake', field: 'infoFake' },
      { i18n: 'document.not_scan', field: 'noScan' },
      { i18n: 'common.reason', field: 'reason' },
      { i18n: 'briefcase.ocr-status', field: 'ocrResult' },
      { i18n: 'briefcase.ocr-comment', field: 'ocrComment' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumnsAttach = this.columnsDocumentAttach.map(x => x.field);
    this.displayedColumns = this.columns.map(x => x.field);
    // get detail
    this._documentService.getProfileContract(this.data.contractId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.buildForm(res.data || {});
      }
    });

    this.getListVehicle();
    this.searchContractProfiles();
    this.buildFormVehicle();
    this.getStatusContract();
  }

  buildFormVehicle() {
    this.formInfoVehicle = this.fb.group({
      statusVehicle: [''],
      reasonVehicle: [''],
    })
  }

  buildForm(data) {
    this.formDocument = this.fb.group({
      profileApproveId: [data.profileApproveId || null],
      contractId: [this.data.contractId || null],
      status: [data.status || null, Validators.required],
      currentStatus: [],
      reason: [data.reason],
    });
    if (data == null) {
      this.pathValueForm(data)
    } else if (data != null) {
      this.formDocument.get('currentStatus').setValue(this.data.contractProfileStatus == 1 ? "Chờ phê duyệt" : this.data.contractProfileStatus == 2 ? "Đã duyệt" :
        this.data.contractProfileStatus == 3 ? "Từ chối" : this.data.contractProfileStatus == 4 ? "Bổ sung hồ sơ" : "");
      this.formDocument.controls.reason.clearValidators();
      this.formDocument.controls.reason.updateValueAndValidity();
    }
  }

  getStatusContract() {
    this.formDocument.get('currentStatus').setValue(this.data.contractProfileStatus == 1 ? "Chờ phê duyệt" : this.data.contractProfileStatus == 2 ? "Đã duyệt" :
      this.data.contractProfileStatus == 3 ? "Từ chối" : this.data.contractProfileStatus == 4 ? "Bổ sung hồ sơ" : "")
  }

  pathValueForm(formValue) {
    let statusContract: string = ''
    if (formValue.status == 1) {
      statusContract = "Phê duyệt";
      this.dataModel.optionContractStatus = this.formDocument.value.status;
    } else if (formValue.status == 2) {
      statusContract = "Từ chối";
      this.dataModel.optionContractStatus = STATUS_CONTRACT_VEHICLE.TU_CHOI;
    }
    this.formDocument.patchValue({
      currentStatus: statusContract,
      status: formValue.status,
    })
  }

  ngAfterViewInit(): void {
    this.dataSourceDocumentAttach.paginator = this.paginatorDocumentAttach;
    this.dataSourceVehicleAttach.paginator = this.paginatorVehicleAttach;
    this.dataSource.paginator = this.paginator;
  }

  getListVehicle() {
    const body = {
      pageIndex: this.pageIndex,
      pagesize: this.pageSize,
    }
    this._searchInformationCustomerService.getListVehicle(this.data.contractId, body).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        // get list Plate Types
        const listOptionPlateTypes = AppStorage.get('plate-types');

        this.dataSource.data = rs.data.listData.map(x => {
          x.plateTypeNm       = listOptionPlateTypes.find(p => p.code == x.plateTypeCode)?.val;
          x.profileStatusName = x.profileStatus == 1 ? "Chờ phê duyệt" : x.profileStatus == 2 ? "Đã duyệt" : x.profileStatus == 3 ? "Từ chối" : x.profileStatus == 4 ? "Bổ sung hồ sơ" : "";
          return x;
        });
      } else {
        this._toastrService.error(rs.mess.description);
      }
    },
      () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      },
    );
  }

  searchContractProfiles() {
    this._documentService.getAttachementByContractId(this.data.contractId, {}).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.listFile = res.data.listData;
        const listFileContract = [];
        // set lai thong tin scan
        for (const iterator of this.listFile) {
          if (iterator.scanFalse == '1') {
            iterator.scanFalse = 'scanFalse';
            this.checkBoxScanFalse(iterator);
          }
          if (iterator.infoFalse == '1') {
            iterator.infoFalse = 'infoFalse';
            this.checkBoxInfoFalse(iterator);
          }
          if (iterator.infoFake == '1') {
            iterator.infoFake = 'infoFake';
            this.checkBoxInfoFake(iterator);
          }
          if (iterator.noScan == '1') {
            iterator.noScan = 'noScan';
            this.checkBoxNoScan(iterator);
          }
          if (!iterator.checkStatus) {
            iterator.checkStatus = 0;
          }
          if (!iterator.plateNumber) {
            listFileContract.push(iterator);
          }
          this.dataSourceDocumentAttach.data = listFileContract.map(x => {
            x.reason = x.reason ?? '';
            return x;
          });
        }
      } else {
        this.toastr.error(this._translateService.instant('common.notify.fail'));
      }
    });
  }

  checkBoxScanFalse(item) {
    this.checkValidButton = false;
    if (item.scanFalse) {
      item.isDisabledInfoFalse = true
      item.isDisabledInfoFake = true
      item.isDisabledNoScan = true
    } else {
      item.isDisabledInfoFalse = false
      item.isDisabledInfoFake = false
      item.isDisabledNoScan = false
    }
  }

  checkBoxInfoFalse(item) {
    this.checkValidButton = false;
    if (item.infoFalse) {
      item.isDisabledScanFalse = true
      item.isDisabledInfoFake = true
      item.isDisabledNoScan = true
    } else {
      item.isDisabledScanFalse = false
      item.isDisabledInfoFake = false
      item.isDisabledNoScan = false
    }
  }

  checkBoxInfoFake(item) {
    this.checkValidButton = false;
    if (item.infoFake) {
      item.isDisabledScanFalse = true
      item.isDisabledInfoFalse = true
      item.isDisabledNoScan = true
    } else {
      item.isDisabledScanFalse = false
      item.isDisabledInfoFalse = false
      item.isDisabledNoScan = false
    }
  }

  checkBoxNoScan(item) {
    this.checkValidButton = false;
    if (item.noScan) {
      item.isDisabledScanFalse = true
      item.isDisabledInfoFalse = true
      item.isDisabledInfoFake = true
    } else {
      item.isDisabledScanFalse = false
      item.isDisabledInfoFalse = false
      item.isDisabledInfoFake = false
    }
  }

  handleChangeCheckbox(item) {
    item.checkStatus = 1;
    const status = this.dataSourceDocumentAttach.data.some(x => x.scanFalse || x.infoFalse || x.infoFake || x.noScan)
    if (status) {
      this.formDocument.get('status').setValue('2');
    } else {
      const itemNotCheck = this.dataSourceDocumentAttach.data.filter(x => x.checkStatus == 0);
      if (itemNotCheck.length == 0) {
        this.formDocument.get('status').setValue('1');
      }
    }
    this.cd.detectChanges();
  }

  handleChangeStatus(event, item) {
    if (event.value == 0) {
      item.isDisabledInfoFalse = false;
      item.isDisabledInfoFake = false;
      item.isDisabledNoScan = false;
      item.isDisabledScanFalse = false;
      item.scanFalse = 0;
      item.infoFalse = 0;
      item.infoFake = 0;
      item.noScan = 0;
      this.formDocument.get('status').setValue('2');
    } else {
      const itemNotCheck = this.dataSourceDocumentAttach.data.filter(x => x.checkStatus == 0);
      const status = this.dataSourceDocumentAttach.data.some(x => x.scanFalse || x.infoFalse || x.infoFake || x.noScan)
      if (itemNotCheck.length == 0 && !status) {
        this.formDocument.get('status').setValue('1');
      } else {
        this.formDocument.get('status').setValue('2');
      }
    }
    this.cd.detectChanges();
  }

  handleChangeCheckboxVehicle(item) {
    const statusVehicle = this.dataSourceVehicleAttach.data.some(x => x.scanFalse || x.infoFalse || x.infoFake || x.noScan)
    if (statusVehicle) {
      this.formInfoVehicle.get('statusVehicle').setValue('2');
    } else {
      const itemNotCheck = this.dataSourceVehicleAttach.data.filter(x => x.checkStatus == 0);
      if (itemNotCheck.length == 0) {
        this.formInfoVehicle.get('statusVehicle').setValue('1');
      }
    }
    item.checkStatus = 1;
    this.cd.detectChanges();
  }

  handleChangeStatusVehicle(event, item) {
    if (event.value == 0) {
      item.isDisabledInfoFalse = false;
      item.isDisabledInfoFake = false;
      item.isDisabledNoScan = false;
      item.isDisabledScanFalse = false;
      item.scanFalse = 0;
      item.infoFalse = 0;
      item.infoFake = 0;
      item.noScan = 0;
      this.formInfoVehicle.get('statusVehicle').setValue('2');
    } else {
      const itemNotCheck = this.dataSourceVehicleAttach.data.filter(x => x.checkStatus == 0);
      const status = this.dataSourceVehicleAttach.data.some(x => x.scanFalse || x.infoFalse || x.infoFake || x.noScan)
      if (itemNotCheck.length == 0 && !status) {
        this.formInfoVehicle.get('statusVehicle').setValue('1');
      } else {
        this.formInfoVehicle.get('statusVehicle').setValue('2');
      }
    }
    this.cd.detectChanges();
  }

  onSubmit() {
    this.checkValidButton = true;
    const object = Object.assign({}, this.formDocument.value);
    object.approvedUser = AppStorage.getUserLogin();
    let profiles = [];
    if (this.formDocument.value?.status == 1) {
      object.actTypeIdContract = ACTION_TYPE.CONTRACT_PROFILE_APPROVE;
    } else if (this.formDocument.value?.status == 2) {
      object.actTypeIdContract = ACTION_TYPE.CONTRACT_PROFILE_REJECT;
    }
    const listAttachFileContract = [...this.dataSourceDocumentAttach.data];
    for (const item of listAttachFileContract) {
      profiles.push({
        contractProfileId: item.contractProfileId,
        scanFalse: item.scanFalse ? 1 : 0,
        infoFalse: item.infoFalse ? 1 : 0,
        infoFake: item.infoFake ? 1 : 0,
        noScan: item.noScan ? 1 : 0,
        checkStatus: item.checkStatus,
        reason: item.reason,
      });
    }
    object.profiles = profiles;
    object.statusVehicle = this.formInfoVehicle.get('statusVehicle').value;

    if (this.dataModel.vehicleSelected?.vehicleId && this.dataModel.vehicleSelected.statusProfiles == 2 && !this.formInfoVehicle.controls.reasonVehicle.value) {
      this._toastrService.warning(this._translateService.instant('Bạn chưa nhập lý do cho phương tiện'));
      return;
    }
    let profilesVehicle = [];
    object.vehicleId = this.dataModel.vehicleSelected?.vehicleId ? this.dataModel.vehicleSelected?.vehicleId : null;
    if (this.formInfoVehicle.value?.statusVehicle == 1) {
      object.actTypeIdVehicle = ACTION_TYPE.VEHICLE_PROFILE_APPROVE;
    } else if (this.formInfoVehicle.value?.statusVehicle == 2) {
      object.actTypeIdVehicle = ACTION_TYPE.VEHICLE_PROFILE_REJECT;
    }
    const listVehicleDocument = [... this.dataSourceVehicleAttach.data];
    for (const item of listVehicleDocument) {
      profilesVehicle.push({
        vehicleProfileId: item.vehicleProfileId,
        vehicleId: item.vehicleId,
        scanFalse: item.scanFalse ? 1 : 0,
        infoFalse: item.infoFalse ? 1 : 0,
        infoFake: item.infoFake ? 1 : 0,
        noScan: item.noScan ? 1 : 0,
        checkStatus: item.checkStatus,
        reason: item.reason,
      });
    }
    object.profilesVehicle = profilesVehicle;
    object.reasonVehicle = this.formInfoVehicle.get('reasonVehicle').value;
    this._documentService.approvalOrRejectProfile(object).subscribe(
      res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this._dialogRef.close(true);
          this._toastrService.success(this._translateService.instant('common.notify.save.success'));
        } else {
          this._toastrService.error(res.mess.description);
        }
      },
      err => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      },
    );
  }

  viewProfile(row) {
    this.isFullSize = false;
    if (row.contractProfileId) {
      this._contractService.downloadProfileByContract(row.contractProfileId).subscribe(rs => {
        this.handleViewProfile(row, rs);
      });
    } else if (row.vehicleProfileId) {
      this._searchInformationCustomerService.downloadFileVehicle(row.vehicleProfileId).subscribe(rs => {
        this.handleViewProfile(row, rs.body);
      });
    }
  }

  handleViewProfile(row, fileData) {
    this.fullFileData = fileData;
    this.fileName = row.fileName;
    const fileExtension = row.fileName.split('.')[1];
    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    reader.onload = (readerEvt: any) => {
      if (fileExtension === 'pdf') {
        row.safeUrl = this._domSanitizationService.bypassSecurityTrustUrl(readerEvt.target.result);
        this.fileData = row.safeUrl.changingThisBreaksApplicationSecurity;
      } else {
        this.fileData = this._domSanitizationService.bypassSecurityTrustUrl(
          readerEvt.target.result,
        );
      }
      this.fileExtension = fileExtension;
    };
  }

  downloadFile() {
    FileSaver.saveAs(this.fullFileData, this.fileName);
  }

  print() {
    if (this.fileExtension === 'pdf') {
      const file = new Blob([this.fullFileData], { type: 'application/pdf;base64' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } else {
      const file = new Blob([this.fullFileData], { type: 'image/png;base64' });
      const fileURL = URL.createObjectURL(file);
      const popupWin = window.open();
      popupWin.document.open();
      popupWin.document.write(
        '<html><head></head><body onload="window.print()">' +
        '<img src=\'' +
        fileURL +
        '\'\'>' +
        '</html>',
      );
      popupWin.document.close();
    }
  }

  setFullSize(bool: boolean) {
    this.isFullSize = bool;
  }

  showVehicleGroupName(id: any): string {
    const vehicleGroup = this.vehicleGroup.find(item => item.id == id);
    if (vehicleGroup) return vehicleGroup.name;
    return '';
  }

  showVehicleTypeName(id: any): string {
    const vehicleType = this.vehicleType.find(item => item.id == id);
    if (vehicleType) return vehicleType.name;
    return '';
  }

  viewFileVehicle(row) {
    if (row) {
      this.checkValidForm = true
    }
    this.dataModel.vehicleSelected = row;
    this.dataSourceVehicleAttach.data = this.listFile.filter(
      item => item.vehicleId === row.vehicleId,
    );
    this.formInfoVehicle.controls.reasonVehicle.setValue(row.reason || '')
  }

  checkButtonView(row) {
    this.dataSourceVehicleAttach.data = this.listFile.map(x => {
      x.reason = x.reason ?? '';
      return x;
    }
    );
  }

  viewFormDocumentVehicle() {
    this.checkValidForm = true;
  }

  checkDataReasonContract() {
    if (this.dataModel.optionContractStatus == 1) {
      this.formDocument.controls.reason.reset();
      this.formDocument.controls.reason.clearValidators();
      this.formDocument.controls.reason.updateValueAndValidity();
    }
    if (this.dataModel.optionContractStatus == 2) {
      this.formDocument.controls.reason.reset();
      this.checkValidButton = false;
    }
  }

  checkDataReasonVehicle() {
    if (this.dataModel.vehicleSelected.statusProfiles == 1) {
      this.formInfoVehicle.controls.reasonVehicle.reset();
      this.formInfoVehicle.controls.reasonVehicle.clearValidators();
      this.formInfoVehicle.controls.reasonVehicle.updateValueAndValidity();
    }
    if (this.dataModel.vehicleSelected.statusProfiles == 2) {
      this.formInfoVehicle.controls.reasonVehicle.reset();
      this.checkValidButton = false;
    }
  }

  checkValidate(value: string): void {
    if (!value) {
      this.checkValidButton = true;
    } else {
      this.checkValidButton = false;
    }
  }

  showImg(img) {
    const imgs = [{ src: img.changingThisBreaksApplicationSecurity }];
    let options: PhotoViewer.Options = {};
    options = {
      title: false,
    };
    this._viewer = new PhotoViewer(imgs, options);
  }
}

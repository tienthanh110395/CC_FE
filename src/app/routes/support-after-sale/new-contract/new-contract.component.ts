import { DecimalPipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { DetachContractService } from '@app/core/services/support-after-sale/detach-contract/detach-contract.service';
import { SharedDirectoryService, CommonCRMService, CUSTOMER_TYPE, ACTION_TYPE, CUSTOMER_TYPE_ID, HTTP_CODE } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { DetachContractStore } from '../detach-contract/detach-contract.store';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.component.html',
  styleUrls: ['./new-contract.component.scss'],
  providers: [DecimalPipe]
})
export class NewContractComponent extends BaseComponent implements OnInit, OnDestroy {

  maxSignDay = null;
  resultList = [];
  signDate = new Date(Date.now());
  effDate = new Date(Date.now());
  maxEffDate = null;
  expDate = null;

  formSearch: FormGroup;
  // ghép API city/district/ward
  isDisableDistrict = true;
  isDisableWard = true;
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];

  // ghép API loại giấy tờ
  listDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  filteredOptions: Observable<string[]>;
  listCustomer = [];
  states = [];
  value: string;
  filteredStates = this.states;
  selectedDocument: number;
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  columnsFee: MtxGridColumn[];
  infoCustomer: any = {};
  infoSplit: any;
  subscription: Subscription;
  dataReasonType = [];
  dataFeesType = [{}, {}];
  displayedColumnsFee = ['fee', 'price'];
  reasonId: number;
  price: number;
  amount: number;
  @ViewChild('tableFee') tableFee: MatTable<any>;
  isDisbaleButton = false;

  noticeAreaName = ['', '', '', ''];
  @Input() contractId: number;
  @Input() customerId: number;
  CUSTOMER_TYPE = CUSTOMER_TYPE;
  listDataProfile = [];
  displayedColumnsProfile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  columnsProfile: MtxGridColumn[];
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  indexPaginator = 0;
  pageSizeList = [10, 20, 50, 100];

  birthDayDate: string;
  dateOfIssue: String;
  firstTime = true; // lan dau patch value tinh, phuong , xa

  formatDate = COMMOM_CONFIG.DATE_FORMAT;

  constructor(
    protected _translateService: TranslateService,
    private _detachContractService: DetachContractService,
    private _detachContractStore: DetachContractStore,
    private _sharedDirectoryService: SharedDirectoryService, // API lấy city/district/ward
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    protected _toastrService?: ToastrService,
    private _commonCRMService?: CommonCRMService,
    private readonly dp?: DecimalPipe,
  ) {
    super();

    this.formSearch = this.fb.group({
      noticeName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
      noticeAreaCode: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      noticeAreaName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      noticePhoneNumber: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      noticeEmail: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), ValidationService.cannotWhiteSpace]],
      goicuoc: [''],
      chuky: [''],
      thongbao: [''],
      receiveEmail: [''],
      receiveNotify: [''],
      receiveSMS: [''],
      extendSMS: [''],

      contractNo: [''],
      signDate: [new Date(Date.now()), Validators.required],
      accountUser: [''],
      effDate: [new Date(Date.now()), Validators.required],
      expDate: [''],
      signName: [''],
      gender: [''],
      license: [''],
      lydo: ['', Validators.required]
    });
    this.dataModel.pushNotification = true;
    this.columnsFee = [
      { i18n: 'customer-management.formCaculateChangeFee.feeType', field: 'fee', disabled: true },
      { i18n: 'customer-management.formCaculateChangeFee.price', field: 'price', disabled: true },
    ];
  }

  ngOnInit() {
    this.getListOptionCity();
    this.changeValueCity();
    this.changeValueDistrict();
    this.changeValueWard();
    this.changeValueStreet();
    this.getListDocumentTypeObject();
    this.subscribleDetachContractStore();
    this.changeValueForm();
    super.mapColumn();
    this.dataModel.payCharge = '1';
    this.dataModel.billCycle = '1';
    this.bindFee();
  }

  async bindFee() {
    await this.getReason();
    await this.getFees();
  }

  async getReason() {
    const res = await (this._commonCRMService.getReason(ACTION_TYPE.TACH_HD).toPromise());
    this.dataReasonType = res.data;
    this.formSearch.controls.lydo.setValue(this.dataReasonType[0].id);
  }

  async getFees() {
    if (this.formSearch.controls.lydo.value) {
      const res = await (this._commonCRMService.getFeesReason(this.formSearch.controls.lydo.value).toPromise())
      const feeType = {
        fee: this._translateService.instant('support-after-sale.transfer-own-vehicle.fee_change_title'), price: res?.data?.fee || 0
      };
      feeType.price = this.dp.transform(feeType.price);
      this.dataFeesType[0] = feeType;
      const feeTotal = {
        fee: this._translateService.instant('support-after-sale.transfer-own-vehicle.total_fee'), price: res?.data?.fee || 0
      };
      feeTotal.price = this.dp.transform(feeTotal.price);
      this.dataFeesType[1] = feeTotal;
      this.tableFee.renderRows();
    }
  }

  inItColumns() {
    this.translateService.get('customer-management.updateProfileTable').subscribe(res => {
      this.columnsProfile = [
        { i18n: res.stt, field: 'stt', disabled: true },
        { i18n: res.documentType, field: 'documentType', disabled: true },
        { i18n: res.documentName, field: 'documentName', disabled: true },
        { i18n: res.actionDelete, field: 'actionDelete', disabled: true }
      ];
    });
  }

  renderTable() {
    this.dataSourceProfile.paginator = this.paginatorProfile;
    this.tableProfile.renderRows();
  }

  onPaginateChange(event) {
    this.indexPaginator = event.pageIndex * event.pageSize;
  }

  deleteProfile(i) {
    this.confirmDialogDeleteProfile(i);
  }

  confirmDialogDeleteProfile(i) {
    this.listDataProfile.splice(i + this.indexPaginator, 1);
    this.renderTable();
  }

  changeValueForm() {
    this.formSearch.valueChanges.subscribe(valForm => {
      if (this.formSearch.valid || this.formSearch.controls.lydo.value) {
        if (this.formSearch.controls.receiveEmail.value || this.formSearch.controls.receiveNotify.value || this.formSearch.controls.receiveSMS.value) {
          this.isDisbaleButton = false;
        } else {
          this.isDisbaleButton = true;
        }
      }
    });
  }

  onKeydownNumberPhone(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9 || key == 'Backspace')) {
      return false;
    }
  }

  resetAllForm() {
    this.value = null;
    this.formSearch.reset();
    this.dataModel.payCharge = '1';
    this.dataModel.billCycle = '1';
    this.resultList = [];
    this.totalRecord = 0;
    this.dataFeesType = null;
    this.dataSourceProfile = null;
    this.formSearch.controls.noticeName.clearValidators();
    this.formSearch.controls.noticeName.updateValueAndValidity();
    this.formSearch.controls.city.clearValidators();
    this.formSearch.controls.city.updateValueAndValidity();
    this.formSearch.controls.district.clearValidators();
    this.formSearch.controls.district.updateValueAndValidity();
    this.formSearch.controls.ward.clearValidators();
    this.formSearch.controls.ward.updateValueAndValidity();
    this.formSearch.controls.noticeAreaCode.clearValidators();
    this.formSearch.controls.noticeAreaCode.updateValueAndValidity();
    this.formSearch.controls.noticeAreaName.clearValidators();
    this.formSearch.controls.noticeAreaName.updateValueAndValidity();
    this.formSearch.controls.noticePhoneNumber.clearValidators();
    this.formSearch.controls.noticePhoneNumber.updateValueAndValidity();
    this.formSearch.controls.noticeEmail.clearValidators();
    this.formSearch.controls.noticeEmail.updateValueAndValidity();
    this.formSearch.controls.lydo.clearValidators();
    this.formSearch.controls.lydo.updateValueAndValidity();
  }

  async subscribleDetachContractStore() {
    this._detachContractStore.currentListContractDetach$.subscribe(async rs => {
      if (rs) {
        // this.getFees(rs.infoContract.custId);
        this.infoSplit = rs;
        // this.formSearch.controls['contractNo'].setValue('gọi api');
        this.infoCustomer = (await this._detachContractService.findOne(rs.infoContract.custId, '/customers').toPromise()).data.listData[0];
        // lấy thông tin người đăng nhập
        this.formSearch.controls.accountUser.setValue(AppStorage.getUserLogin());
        if (this.infoCustomer.custTypeId === CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC || this.infoCustomer.custTypeId === CUSTOMER_TYPE_ID.CA_NHAN_NUOC_NGOAI) {
          // nếu là KHCN thì lấy thông tin khách hàng cá nhân
          this.formSearch.controls.signName.setValue(this.infoCustomer.custName);
        } else {
          // nếu là khách hàng doanh nghiệp
          // auth: người ủy quyền
          // nếu có người ủy quyền  thì set bằng người ủy quyền, còn không thì lấy người đại diên
          this.formSearch.controls.signName.setValue(this.infoCustomer.authName ? this.infoCustomer.authName : this.infoCustomer.repName);
        }
      }
    });
  }

  onClickCopyCustomerInfor(event) {
    this.firstTime = true;
    if (this.infoCustomer.custId) {
      this.dataModel.noticeName = this.infoCustomer.custName;
      this.dataModel.noticePhoneNumber = this.infoCustomer.phoneNumber;
      this.dataModel.noticeEmail = this.infoCustomer.email;
      this.dataModel.noticeAreaCode = this.infoCustomer.areaCode;
      this.dataModel.ward = this.infoCustomer.areaCode;
      this.dataModel.noticeStreet = this.infoCustomer.street;
      this.dataModel.noticeAreaName = this.infoCustomer.areaName;
      this.bindData();
      this.patchValueAddress();
    }
    event.stopPropagation();
  }

  async bindData() {
    await this.getListOptionCity();
    await this.getListOptionDistrict(this.formSearch.get('city').value);
    await this.getListOptionWard(this.formSearch.get('district').value);
    await this.getAddressByCode();
  }

  async getAddressByCode() {
    const info = (await this._sharedDirectoryService.getAddressByCode(this.infoCustomer.areaCode).toPromise()).data[0];
    this.formSearch.controls.city.setValue(info.province);
    this.formSearch.controls.district.setValue(info.district);
  }

  patchValueAddress() {
    const findCity = this.listOptionCity.find(x => x.code == this.formSearch.get('city').value);
    this.noticeAreaName[3] = findCity ? ` - ${findCity.value}` : '';
    const findDictrict = this.listOptionDistrict.find(x => x.code == this.formSearch.get('district').value);
    this.noticeAreaName[2] = findDictrict ? ` - ${findDictrict.value}` : '';
    const findWard = this.listOptionWard.find(x => x.code == this.formSearch.get('ward').value);
    this.noticeAreaName[1] = findWard ? ` - ${findWard.value}` : '';
    this.dataModel.noticeAreaName = this.noticeAreaName.join('');
  }

  changeValueCity() {
    this.formSearch.get('city').valueChanges.subscribe(res => {
      if (!this.firstTime) {
        this.formSearch.controls.district.setValue(null);
        this.formSearch.controls.ward.setValue(null);
      }
      if (res) {
        const findCity = this.listOptionCity.find(x => x.code == res);
        if (findCity) {
          this.noticeAreaName[3] = ` - ${findCity.value}`;
          this.dataModel.noticeAreaName = this.noticeAreaName.join('');
        }
        this.listOptionDistrict = [];
        this.listOptionWard = [];
        this.getListOptionDistrict(res);
      }
    });
  }

  changeValueDistrict() {
    this.formSearch.get('district').valueChanges.subscribe(res => {

      if (res) {
        if (this.firstTime) {
          this.firstTime = false;
        }
        else {
          this.formSearch.controls.ward.setValue(null);
        }
        const findDistrict = this.listOptionDistrict.find(x => x.code == res);
        if (findDistrict) {
          this.noticeAreaName[2] = ` - ${findDistrict.value}`;
          this.dataModel.noticeAreaName = this.noticeAreaName.join('');
        }
        this.listOptionWard = [];
        this.getListOptionWard(res);
      }
      else {
        if (!this.firstTime)
          this.formSearch.controls.ward.setValue(null);
      }
    });
  }

  changeValueWard() {
    this.formSearch.get('ward').valueChanges.subscribe(res => {
      const findWard = this.listOptionWard.find(x => x.code == res);
      if (findWard) {
        this.noticeAreaName[1] = ` - ${findWard.value}`;
        this.dataModel.noticeAreaName = this.noticeAreaName.join('');
      }
    });
  }

  changeValueStreet() {
    this.formSearch.get('noticeAreaCode').valueChanges.subscribe(res => {
      if (res) {
        this.noticeAreaName[0] = res.trim();
        this.dataModel.noticeAreaName = this.noticeAreaName.join('');
      }
    });
  }

  getListDocumentTypeObject() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.TACH_HD).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: val.id,
          value: val.val
        };
      });
    });
  }

  confirmDialog(value?: any): void {
    const dialogData = new ConfirmDialogModel(this._translateService.instant('common.notification'), this._translateService.instant('support-after-sale.detach-contract.confirm-detach-contract'));

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.isLoading = true;
        this.onSave();
      }
    });
  }
  async filter(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filteredStates = [];
    const data = (await this._detachContractService.searchCustomerInfo(value).toPromise()).data;
    if (data.listData.length > 0) {
      data.listData.forEach(element => {
        this.filteredStates.push(element);
      });
    }
    return this.filteredStates;
  }

  getOptionText(option) {
    if (option) {
      return option.documentNumber;
    }
  }

  async getListOptionCity() {
    const city = (await this._sharedDirectoryService.getListAreas().toPromise()).data;
    this.listOptionCity = city.map(val => {
      return {
        code: val.area_code,
        value: val.name
      };
    });
    this.patchValueAddress();
  }

  async getListOptionDistrict(city) {
    const district = (await this._sharedDirectoryService.getListAreas(city).toPromise()).data;
    this.listOptionDistrict = district.map(val => {
      return {
        code: val.area_code,
        value: val.name
      };
    });
    this.patchValueAddress();
  }

  async getListOptionWard(district) {
    const area = (await this._sharedDirectoryService.getListAreas(district).toPromise()).data;
    this.listOptionWard = area.map(val => {
      return {
        code: val.area_code,
        value: val.name
      };
    });
    this.patchValueAddress();
  }

  // file
  chooseFileChange(event) {

    this.chooseFileModal(event, AttachFileComponent);
  }

  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      panelClass: 'my-dialog',
      width: '600px',
      data: { record },
    }, componentTemplate);
    dialog.afterClosed().subscribe(res => {
      if (res) {
        const licenseName = this.selectedDocument ? this.listOptionLicense.filter(license => license.id == this.selectedDocument)[0].value : '';
        res.forEach(file => {
          const license = {
            documentType: licenseName,
            documentTypeId: this.selectedDocument,
            documentName: file.fileName,
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileBase64: file.fileBase64,
            fullBase64: file.fullBase64
          };
          this.listDataProfile.push(license);
        });
        this.renderTable();
      }
    });
  }

  viewProfile(row) {
    const checkExtension = row.documentName.split('.')[1];
    if (checkExtension != 'pdf') {
      this.openViewImageProfile(row);
    } else {
      this.openViewPdfProfile(row);
    }
  }

  openViewImageProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFileImageComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }

  openViewPdfProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFilePdfComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }

  onSaveContract() {
    if (COMMOM_CONFIG.REQUIRE_DOCUMENT) {
      let listAcceptDocument = [1, 2, 3, 4];
      if (this.infoCustomer?.custTypeId != 1 && this.infoCustomer?.custTypeId != 7) {
        listAcceptDocument = [1, 2, 3];
        if (!this.dataSourceProfile.data.some(x => x.documentTypeId == 8) && this.infoCustomer?.custTypeId != 6) {
          this._toastrService.error(this._translateService.instant('support-after-sale.detach-contract.required_document_certificate_enterprise'));
          return
        }
      }
      const checkList = this.dataSourceProfile.data.some(x => listAcceptDocument.indexOf(x.documentTypeId) >= 0);
      if (!checkList) {
        this.infoCustomer?.custTypeId == 1 ? this._toastrService.error(this._translateService.instant('support-after-sale.detach-contract.required_document')) : this._toastrService.error(this._translateService.instant('support-after-sale.detach-contract.required_document_enterprise'));
        return
      }
    }
    this.confirmDialog();
  }

  onSave() {
    this.dataModel.noticeName = this.formSearch.value.noticeName ? this.formSearch.value.noticeName.trim() : '';
    this.dataModel.noticeStreet = this.formSearch.value.noticeAreaCode ? this.formSearch.value.noticeAreaCode.trim() : '';
    this.dataModel.noticeAreaName = this.formSearch.value.noticeAreaName ? this.formSearch.value.noticeAreaName.trim() : '';
    this.dataModel.noticePhoneNumber = this.formSearch.value.noticePhoneNumber ? this.formSearch.value.noticePhoneNumber.trim() : '';
    this.dataModel.noticeEmail = this.formSearch.value.noticeEmail ? this.formSearch.value.noticeEmail.trim() : '';
    this.dataModel.noticeAreaCode = this.formSearch.value.ward;
    this.dataModel.actTypeId = ACTION_TYPE.TACH_HD;
    this.dataModel.signDate = this.signDate ? format(this.signDate, COMMOM_CONFIG.DATE_TIME_FORMAT) : null;
    this.dataModel.effDate = this.effDate ? format(this.effDate, COMMOM_CONFIG.DATE_TIME_FORMAT) : null;
    this.dataModel.expDate = this.expDate ? format(this.expDate, COMMOM_CONFIG.DATE_TIME_EXPIRE_FORMAT) : null;
    this.dataModel.emailNotification = this.dataModel.emailNotification ? 1 : 0;
    this.dataModel.pushNotification = this.dataModel.pushNotification ? 1 : 0;
    this.dataModel.smsNotification = this.dataModel.smsNotification ? 1 : 0;
    this.dataModel.extendSMS = this.formSearch.controls.extendSMS.value ? 1 : 0;
    this.dataModel.reasonId = this.formSearch.controls.lydo.value ? this.formSearch.controls.lydo.value : null;
    this.dataModel.price = this.price;
    this.dataModel.amount = this.amount;
    this.dataModel.contractProfileDTOs = this.listDataProfile.map(x => {
      return {
        documentTypeId: x.documentTypeId,
        fileName: x.fileName,
        fileBase64: x.fileBase64
      };
    });
    if (!this.dataModel.expDate) {
      delete this.dataModel.expDate;
    }
    this.dataModel.vehicleIds = this.infoSplit.listVehicleSplit.map(x => x.vehicleId);
    this._detachContractService.splitContracts(this.dataModel, this.infoCustomer.custId, this.infoSplit.infoContract.contractId).subscribe(rs => {
      this.isDisbaleButton = true;
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('support-after-sale.detach-contract.success-detach-contract'));
        this.dataFeesType = [];
      } else {
        this._toastrService.error(rs.mess.description);
      }
    }, err => {
      this.isLoading = false;
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }
}

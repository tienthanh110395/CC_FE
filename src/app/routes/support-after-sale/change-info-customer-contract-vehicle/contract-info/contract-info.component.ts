import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SelectOptionModel } from '@app/core/models/common.model';
import { ChangeInfoCustomerContractVehicle } from '@app/core/services/support-after-sale/change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.service';
import { ACTION_TYPE, CommonCRMService, HTTP_CODE, SharedDirectoryService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contract-info',
  templateUrl: './contract-info.component.html',
  styleUrls: ['./contract-info.component.scss']
})
export class ContractInfoComponent extends BaseComponent implements OnInit {
  formInfo: FormGroup;
  isDisableDistrict = true;
  isDisableWard = true;
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionReason: SelectOptionModel[] = [] as SelectOptionModel[];
  address = ['', '', '', ''];
  detailAddress: any;
  detailCustomer: any;
  @Input() dataContract: any;

  @Input() dataCust: any;

  constructor(
    protected _translate: TranslateService,
    private _sharedDirectoryService: SharedDirectoryService, // API lấy city/district/ward
    private _commonCRMService: CommonCRMService,
    private _changeInfoCustomerContractVehicleService: ChangeInfoCustomerContractVehicle,
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    protected toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.formInfo = this.fb.group({
      contractNo: [''],
      signDate: [''],
      effDate: [''],
      signName: [''],
      expDate: [''],
      noticeName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace],],
      city: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
      street: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace],],
      address: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace],],
      noticePhoneNumber: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT), ValidationService.cannotWhiteSpace],],
      noticeEmail: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), Validators.maxLength(255), ValidationService.cannotWhiteSpace,],],
      goicuoc: ['', Validators.required],
      chuky: ['', Validators.required],
      thongbao: [''],
      lydo: ['', Validators.required],
      receiveEmail: [''],
      receiveNotify: [''],
      receiveSMS: [''],
      smsRenew: [''],
      reason: ['']
    });
    this.bindData();
    this.getListCity();
  }

  async getReason() {
    const res = await (this._commonCRMService.getReason(ACTION_TYPE.THAY_DOI_KH).toPromise());
    this.listOptionReason = res.data;
    this.formInfo.controls.reason.setValue(this.listOptionReason[0].id);
  }

  async bindData() {
    await this.getDetail();
    await this.getReason();
    await this.getAddressDetail(this.dataCust[0].listContract[0].noticeAreaCode);
    await this.dataChangeStreet();
    await this.dataChangeWard();
    await this.pathValueForm(this.dataCust[0])
  }

  dataChangeCity(val) {
    this.formInfo.get('district').patchValue('');
    this.formInfo.get('ward').patchValue('');
    this.getListDistrict(val, false);
    this.listOptionWard = [];
    this.patchValueAddress();
  }

  dataChangeDistrict(val) {
    this.formInfo.get('ward').patchValue('');
    this.getListWard(val, false);
    this.patchValueAddress();
  }

  dataChangeWard() {
    this.formInfo.get('ward').valueChanges.subscribe(val => {
      this.patchValueAddress();
    });
  }

  dataChangeStreet() {
    this.formInfo.get('street').valueChanges.subscribe(val => {
      this.address[0] = val;
      this.patchValueAddress();
    });
  }

  getAddressDetail(areaCode) {
    this._sharedDirectoryService.getAddressByCode(areaCode).subscribe(res => {
      if (res.data.length > 0) {
        this.detailAddress = res;
        this.getListDistrict(this.detailAddress.data[0].province, true);
        this.getListWard(this.detailAddress.data[0].district, true);
      } else {
        this.formInfo.patchValue({
          city: '',
          cityName: '',
          district: '',
          districtName: [''],
          ward: '',
          wardName: '',
        });
      }
    });
  }

  getListCity() {
    this._sharedDirectoryService.getListAreas().subscribe(res => {
      this.listOptionCity = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
    });
  }

  getListDistrict(parentCode, isPatchValue) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionDistrict = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (isPatchValue) {
        this.formInfo.patchValue({
          district: this.detailAddress.data[0].district,
          city: this.detailAddress.data[0].province
        });
      }
    });
  }

  getListWard(parentCode, isPatchValue) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionWard = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (isPatchValue) {
        this.formInfo.patchValue({
          ward: this.dataCust[0].listContract[0].noticeAreaCode
        });
      }
    });
  }

  pathValueForm(formValue) {
    this.formInfo.patchValue({
      street: formValue.listContract[0].noticeStreet
    })
  }

  patchValueAddress() {
    const findCity = this.listOptionCity.find(x => x.code == this.formInfo.get('city').value);
    this.address[3] = findCity ? ` - ${findCity.value}` : '';
    const findDictrict = this.listOptionDistrict.find(x => x.code == this.formInfo.get('district').value);
    this.address[2] = findDictrict ? ` - ${findDictrict.value}` : '';
    const findWard = this.listOptionWard.find(x => x.code == this.formInfo.get('ward').value);
    this.address[1] = findWard ? ` - ${findWard.value}` : '';
    this.formInfo.get('address').patchValue(this.address.join(''));
  }

  async getDetail() {
    const res = (await this._changeInfoCustomerContractVehicleService.findOne(this.dataContract[0].listContract[0].contractId, '/customers/contracts').toPromise());
    this.formInfo.patchValue({
      goicuoc: res.data.payCharge,
      chuky: res.data.billCycle,
    });
    if (res.mess.code == HTTP_CODE.SUCCESS) {
      this.dataModel = res.data.listData[0];
      this.formInfo.controls.signDate.setValue(res.data.listData[0].signDate);
      this.formInfo.controls.effDate.setValue(res.data.listData[0].effDate);
      res.data.listData[0].expDate = res.data.listData[0].expDate ? format(res.data.listData[0].expDate, COMMOM_CONFIG.DATE_FORMAT) : '';
      this.formInfo.controls.chuky.setValue(this.dataModel.billCycle);
      this.formInfo.controls.goicuoc.setValue(this.dataModel.payCharge);
      this.formInfo.controls.receiveEmail.setValue(this.dataModel.emailNotification == 1 ? true : false);
      this.formInfo.controls.receiveNotify.setValue(this.dataModel.pushNotification == 1 ? true : false);
      this.formInfo.controls.receiveSMS.setValue(this.dataModel.smsNotification == 1 ? true : false);
      this.formInfo.controls.smsRenew.setValue(this.dataModel.smsRenew == 1 ? true : false);
    } else {
      this.toastr.error(this._translate.instant(res.mess.description));
    }
  }

  onResetForm() {
    this.bindData();
  }

  onSaveContractInfor() {
    if (
      Date.parse(this.formInfo.controls.expDate.value) >=
      Date.parse(this.formInfo.controls.effDate.value)
    ) {
      this.toastr.error(
        this._translate.instant('customer-management.formContractInfo.mess_effErro')
      );
      return;
    }
    const body = {};
    this.confirmDialogUpdate();
  }

  confirmDialogUpdate(): void {
    const message = this._translate.instant('common.confirm.save');
    const dialogData = new ConfirmDialogModel(
      this._translate.instant('common.confirm.title.save'),
      message
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const expDate = format(this.dataModel.expDate, COMMOM_CONFIG.DATE_TIME_EXPIRE_FORMAT);
        const body = {
          signName: this.dataModel.signName,
          effDate: this.dataModel.effDate ? `${this.dataModel.effDate} 00:00:00` : '',
          expDate: this.dataModel.expDate ? expDate : '',
          noticeName: this.dataModel.noticeName,
          noticeAreaCode: this.dataModel.noticeAreaCode,
          noticeStreet: this.formInfo.controls.street.value,
          noticeAreaName: this.formInfo.controls.address.value,
          noticePhoneNumber: this.dataModel.noticePhoneNumber ? this.dataModel.noticePhoneNumber.trim() : '',
          noticeEmail: this.dataModel.noticeEmail ? this.dataModel.noticeEmail.trim() : '',
          billCycle: this.formInfo.controls.chuky.value,
          payCharge: this.formInfo.controls.goicuoc.value,
          emailNotification: this.formInfo.controls.receiveEmail.value ? '1' : '0',
          smsNotification: this.formInfo.controls.receiveSMS.value ? '1' : '0',
          smsRenew: this.formInfo.controls.smsRenew.value ? '1' : '0',
          pushNotification: this.formInfo.controls.receiveNotify.value ? '1' : '0',
          reasonId: this.formInfo.controls.reason.value,
          actTypeId: ACTION_TYPE.THAY_DOI_HD,
        };
        this._changeInfoCustomerContractVehicleService.updateContract(body, this.dataCust[0].listContract[0].custId, this.dataCust[0].listContract[0].contractId).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.toastr.success(this._translate.instant('common.notify.save.success'));
          } else {
            this.toastr.error(this._translate.instant('common.notify.fail'));
          }
        },
          error => {
            this.toastr.error(this._translate.instant(error.mess.description));
          }
        )
      }
    });
  }
}

import { DecimalPipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SelectOptionModel } from '@app/core/models/common.model';
import { ChangeInfoCustomerContractVehicle } from '@app/core/services/support-after-sale/change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.service';
import { ACTION_TYPE, CommonCRMService, CUSTOMER_TYPE, gender, HTTP_CODE, SharedDirectoryService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format, parse } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { AuthorizedComponent } from './authorized/authorized.component';
import { RepresentativeComponent } from './representative/representative.component';

@Component({
  selector: 'app-customer-info',
  templateUrl: './customer-info.component.html',
  styleUrls: ['./customer-info.component.scss'],
  providers: [DecimalPipe]
})
export class CustomerInfoComponent extends BaseComponent implements OnInit, OnChanges {

  @Input() dataCust: any;
  inforCustomerForm: FormGroup;
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionCustomerType: any = [];
  listOptionDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGender: SelectOptionModel[] = gender;
  listOptionReason: SelectOptionModel[] = [] as SelectOptionModel[];
  @ViewChild('representative') dataRepresentativeForm: RepresentativeComponent;
  @ViewChild('authorized') dataAuthorizedForm: AuthorizedComponent;
  dateNow = new Date();
  maxDOB = new Date(this.dateNow.getFullYear() - 18, this.dateNow.getMonth(), this.dateNow.getDate());

  detailAddress: any;
  customerTypeId = 1;
  checkValidFormCustomer = true;
  checkValidFormRep = true;
  checkValidFormAuthor = true;
  listDataTotal = [{}, {}];
  address = ['', '', '', ''];
  checkValidDOB = false;

  constructor(
    private fb: FormBuilder,
    public actr: ActivatedRoute,
    protected translateService: TranslateService,
    private _changeInfoCustomerContractVehicle: ChangeInfoCustomerContractVehicle,
    private _commonCRMService: CommonCRMService,
    private _sharedDirectoryService: SharedDirectoryService,
    protected toastr?: ToastrService,
    public dialog?: MtxDialog,
    private readonly dp?: DecimalPipe,
  ) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit() {
    this.inforCustomerForm = this.fb.group({
      customerType: ['', Validators.required],
      customerCode: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      dateOfBirth: [null],
      gender: [''],
      genderName: [],
      documentType: ['', Validators.required],
      documentName: [''],
      documentNumber: ['', Validators.required],
      dateRange: ['', Validators.required],
      placeOfIssue: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      city: ['', Validators.required],
      cityName: [''],
      district: ['', Validators.required],
      districtName: [''],
      ward: ['', Validators.required],
      wardName: [''],
      street: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      address: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      numberPhone: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT), ValidationService.cannotWhiteSpace]],
      email: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      reason: ['', Validators.required],
      companyName: [''],
      taxNo: [''],
      foundingDate: ['']
    });
    this.getListCity();
    this.dataChangeCustomerType();
    this.dataChangeStreet();
    this.dataChangeWard();
    this.getListCustomerType();
    this.getReason();
    this.dataFormChange();
    this.patchValueForm(this.dataCust[0])
  }

  dataChangeCity(val) {
    this.inforCustomerForm.get('district').patchValue('');
    this.inforCustomerForm.get('ward').patchValue('');
    this.getListDistrict(val, false);
    this.listOptionWard = [];
    this.patchValueAddress();
  }

  dataChangeDistrict(val) {
    this.inforCustomerForm.get('ward').patchValue('');
    this.getListWard(val, false);
    this.patchValueAddress();
  }

  dataChangeWard() {
    this.inforCustomerForm.get('ward').valueChanges.subscribe(val => {
      this.patchValueAddress();
    });
  }

  dataChangeStreet() {
    this.inforCustomerForm.get('street').valueChanges.subscribe(val => {
      this.address[0] = val;
      this.patchValueAddress();
    });
  }

  dataChangeCustomerType() {
    this.inforCustomerForm.get('customerType').valueChanges.subscribe(val => {
      if (val) {
        this.setValidate();
      }
    });
  }

  setValidate() {
    if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
      this.inforCustomerForm.controls.fullName.setValidators([Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]);
      this.inforCustomerForm.controls.fullName.updateValueAndValidity();
      this.inforCustomerForm.controls.dateOfBirth.setValidators(Validators.required);
      this.inforCustomerForm.controls.dateOfBirth.updateValueAndValidity();
      this.inforCustomerForm.controls.gender.clearValidators();
      this.inforCustomerForm.controls.gender.updateValueAndValidity();
      this.inforCustomerForm.controls.companyName.clearValidators();
      this.inforCustomerForm.controls.companyName.updateValueAndValidity();
      this.inforCustomerForm.controls.taxNo.clearValidators();
      this.inforCustomerForm.controls.taxNo.updateValueAndValidity();
      this.inforCustomerForm.controls.foundingDate.clearValidators();
      this.inforCustomerForm.controls.foundingDate.updateValueAndValidity();
    } else {
      this.inforCustomerForm.controls.companyName.setValidators([Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]);
      this.inforCustomerForm.controls.companyName.updateValueAndValidity();
      this.inforCustomerForm.controls.taxNo.setValidators(Validators.required);
      this.inforCustomerForm.controls.taxNo.updateValueAndValidity();
      this.inforCustomerForm.controls.foundingDate.setValidators(Validators.required);
      this.inforCustomerForm.controls.foundingDate.updateValueAndValidity();
      this.inforCustomerForm.controls.fullName.clearValidators();
      this.inforCustomerForm.controls.fullName.updateValueAndValidity();
      this.inforCustomerForm.controls.dateOfBirth.clearValidators();
      this.inforCustomerForm.controls.dateOfBirth.updateValueAndValidity();
      this.inforCustomerForm.controls.gender.clearValidators();
      this.inforCustomerForm.controls.gender.updateValueAndValidity();
    }
  }

  validFormRepresentative(value) {
    this.checkValidFormRep = value;
    if (this.inforCustomerForm.valid && value && this.checkValidFormAuthor) {
      this.checkValidFormCustomer = false;
    } else {
      this.checkValidFormCustomer = true;
    }
  }

  validFormAuthorized(value) {
    this.checkValidFormAuthor = value;
    if (this.inforCustomerForm.valid && value && this.checkValidFormRep) {
      this.checkValidFormCustomer = false;
    } else {
      this.checkValidFormCustomer = true;
    }
  }

  dataFormChange() {
    this.inforCustomerForm.valueChanges.subscribe(val => {
      if (val) {
        if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
          if (this.inforCustomerForm.valid) {
            this.checkValidFormCustomer = false;
          } else {
            this.checkValidFormCustomer = true;
          }
        } else {
          if (this.inforCustomerForm.valid && this.checkValidFormRep && this.checkValidFormAuthor) {
            this.checkValidFormCustomer = false;
          } else {
            this.checkValidFormCustomer = true;
          }
        }
      }
    })
  }

  patchValueForm(formValue) {
    this.inforCustomerForm.patchValue({
      customerType: formValue.custTypeId,
      customerCode: formValue.custId,
      companyName: formValue.custName,
      taxNo: formValue.taxCode,
      foundingDate: parse(formValue.birthDate, COMMOM_CONFIG.DATE_FORMAT, new Date()),
      documentType: formValue.documentTypeId,
      documentNumber: formValue.documentNumber,
      dateRange: parse(formValue.dateOfIssue, COMMOM_CONFIG.DATE_FORMAT, new Date()),
      placeOfIssue: formValue.placeOfIssue,
      street: formValue.street,
      address: formValue.areaName,
      numberPhone: formValue.phoneNumber,
      email: formValue.email,
      fullName: formValue.custName,
      dateOfBirth: parse(formValue.birthDate, COMMOM_CONFIG.DATE_FORMAT, new Date()),
      gender: formValue.gender,
    });
    this.getAddressDetail(formValue.areaCode);
    this.customerTypeId = formValue.custTypeId;
    this.getListDocumentType();
    this.setValidate();
  }

  async getReason() {
    const res = await (this._commonCRMService.getReason(ACTION_TYPE.THAY_DOI_KH).toPromise());
    this.listOptionReason = res.data;
    this.inforCustomerForm.controls.reason.setValue(this.listOptionReason[0].id);
  }

  getAddressDetail(areaCode) {
    this._sharedDirectoryService.getAddressByCode(areaCode).subscribe(res => {
      if (res.data.length > 0) {
        this.detailAddress = res;
        this.getListDistrict(this.detailAddress.data[0].province, true);
        this.getListWard(this.detailAddress.data[0].district, true);
      } else {
        this.inforCustomerForm.patchValue({
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

  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listOptionCustomerType = res.data;
    })
  }

  getListDocumentType() {
    this._commonCRMService.getListDocumentTypeByCustomer(this.inforCustomerForm.value.customerType).subscribe(res => {
      this.listOptionDocumentType = res.data.map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
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
        this.inforCustomerForm.patchValue({
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
        this.inforCustomerForm.patchValue({
          ward: this.dataCust[0].areaCode
        });
      }
    });
  }

  patchValueAddress() {
    const findCity = this.listOptionCity.find(x => x.code == this.inforCustomerForm.get('city').value);
    this.address[3] = findCity ? ` - ${findCity.value}` : '';
    const findDictrict = this.listOptionDistrict.find(x => x.code == this.inforCustomerForm.get('district').value);
    this.address[2] = findDictrict ? ` - ${findDictrict.value}` : '';
    const findWard = this.listOptionWard.find(x => x.code == this.inforCustomerForm.get('ward').value);
    this.address[1] = findWard ? ` - ${findWard.value}` : '';
    this.inforCustomerForm.get('address').patchValue(this.address.join(''));
  }

  onKeypressNumberPhone(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9)) {
      return false;
    }
  }

  onResetForm() {
    this.patchValueForm(this.dataCust[0]);
    this.inforCustomerForm.get('reason').reset();
  }

  confirmDialog(): void {
    const message = this.translateService.instant('common.confirm.update');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.update'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
          const body: any = {
            actTypeId: ACTION_TYPE.THAY_DOI_KH,
            areaCode: this.inforCustomerForm.value.ward,
            areaName: this.inforCustomerForm.value.address ? this.inforCustomerForm.value.address.trim() : '',
            birthDate: format(this.inforCustomerForm.get('dateOfBirth').value, COMMOM_CONFIG.DATE_TIME_FORMAT_3),
            custId: this.inforCustomerForm.value.customerCode,
            custName: this.inforCustomerForm.value.fullName ? this.inforCustomerForm.value.fullName.trim() : '',
            custTypeId: this.customerTypeId,
            dateOfIssue: format(this.inforCustomerForm.get('dateRange').value, COMMOM_CONFIG.DATE_TIME_FORMAT_3),
            documentNumber: this.inforCustomerForm.value.documentNumber ? this.inforCustomerForm.value.documentNumber.trim() : '',
            documentTypeId: this.inforCustomerForm.value.documentType,
            email: this.inforCustomerForm.value.email ? this.inforCustomerForm.value.email.trim() : '',
            gender: this.inforCustomerForm.value.gender,
            phoneNumber: this.inforCustomerForm.value.numberPhone ? this.inforCustomerForm.value.numberPhone.trim() : '',
            placeOfIssue: this.inforCustomerForm.value.placeOfIssue ? this.inforCustomerForm.value.placeOfIssue.trim() : '',
            reasonId: this.inforCustomerForm.value.reason,
            street: this.inforCustomerForm.value.street ? this.inforCustomerForm.value.street.trim() : ''
          };
          this._changeInfoCustomerContractVehicle.updateCustomerPersonal(this.dataCust[0].custId, body).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.toastr.success(this.translateService.instant('common.notify.update-customer'));
            } else {
              this.toastr.error(res.mess.description);
            }
          }, err => {
            this.toastr.error(this.translateService.instant('common.500Error'));
          });
        } else {
          let authBirthDate = null;
          if (this.dataAuthorizedForm.customerEnterpriseForm.value.dateOfBirth) {
            authBirthDate = format(this.dataAuthorizedForm.customerEnterpriseForm.value.dateOfBirth, COMMOM_CONFIG.DATE_TIME_FORMAT);
          }
          let authDateOfIssue = null;
          if (this.dataAuthorizedForm.customerEnterpriseForm.value.dateRange) {
            authDateOfIssue = format(this.dataAuthorizedForm.customerEnterpriseForm.value.dateRange, COMMOM_CONFIG.DATE_TIME_FORMAT);
          }
          const body = {
            actTypeId: ACTION_TYPE.THAY_DOI_KH,
            areaCode: this.inforCustomerForm.value.ward,
            areaName: this.inforCustomerForm.value.address ? this.inforCustomerForm.value.address.trim() : '',
            authAreaCode: this.dataAuthorizedForm.customerEnterpriseForm.value.ward,
            authAreaName: this.dataAuthorizedForm.customerEnterpriseForm.value.address ? this.dataAuthorizedForm.customerEnterpriseForm.value.address.trim() : '',
            authBirthDate,
            authDateOfIssue,
            authEmail: this.dataAuthorizedForm.customerEnterpriseForm.value.email ? this.dataAuthorizedForm.customerEnterpriseForm.value.email.trim() : '',
            authGender: this.dataAuthorizedForm.customerEnterpriseForm.value.gender,
            authIdentityNumber: this.dataAuthorizedForm.customerEnterpriseForm.value.documentNumber ? this.dataAuthorizedForm.customerEnterpriseForm.value.documentNumber.trim() : '',
            authIdentityTypeId: this.dataAuthorizedForm.customerEnterpriseForm.value.documentType,
            authName: this.dataAuthorizedForm.customerEnterpriseForm.value.fullName ? this.dataAuthorizedForm.customerEnterpriseForm.value.fullName.trim() : '',
            authPhoneNumber: this.dataAuthorizedForm.customerEnterpriseForm.value.numberPhone ? this.dataAuthorizedForm.customerEnterpriseForm.value.numberPhone.trim() : '',
            authPlaceOfIssue: this.dataAuthorizedForm.customerEnterpriseForm.value.placeOfIssue ? this.dataAuthorizedForm.customerEnterpriseForm.value.placeOfIssue.trim() : '',
            authStreet: this.dataAuthorizedForm.customerEnterpriseForm.value.street ? this.dataAuthorizedForm.customerEnterpriseForm.value.street.trim() : '',
            birthDate: format(this.inforCustomerForm.value.foundingDate, COMMOM_CONFIG.DATE_TIME_FORMAT_3),
            custId: this.inforCustomerForm.value.customerCode,
            custName: this.inforCustomerForm.value.companyName ? this.inforCustomerForm.value.companyName.trim() : '',
            custTypeId: this.customerTypeId,
            dateOfIssue: format(this.inforCustomerForm.value.dateRange, COMMOM_CONFIG.DATE_TIME_FORMAT_3),
            documentNumber: this.inforCustomerForm.value.documentNumber ? this.inforCustomerForm.value.documentNumber.trim() : '',
            documentTypeId: this.inforCustomerForm.value.documentType,
            email: this.inforCustomerForm.value.email ? this.inforCustomerForm.value.email.trim() : '',
            phoneNumber: this.inforCustomerForm.value.numberPhone ? this.inforCustomerForm.value.numberPhone.trim() : '',
            placeOfIssue: this.inforCustomerForm.value.placeOfIssue ? this.inforCustomerForm.value.placeOfIssue.trim() : '',
            reasonId: this.inforCustomerForm.value.reason,
            repAreaCode: this.dataRepresentativeForm.customerEnterpriseForm.value.ward,
            repAreaName: this.dataRepresentativeForm.customerEnterpriseForm.value.address ? this.dataRepresentativeForm.customerEnterpriseForm.value.address.trim() : '',
            repBirthDate: format(this.dataRepresentativeForm.customerEnterpriseForm.value.dateOfBirth, COMMOM_CONFIG.DATE_TIME_FORMAT_3),
            repDateOfIssue: format(this.dataRepresentativeForm.customerEnterpriseForm.value.dateRange, COMMOM_CONFIG.DATE_TIME_FORMAT_3),
            repEmail: this.dataRepresentativeForm.customerEnterpriseForm.value.email ? this.dataRepresentativeForm.customerEnterpriseForm.value.email.trim() : '',
            repGender: this.dataRepresentativeForm.customerEnterpriseForm.value.gender,
            repIdentityNumber: this.dataRepresentativeForm.customerEnterpriseForm.value.documentNumber ? this.dataRepresentativeForm.customerEnterpriseForm.value.documentNumber.trim() : '',
            repIdentityTypeId: this.dataRepresentativeForm.customerEnterpriseForm.value.documentType,
            repName: this.dataRepresentativeForm.customerEnterpriseForm.value.fullName ? this.dataRepresentativeForm.customerEnterpriseForm.value.fullName.trim() : '',
            repPhoneNumber: this.dataRepresentativeForm.customerEnterpriseForm.value.numberPhone ? this.dataRepresentativeForm.customerEnterpriseForm.value.numberPhone.trim() : '',
            repPlaceOfIssue: this.dataRepresentativeForm.customerEnterpriseForm.value.placeOfIssue ? this.dataRepresentativeForm.customerEnterpriseForm.value.placeOfIssue.trim() : '',
            repStreet: this.dataRepresentativeForm.customerEnterpriseForm.value.street ? this.dataRepresentativeForm.customerEnterpriseForm.value.street.trim() : '',
            street: this.inforCustomerForm.value.street ? this.inforCustomerForm.value.street.trim() : '',
            taxCode: this.inforCustomerForm.value.taxNo ? this.inforCustomerForm.value.taxNo.trim() : '',
          };
          this._changeInfoCustomerContractVehicle.updateCustomerEnterprise(this.dataCust[0].custId, body).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.toastr.success(this.translateService.instant('common.notify.update-customer'));
            } else {
              this.toastr.error(res.mess.description);
            }
          }, err => {
            this.toastr.error(this.translateService.instant('common.500Error'));
          });
        }
      }
    });
  }

  onUpdateCustomer() {
    this.confirmDialog();
  }
}

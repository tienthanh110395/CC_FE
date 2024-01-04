import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectOptionModel } from '@app/core/models/common.model';
import { gender } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { ValidationService } from '@app/shared/common/validation.service';
import parse from 'date-fns/parse';

@Component({
  selector: 'app-authorized',
  templateUrl: './authorized.component.html',
  styleUrls: ['./authorized.component.scss']
})
export class AuthorizedComponent implements OnInit, OnChanges {

  customerEnterpriseForm: FormGroup;
  listOptionGender: SelectOptionModel[] = gender;
  listOptionDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  @Output() emitValidAuthorizedPerson = new EventEmitter<boolean>();
  @Input() setValueForm: any;
  detailAddress: any;
  dateNow = new Date();
  maxDOB = new Date(this.dateNow.getFullYear() - 18, this.dateNow.getMonth(), this.dateNow.getDate());
  address = ['', '', '', ''];

  constructor(private fb: FormBuilder,
    private _sharedDirectoryService: SharedDirectoryService) { }

  ngOnInit() {
    this.buildForm();
    this.changeDataFormAuthorized();
    this.dataChangeStreet();
    this.dataChangeWard();
    this.getListCity(false);
    this.getListDocumentType();
    this.patchValueForm(this.setValueForm);
  }

  ngOnChanges(changes) {
    if (this.customerEnterpriseForm) {
      this.customerEnterpriseForm.reset();
    }
  }

  buildForm() {
    this.customerEnterpriseForm = this.fb.group({
      customerType: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      dateOfBirth: [null, Validators.required],
      gender: [''],
      documentType: ['', Validators.required],
      documentTypeName: [''],
      documentNumber: ['', Validators.required],
      dateRange: [null, Validators.required],
      placeOfIssue: ['', [Validators.required, Validators.maxLength(255)]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
      street: ['', [Validators.required, Validators.maxLength(255)]],
      address: ['', [Validators.required, Validators.maxLength(510)]],
      numberPhone: ['', Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)],
      email: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), Validators.maxLength(255), ValidationService.cannotWhiteSpace]]
    });
  }

  setDisable() {
    if (this.customerEnterpriseForm) {
      this.customerEnterpriseForm.controls.documentType.disable();
      this.customerEnterpriseForm.controls.documentNumber.disable();
    }
  }

  setEnable() {
    if (this.customerEnterpriseForm) {
      this.customerEnterpriseForm.controls.documentType.enable();
      this.customerEnterpriseForm.controls.documentNumber.enable();
    }
  }

  dataChangeCity(val) {
    this.customerEnterpriseForm.get('district').patchValue('');
    this.customerEnterpriseForm.get('ward').patchValue('');
    this.getListDistrict(val, false);
    this.listOptionWard = [];
  }

  dataChangeDistrict(val) {
    this.customerEnterpriseForm.get('ward').patchValue('');
    this.getListWard(val, false);
  }

  dataChangeWard() {
    this.customerEnterpriseForm.get('ward').valueChanges.subscribe(val => {
      this.patchValueAddress();
    });
  }

  dataChangeStreet() {
    this.customerEnterpriseForm.get('street').valueChanges.subscribe(val => {
      this.address[0] = val;
      this.patchValueAddress();
    });
  }

  patchValueAddress() {
    const findCity = this.listOptionCity.find(x => x.code == this.customerEnterpriseForm.get('city').value);
    this.address[3] = findCity ? ` - ${findCity.value}` : '';
    const findDictrict = this.listOptionDistrict.find(x => x.code == this.customerEnterpriseForm.get('district').value);
    this.address[2] = findDictrict ? ` - ${findDictrict.value}` : '';
    const findWard = this.listOptionWard.find(x => x.code == this.customerEnterpriseForm.get('ward').value);
    this.address[1] = findWard ? ` - ${findWard.value}` : '';
    this.customerEnterpriseForm.get('address').patchValue(this.address.join(''));
  }

  changeDataFormAuthorized() {
    this.customerEnterpriseForm.valueChanges.subscribe(value => {
      if ((value.fullName == '' || value.fullName == null) && (value.dateOfBirth == '' || value.dateOfBirth == null) && (value.gender == '' || value.gender == undefined)
        && (value.documentType == '' || value.documentType == undefined) && (value.documentNumber == '' || value.documentNumber == null) && (value.dateRange == '' || value.dateRange == null)
        && (value.placeOfIssue == '' || value.placeOfIssue == null) && (value.city == '' || value.city == undefined) && (value.district == '' || value.district == undefined) && (value.ward == '' || value.ward == undefined)
        && (value.street == '' || value.street == null) && (value.address == '' || value.address == null) && (value.numberPhone == '' || value.numberPhone == null) && (value.email == '' || value.email == null)) {
        this.emitValidAuthorizedPerson.emit(true);
      } else {
        if (this.customerEnterpriseForm.valid) {
          this.emitValidAuthorizedPerson.emit(true);
        } else {
          this.emitValidAuthorizedPerson.emit(false);
        }
      }
    });
  }

  patchValueForm(formValue) {
    if (formValue) {
      this.customerEnterpriseForm.patchValue({
        fullName: formValue.authName ? formValue.authName : '',
        dateOfBirth: formValue.authBirthDate ? parse(formValue.authBirthDate, COMMOM_CONFIG.DATE_FORMAT, new Date()) : '',
        gender: formValue.authGender ? formValue.authGender : '',
        documentType: formValue.authIdentityTypeId ? formValue.authIdentityTypeId : '',
        documentNumber: formValue.authIdentityNumber ? formValue.authIdentityNumber : '',
        dateRange: formValue.authDateOfIssue ? parse(formValue.authDateOfIssue, COMMOM_CONFIG.DATE_FORMAT, new Date()) : '',
        placeOfIssue: formValue.authPlaceOfIssue ? formValue.authPlaceOfIssue : '',
        street: formValue.authStreet ? formValue.authStreet : '',
        address: formValue.authAreaName ? formValue.authAreaName : '',
        numberPhone: formValue.authPhoneNumber ? formValue.authPhoneNumber : '',
        email: formValue.authEmail ? formValue.authEmail : '',
      });
      this.getAddressDetail(formValue.authAreaCode);
    }
  }

  getListDocumentType(valueSelected?: any) {
    this._sharedDirectoryService.getListDocumentType().subscribe(res => {
      this.listOptionDocumentType = res.data.map(doc => {
        return {
          code: doc.id,
          value: doc.val
        };
      });
      if (valueSelected) {
        const finDocType = this.listOptionDocumentType.find(x => x.code = valueSelected);
        if (finDocType) {
          this.customerEnterpriseForm.get('documentType').patchValue(finDocType.code);
        }
      }
    });
  }

  getAddressDetail(authAreaCode) {
    this._sharedDirectoryService.getAddressByCode(authAreaCode).subscribe(res => {
      if (res.data.length > 0) {
        this.detailAddress = res;
        this.getListCity(true, this.detailAddress.data[0].province);
        this.getListDistrict(this.detailAddress.data[0].province, true, this.detailAddress.data[0].district);
        this.getListWard(this.detailAddress.data[0].district, true, authAreaCode);
      } else {
        this.customerEnterpriseForm.patchValue({
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

  getListCity(isPatchValue, citySelected?) {
    this._sharedDirectoryService.getListAreas().subscribe(res => {
      this.listOptionCity = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (isPatchValue) {
        this.customerEnterpriseForm.patchValue({
          city: citySelected,
        });
      }
    });
  }

  getListDistrict(parentCode, isPatchValue, districtSelected?) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionDistrict = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (isPatchValue) {
        this.customerEnterpriseForm.patchValue({
          district: districtSelected,
        });
      }

    });
  }

  getListWard(parentCode, isPatchValue, wardSelected?) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionWard = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (isPatchValue) {
        this.customerEnterpriseForm.patchValue({
          ward: wardSelected
        });
      }
    });
  }

  onKeypressNumberPhone(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9)) {
      return false;
    }
  }

}

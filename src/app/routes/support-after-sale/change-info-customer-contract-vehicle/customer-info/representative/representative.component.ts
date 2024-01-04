import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectOptionModel } from '@app/core/models/common.model';
import { gender } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared';
import { COMMOM_CONFIG } from '@env/environment';
import { ValidationService } from '@app/shared/common/validation.service';
import parse from 'date-fns/parse';

@Component({
  selector: 'app-representative',
  templateUrl: './representative.component.html',
  styleUrls: ['./representative.component.scss']
})
export class RepresentativeComponent implements OnInit, OnChanges {

  customerEnterpriseForm: FormGroup;
  listOptionGender: SelectOptionModel[] = gender;
  listOptionDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  @Output() emitValidEnterprise = new EventEmitter<boolean>();
  @Input() setValueForm: any;
  detailAddress: any;
  dateNow = new Date();
  maxDOB = new Date(this.dateNow.getFullYear() - 18, this.dateNow.getMonth(), this.dateNow.getDate());
  address = ['', '', '', ''];

  constructor(private fb: FormBuilder,
    private _sharedDirectoryService: SharedDirectoryService) { }

  ngOnInit() {
    this.buildForm();
    this.changeValueForm();
    this.dataChangeStreet();
    this.dataChangeWard();
    this.getListCity(false);
    this.patchValueForm(this.setValueForm);
    this.getListDocumentType();
  }

  ngOnChanges(changes) {
    if (changes.setValueForm.currentValue.data?.listData.length > 0) {
      this.getAddressDetail(this.setValueForm.data.listData[0].repAreaCode);
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

  changeValueForm() {
    this.customerEnterpriseForm.valueChanges.subscribe(val => {
      this.emitValidEnterprise.emit(this.customerEnterpriseForm.invalid);
    });
  }

  patchValueForm(formValue) {
    if (formValue) {
      this.customerEnterpriseForm.patchValue({
        fullName: formValue.repName ? formValue.repName : '',
        dateOfBirth: formValue.repBirthDate ? parse(formValue.repBirthDate, COMMOM_CONFIG.DATE_FORMAT, new Date()) : '',
        gender: formValue.repGender ? formValue.repGender : '',
        documentNumber: formValue.repIdentityNumber ? formValue.repIdentityNumber : '',
        dateRange: formValue.repDateOfIssue ? parse(formValue.repDateOfIssue, COMMOM_CONFIG.DATE_FORMAT, new Date()) : '',
        placeOfIssue: formValue.repPlaceOfIssue ? formValue.repPlaceOfIssue : '',
        street: formValue.repStreet ? formValue.repStreet : '',
        address: formValue.repAreaName ? formValue.repAreaName : '',
        numberPhone: formValue.repPhoneNumber ? formValue.repPhoneNumber : '',
        email: formValue.repEmail ? formValue.repEmail : '',
        documentType: formValue.repIdentityTypeId ? formValue.repIdentityTypeId : '',
      });
    }
    this.getAddressDetail(formValue.repAreaCode);
  }

  dataChangeCity(val) {
    this.customerEnterpriseForm.get('district').patchValue('');
    this.customerEnterpriseForm.get('ward').patchValue('');
    this.getListDistrict(val, false);
    this.listOptionWard = [];
    this.patchValueAddress();
  }

  dataChangeDistrict(val) {
    this.customerEnterpriseForm.get('ward').patchValue('');
    this.getListWard(val, false);
    this.patchValueAddress();
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

  getListDocumentType() {
    this._sharedDirectoryService.getListDocumentType().subscribe(res => {
      this.listOptionDocumentType = res.data.map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
    });
  }

  getAddressDetail(repAreaCode) {
    this._sharedDirectoryService.getAddressByCode(repAreaCode).subscribe(res => {
      if (res.data.length > 0) {
        this.detailAddress = res;
        this.getListCity(true, this.detailAddress.data[0].province);
        this.getListDistrict(this.detailAddress.data[0].province, true, this.detailAddress.data[0].district);
        this.getListWard(this.detailAddress.data[0].district, true, repAreaCode);
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

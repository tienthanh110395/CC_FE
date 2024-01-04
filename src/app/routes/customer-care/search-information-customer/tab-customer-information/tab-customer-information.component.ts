import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { STATUS_CUSTOMER } from '@app/shared/constant/common.constant';
import { AppStorage } from '@core/services/AppStorage';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-tab-customer-information',
  templateUrl: './tab-customer-information.component.html',
  styleUrls: ['./tab-customer-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabCustomerInformationComponent extends BaseComponent implements OnInit {
  @Input('data') resultSearch = [];
  username = AppStorage.getAccessToken().preferred_username;
  inforForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private _translateService: TranslateService,
    public dialog?: MtxDialog,
  ) {
    super(_translateService, dialog)
  }

  ngOnInit(): void {
    this.resultSearch[0].statusName = this.resultSearch[0].status == '1' ? this._translateService.instant('common.active') : this._translateService.instant('common.deadActive')
    this.buildForm();
    this.pathValueForm(this.resultSearch[0])
  }

  onTabChanged(event) {
    this.dataModel.currentIndexTab = event.index;
  }

  buildForm() {
    this.inforForm = this.fb.group({
      customerType: [''],
      customerCode: [''],
      username: [''],
      fullName: [''],
      dateOfBirth: [null],
      gender: [''],
      contractNo: [''],
      status: [''],
      effDate: [''],
      expDate: [''],
      signName: [''],
      signDate: [''],
      classify: [''],
      documentNumber: [''],
      dateRange: [''],
      placeOfIssue: [''],
      address: [''],
      numberPhone: [''],
      email: [''],
    });
  }

  profileStatus(event) {
    if (event) {
      this.resultSearch[0].profileStatus = event;
    }
  }

  pathValueForm(formValue) {
    let statusCustomer: string = ''
    if (formValue.status == STATUS_CUSTOMER.HOATDONG) {
      statusCustomer = "Hoạt động"
    } else if (formValue.status == STATUS_CUSTOMER.CHUAHOATDONG) {
      statusCustomer = "Không hoạt động"
    }
    this.inforForm.patchValue({
      customerType: formValue.custTypeName,
      customerCode: formValue.custId,
      username: formValue.listContract[0].createUser,
      fullName: formValue.custName,
      gender: formValue.gender ? 'Nam' : 'Nữ',
      dateOfBirth: formValue.birthDate,
      documentNumber: formValue.documentNumber,
      dateRange: formValue.dateOfIssue,
      placeOfIssue: formValue.placeOfIssue,
      address: formValue.areaName,
      numberPhone: formValue.phoneNumber,
      email: formValue.email,
      status: statusCustomer,
    })
  }
}

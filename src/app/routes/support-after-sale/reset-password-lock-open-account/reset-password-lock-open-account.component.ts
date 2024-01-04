import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RESOURCE } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import { ToastrService } from 'ngx-toastr';
import { ChooseCustomerComponent } from './choose-customer/choose-customer.component';

@Component({
  selector: 'app-reset-password-lock-open-account',
  templateUrl: './reset-password-lock-open-account.component.html',
  styleUrls: ['./reset-password-lock-open-account.component.scss']
})
export class ResetPasswordLockOpenAccountComponent extends BaseComponent implements OnInit {

  selectedSearch = 1;
  titleSearch = this.translateService.instant('info.phoneNumber')
  activeForm = false;
  username = AppStorage.getAccessToken().preferred_username;
  dataContract;
  contractId;
  listMedia = [];
  listTypeVehicle = [];
  balance = '';

  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private dmdcService: DmdcService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(dmdcService, RESOURCE.CC, toastr, translateService);
  }

  ngOnInit(): void {
    this.buildForm();
    this.typeVehicle();
  }

  changeRadio(event) {
    this.formSearch.controls['phoneAndcontractNo'].reset();
    this.formSearch.controls['plateType'].reset();
    this.formSearch.controls['plateNumber'].reset();
    if (event.value === '1') {
      this.titleSearch = this.translateService.instant('info.phoneNumber');
      this.formSearch.controls['plateType'].disable();
      this.formSearch.controls['plateNumber'].disable();
      this.formSearch.controls['phoneAndcontractNo'].enable();
      this.selectedSearch = 1;
    } else if (event.value === '2') {
      this.titleSearch = this.translateService.instant('contract.number');
      this.formSearch.controls['plateType'].disable();
      this.formSearch.controls['plateNumber'].disable();
      this.formSearch.controls['phoneAndcontractNo'].enable();
      this.selectedSearch = 2;
    } else {
      this.selectedSearch = 3;
      this.formSearch.controls['phoneAndcontractNo'].disable();
      this.formSearch.controls['plateType'].enable();
      this.formSearch.controls['plateNumber'].enable();

    }
  }

  buildForm() {
    this.formSearch = this.fb.group({
      phoneAndcontractNo: ['', Validators.required],
      plateType: [{ value: '', disabled: true }, Validators.required],
      plateNumber: [{ value: '', disabled: true }, Validators.required],
      startDate: [''],
      endDate: [''],

    });
  }

  searchInfo() {
    if (this.formSearch.valid) {
      let body = {};
      body['startrecord'] = this.searchModel.startrecord;
      body['pagesize'] = this.searchModel.pagesize;
      if (this.selectedSearch === 1) {
        body['phoneNumber'] = this.formSearch.value.phoneAndcontractNo
      } else if (this.selectedSearch === 2) {
        body['contractNo'] = this.formSearch.value.phoneAndcontractNo
      } else {
        body['plateTypeCode'] = this.formSearch.value.plateType
        body['plateNumber'] = this.formSearch.value.plateNumber
      }
      const dialogRef = this.dialog.originalOpen(ChooseCustomerComponent, {
        width: '50%',
        data: body,
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(dialogResult => {
        this.activeForm = false;
        if (dialogResult) {
          const body = {
            custId: dialogResult.custId,
            contractId: dialogResult.contractId
          }
          this.searchInformationCustomerService.detailCustomer(body).subscribe(res => {
            if (res.mess.code === 1) {
              this.dataContract = res.data.listData;
              this.activeForm = true;
            } else {
              this.activeForm = false;
            }
          })
        }
      })
    }
  }
  onTabResetAccCPT(event) {
    if (event.index === 1) {
      this.searchInformationCustomerService.getListVehicle(this.dataContract[0].listContract[0].contractId).subscribe(res => {
        if (res.mess.code === 1) {
          this.listMedia = res.data.listData;
        }
      })
    }
  }
  typeVehicle() {
    this.dmdcService.getVehicleType().subscribe(res => {
      if (res.mess.code === 1) {
        this.listTypeVehicle = res.data;
      }
    })
  }
}

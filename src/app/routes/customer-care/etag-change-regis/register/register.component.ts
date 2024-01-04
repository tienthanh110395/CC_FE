import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RESOURCE, VehicleService } from '@app/core';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ChooseCustomerComponent } from '../../search-information-customer/choose-customer/choose-customer.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends BaseComponent implements OnInit {
  selectedSearch = 1;
  titleSearch = this.translateService.instant('info.phoneNumber');
  activeForm = false;
  activeButton = false;
  @Input() data = [];
  checkButton: boolean;
  constructor(
    private fb: FormBuilder,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private dmdcService: DmdcService,
    protected translateService: TranslateService,
    protected _vehicleService: VehicleService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(dmdcService, RESOURCE.CC_CUSTOMER, toastr, translateService);
  }

  ngOnInit() {
    this.buildForm();
    this.checkButton = true;
  }

  validCheckButton(value: string): void {
    if (value) {
      this.checkButton = false;
    } else {
      this.checkButton = true;
    }
  }

  changeRadio(event) {
    this.formSearch.controls.phoneAndcontractNo.reset();
    this.formSearch.controls.plateNumber.reset();
    if (event.value === '1') {
      this.titleSearch = this.translateService.instant('info.phoneNumber');
      this.formSearch.controls.plateNumber.disable();
      this.formSearch.controls.phoneAndcontractNo.enable();
      if (this.formSearch.value.phoneAndcontractNo == null) {
        this.checkButton = true;
      }
      this.activeButton = false;
      this.activeForm = false;
      this.selectedSearch = 1;
    } else if (event.value === '2') {
      this.titleSearch = this.translateService.instant('contract.number');
      this.formSearch.controls.plateNumber.disable();
      this.formSearch.controls.phoneAndcontractNo.enable();
      if (this.formSearch.value.phoneAndcontractNo == null) {
        this.checkButton = true;
      }
      this.activeButton = false;
      this.activeForm = false;
      this.selectedSearch = 2;
    } else {
      this.selectedSearch = 3;
      this.formSearch.controls.phoneAndcontractNo.disable();
      this.formSearch.controls.plateNumber.enable();
      if (this.formSearch.value.plateNumber == null) {
        this.checkButton = true;
      }
      this.activeButton = false;
      this.activeForm = false;
    }
  }

  buildForm() {
    this.formSearch = this.fb.group({
      phoneAndcontractNo: ['', Validators.required],
      plateNumber: ['', Validators.required],
      startDate: [''],
      endDate: [''],
    });
  }

  async searchInfo() {
    const body: any = {
    };
    body.startrecord = this.searchModel.startrecord;
    body.pagesize = this.searchModel.pagesize;
    if (this.selectedSearch === 1) {
      body.phoneNumber = this.formSearch.value.phoneAndcontractNo;
    } else if (this.selectedSearch === 2) {
      body.contractNo = this.formSearch.value.phoneAndcontractNo;
    } else {
      body.plateNumber = this.formSearch.value.plateNumber;
    }
    const searchResult = (await this.searchInformationCustomerService.searchInfoCustomer(body).toPromise());
    const params: any = {};
    if (searchResult.data.listData.length == 0) {
      this.activeButton = true;
    }
    if (searchResult.data.count) {
      const dialogRef = this.dialog.originalOpen(ChooseCustomerComponent, {
        width: '1800px',
        data: {
          listData: searchResult.data.listData,
          count: searchResult.data.count,
          body
        },
        disableClose: true,
      });
      await dialogRef.afterClosed().subscribe(dialogResult => {
        this.activeForm = false;
        if (dialogResult) {
          params.custId = dialogResult.custId,
            params.contractId = dialogResult.contractId;
          this.getDetailCustomer(params);
        }
      });
    }
  }

  getDetailCustomer(body) {
    this.searchInformationCustomerService.detailCustomer(body).subscribe(res => {
      if (res.mess.code === 1) {
        this.data = res.data.listData;
        this.activeForm = true;
      } else {
        this.activeForm = false;
      }
    });
  }
}


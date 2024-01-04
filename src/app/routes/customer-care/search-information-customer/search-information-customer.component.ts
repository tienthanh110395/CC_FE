import { Component, Inject, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RESOURCE } from '@app/core';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { AppStorage } from '@core/services/AppStorage';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ChooseCustomerComponent } from './choose-customer/choose-customer.component';
import { StatisticComponent } from './statistic/statistic.component';
@Component({
  selector: 'app-search-information-customer',
  templateUrl: './search-information-customer.component.html',
  styleUrls: ['./search-information-customer.component.scss']
})
export class SearchInformationCustomerComponent extends BaseComponent implements OnInit {
  selectedSearch = 1;
  titleSearch = this.translateService.instant('info.phoneNumber');
  activeForm = false;
  activeButton = false;
  username = AppStorage.getAccessToken().preferred_username;
  @Input() data = [];
  listMedia = [];
  listTypeVehicle = [];
  balance = '';
  @Input() resultSearch = [];
  constructor(
    private fb: FormBuilder,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private dmdcService: DmdcService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    private router: Router,
    private matDialog: MatDialog,
    public dialog?: MtxDialog,
  ) {
    super(dmdcService, RESOURCE.CC_CUSTOMER, toastr, translateService);
  }

  ngOnInit(): void {
    this.buildForm();
  }

  changeRadio(event) {
    this.formSearch.controls.phoneAndcontractNo.reset();
    this.formSearch.controls.plateNumber.reset();
    if (event.value === '1') {
      this.titleSearch = this.translateService.instant('info.phoneNumber');
      this.formSearch.controls.plateNumber.disable();
      this.formSearch.controls.phoneAndcontractNo.enable();
      this.activeButton = false;
      this.activeForm = false;
      this.selectedSearch = 1;
    } else if (event.value === '2') {
      this.titleSearch = this.translateService.instant('contract.number');
      this.formSearch.controls.plateNumber.disable();
      this.formSearch.controls.phoneAndcontractNo.enable();
      this.activeButton = false;
      this.activeForm = false;
      this.selectedSearch = 2;
    } else {
      this.selectedSearch = 3;
      this.formSearch.controls.phoneAndcontractNo.disable();
      this.formSearch.controls.plateNumber.enable();
      this.activeButton = false;
      this.activeForm = false;
    }
  }

  buildForm() {
    this.formSearch = this.fb.group({
      phoneAndcontractNo: ['', [Validators.required]],
      plateNumber: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]],
      startDate: [''],
      endDate: [''],
    });
  }

  async searchInfo() {
    if (this.formSearch.valid) {
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
  onTabChanged(event) {
    this.dataModel.currentIndexTab = event.index;
  }

  openReceiveReflect() {
    this.router.navigate(['customer-care', 'receive-reflect'])
  }

  openStatistic() {
    this.router.navigate(['customer-care', 'statistic'])
    // const dialogRef = this.matDialog.open(
    //   StatisticComponent,
    //   {
    //     width: '80%',
    //     panelClass: 'my-dialog',
    //     disableClose: true,
    //   }
    // );
    // dialogRef.afterClosed().subscribe(rs => {

    // });
  }
}

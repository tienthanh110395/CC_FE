import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { ResetPasswordLockOpenAccountService } from '@app/core/services/support-after-sale/reset-password-lock-open-account/reset-password-lock-open-account.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-impact-history',
  templateUrl: './impact-history.component.html',
  styleUrls: ['./impact-history.component.scss']
})
export class ImpactHistoryComponent extends BaseComponent implements OnInit {
  listImpactHistory = []
  @Input('custId') custId;
  @Input('contractId') contractId;
  @Input('vehicleId') vehicleId;
  @Input('listMedia') listMedia = [];

  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private _resetPassLockOpenAccService: ResetPasswordLockOpenAccountService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }

  ngOnInit() {
    this.formSearch = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'info.actionType', field: 'actionType' },
      { i18n: 'customer-care.search-information-customer.impact_person', field: 'actionUserName' },
      { i18n: 'customer-care.search-information-customer.petitioner', field: 'userName' },
      { i18n: 'customer-care.search-information-customer.reason', field: 'reason' },
    ]
  }
  searchFormImpactHistory() {
    if (this.formSearch.valid) {
      let body = {
        startDate: this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
        endDate: this.formSearch.value.endDate ? format(this.formSearch.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : '',
        startrecord: 0,
        pagesize: 10
      };
      this.searchInformationCustomerService.searchImpactHistoryVehicle(this.custId, this.contractId, this.vehicleId, body).subscribe(res => {
        if (res.mess.code === 1) {
          this.listImpactHistory = res.data.listData;
          this.totalRecord = res.data.count;
        }
      })
    }

  }
  exportExcel() {
    const body = {
      startDate: this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      endDate: this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      custId: this.custId,
      contractId: this.contractId,
      vehicleId: this.vehicleId
    }
    this.searchInformationCustomerService.exportExcelImpactHistoryVehicle(body).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
}

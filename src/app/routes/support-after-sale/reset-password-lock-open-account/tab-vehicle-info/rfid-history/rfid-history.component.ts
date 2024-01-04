import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rfid-history',
  templateUrl: './rfid-history.component.html',
  styleUrls: ['./rfid-history.component.scss']
})
export class RfidHistoryComponent extends BaseComponent implements OnInit {
  @Input('vehicleId') vehicleId;

  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'info.actionType', field: 'name' },
      { i18n: 'customer-care.search-information-customer.impact_person', field: 'actionUserName' },
      { i18n: 'info.action_date', field: 'createDate' },
      { i18n: 'customer-care.search-information-customer.epc_old', field: 'newValue' },
      { i18n: 'customer-care.search-information-customer.epc_new', field: 'oldValue' },
      { i18n: 'customer-care.search-information-customer.petitioner', field: 'custName' },
      { i18n: 'customer-care.search-information-customer.reason', field: 'reasonName' },

    ]
    this.formSearch = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
  }

  searhRFID() {
    let body = {
      startDate: this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      endDate: this.formSearch.value.endDate ? format(this.formSearch.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      startrecord: 0,
      pagesize: 10
    };
    this.searchInformationCustomerService.searchHistoryRFID(this.vehicleId, body).subscribe(res => {
      if (res.mess.code === 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }
  exportExcel() {
    let body = {
      startDate: this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      endDate: this.formSearch.value.endDate ? format(this.formSearch.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      startrecord: 0,
      pagesize: 10
    };
    this.searchInformationCustomerService.exportExcelHistoryRFID(this.vehicleId, body).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
}

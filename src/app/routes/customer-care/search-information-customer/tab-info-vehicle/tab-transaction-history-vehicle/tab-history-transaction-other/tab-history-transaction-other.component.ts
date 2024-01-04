import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tab-history-transaction-other',
  templateUrl: './tab-history-transaction-other.component.html',
  styleUrls: ['./tab-history-transaction-other.component.scss']
})
export class TabHistoryTransactionOtherComponent extends BaseComponent implements OnInit {
  @Input() vehicleId;
  @Input() contractId;
  arrStation = [];
  active = true;
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private dmdcService: DmdcService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }

  ngOnInit() {
    this.getStage();
    this.formSearch = this.fb.group({
      saleTransDateFrom: [''],
      saleTransDateTo: [''],
      stageId: ['', Validators.required],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]],
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'customer-care.search-information-customer.code_process', field: 'saleTransCode' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'Loại giao dịch', field: 'serviceFeeName' },
      { i18n: 'Người tác động', field: 'createUser' },
      { i18n: 'Thời gian giao dịch', field: 'saleTransDate' },
      { i18n: 'Số tiền (Vnđ)', field: 'amount' },
      { i18n: 'Nội dung giao dịch', field: 'saleTransContent' },
    ]
  }

  getStage() {
    this.dmdcService.getStages().subscribe(res => {
      if (res.mess.code === 1) {
        this.arrStation = res.data.listData;
      }
    });
  }

  getData() {
    let searchObj = { ... this.formSearch.value };
    searchObj.saleTransDateFrom = this.formSearch.value.saleTransDateFrom ? format(this.formSearch.value.saleTransDateFrom, COMMOM_CONFIG.DATE_FORMAT) : '',
      searchObj.saleTransDateTo = this.formSearch.value.saleTransDateTo ? format(this.formSearch.value.saleTransDateTo, COMMOM_CONFIG.DATE_FORMAT) : '',
      searchObj.startrecord = this.searchModel.startrecord;
    searchObj.pagesize = this.searchModel.pagesize;
    this.searchInformationCustomerService.searchHistotyTransactionOther(this.contractId, searchObj).subscribe(res => {
      if (res.mess.code === 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      } else {
        this.toastr.error(res.mess.description)
      }
    })
  }

  exportExcel() {
    this.searchInformationCustomerService.exportExcelHistotyTransactionOther(this.contractId, this.formSearch.value).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
}

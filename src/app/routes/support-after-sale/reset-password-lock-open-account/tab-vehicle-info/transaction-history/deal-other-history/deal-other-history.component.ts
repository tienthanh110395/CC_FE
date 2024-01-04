import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-deal-other-history',
  templateUrl: './deal-other-history.component.html',
  styleUrls: ['./deal-other-history.component.scss']
})
export class DealOtherHistoryComponent extends BaseComponent implements OnInit {
  @Input('vehicleId') vehicleId;
  @Input('contractId') contractId;
  active = true;
  arrStation = [];

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
      stageId: ['', Validators.required],
      startDate: [''],
      endDate: [''],
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
  searchForm(page) {
    let searchObj = { ... this.formSearch.value };
    if (!page) {
      this.searchModel.startrecord = 0;
      this.searchModel.pagesize = 10;
    }
    searchObj.startrecord = this.searchModel.startrecord;
    searchObj.pagesize = this.searchModel.pagesize;
    this.searchInformationCustomerService.searchHistotyTransactionOther(this.contractId, searchObj).subscribe(res => {
      if (res.mess.code === 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }
  exportExcel() {
    this.searchInformationCustomerService.exportExcelHistotyTransactionOther(this.contractId, this.formSearch.value).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
  getData() {
    this.searchForm(true);
  }
  getStage() {
    this.dmdcService.getStages().subscribe(res => {
      if (res.mess.code === 1) {
        this.arrStation = res.data.listData;
      }
    });
  }
}

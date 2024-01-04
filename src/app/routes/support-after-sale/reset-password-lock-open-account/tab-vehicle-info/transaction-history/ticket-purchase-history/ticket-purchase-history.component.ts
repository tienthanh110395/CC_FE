import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ticket-purchase-history',
  templateUrl: './ticket-purchase-history.component.html',
  styleUrls: ['./ticket-purchase-history.component.scss']
})
export class TicketPurchaseHistoryComponent extends BaseComponent implements OnInit {
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
    this.formSearch = this.fb.group({
      startDate: [''],
      endDate: [''],
      efficiencyId: ['']
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'customer-care.search-information-customer.code_process', field: 'saleTransCode' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'customer-care.search-information-customer.stage_station', field: 'station' },
      { i18n: 'Loại vé', field: 'servicePlanTypeName' },
      { i18n: 'Số tiền', field: 'price' },
      { i18n: 'Ngày mua', field: 'saleTransDate' },
      { i18n: 'Người mua', field: 'accountOwner' },
      { i18n: 'Từ ngày', field: 'effDate' },
      { i18n: 'Đến ngày', field: 'expDate' },
      { i18n: 'GHTD', field: 'efficiency' },
      { i18n: 'Hiệu lực', field: 'status' },
    ]
  }
  searchHistoryTicket(page) {
    let searchObj = { ... this.formSearch.value };
    if (!page) {
      this.searchModel.startrecord = 0;
      this.searchModel.pagesize = 10;
    }
    searchObj.startrecord = this.searchModel.startrecord;
    searchObj.pagesize = this.searchModel.pagesize;
    this.searchInformationCustomerService.searchTicketPurchaseHistoris(this.vehicleId, searchObj).subscribe(res => {
      if (res.mess.code === 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }
  getData() {
    this.searchHistoryTicket(true);
  }
  exportExcel() {
    let searchObj = { ... this.formSearch.value };
    this.searchInformationCustomerService.exportExcelTicketPurchaseHistoris(this.vehicleId, searchObj).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
}

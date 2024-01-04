import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MtxDialog, MtxGridRowSelectionFormatter } from '@ng-matero/extensions';
import { FormBuilder } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BillingService } from '@app/core/services/billing/billing.service';
import FileSaver from 'file-saver';
import { COMMOM_CONFIG } from '@env/environment';
import { format } from 'date-fns';

@Component({
  selector: 'app-tab-history-invoice',
  templateUrl: './tab-history-invoice.component.html',
  styleUrls: ['./tab-history-invoice.component.scss']
})
export class TabHistoryInvoiceComponent extends BaseComponent implements OnInit {
  @Input('data') data;
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private billingService: BillingService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr)
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'customer-care.search-information-customer.Symbol_hd', field: 'invoiceSeries' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'customer-care.search-information-customer.code_invoce', field: 'contractNo' },
      { i18n: 'customer-care.search-information-customer.type_invoice', field: 'transTypeName' },
      { i18n: 'customer-care.search-information-customer.price_invoice', field: 'totAmount' },
      { i18n: 'customer-care.search-information-customer.stage_station', field: 'station' },
      { i18n: 'common.status', field: 'invoiceStatus' },
      { i18n: 'customer-care.search-information-customer.action', field: 'actionFileAttach', type: 'actionFileAttach' },

    ]
    this.formSearch = this.fb.group({
      invoiceNo: [''],
      from: [''],
      to: [''],
      contractId: [''],
      custId: ['']
    });
    this.searchInvoice();
    console.log(this.data)
  }
  searchInvoice() {
    let from = null;
    if (this.formSearch.value.from) {
      from = format(this.formSearch.value.from, COMMOM_CONFIG.DATE_FORMAT_1);
    }
    let to = null;
    if (this.formSearch.value.to) {
      to = format(this.formSearch.value.to, COMMOM_CONFIG.DATE_FORMAT_1);
    }
    const body = {
      contractId: this.data.listContract[0].contractId,
      custId: this.data.listContract[0].custId,
      invoiceNo: this.formSearch.value.invoiceNo,
      from,
      to,
    }
    this.billingService.getInvoice(body).subscribe(res => {
      if (res.mess.code === 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }
  ExportExcelInvoice() {
    let from = null;
    if (this.formSearch.value.from) {
      from = format(this.formSearch.value.from, COMMOM_CONFIG.DATE_FORMAT_1);
    }
    let to = null;
    if (this.formSearch.value.to) {
      to = format(this.formSearch.value.to, COMMOM_CONFIG.DATE_FORMAT_1);
    }
    const body = {
      contractId: this.data.listContract[0].contractId,
      custId: this.data.listContract[0].custId,
      invoiceNo: this.formSearch.value.invoiceNo,
      from,
      to,
    }
    this.billingService.exportExcelInvoice(body).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
  viewFile(id) {
    this.billingService.viewFileInvoice(id).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
    // this.searchInformationCustomerService.viewFileInvoice(id).subscribe(res => {
    //   this.processViewFile(res);
    // })
  }
  processViewFile(res) {

    const img = 'data:image;base64, ' + res.data;
    const items = [
      {
        src: img,
        title: 'view'
      },
    ];
    var options = {
      index: 0
    };
    const viewer = new PhotoViewer(items, options);

  }
}

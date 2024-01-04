import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import FileSaver from 'file-saver';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
class SearchModel {
  efficiencyId?: number;
  saleTransDateFrom?: string;
  saleTransDateTo?: string;
  pagesize?: any;
  startrecord?: any;
}
@Component({
  selector: 'app-tab-ticket-purchase-history',
  templateUrl: './tab-ticket-purchase-history.component.html',
  styleUrls: ['./tab-ticket-purchase-history.component.scss']
})
export class TabTicketPurchaseHistoryComponent extends BaseComponent implements OnInit {
  @Input() vehicleId;
  checkBoxValidity: boolean;
  checkBoxEndValidity: boolean;
  vehiclesTransaction = [];
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private _vehicleService: VehicleService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }

  ngOnInit() {
    this.formSearch = this.fb.group({
      saleTransDateFrom: [''],
      saleTransDateTo: [''],
      pagesize: [this.pageSizeList[0]],
      startrecord: [0],
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'exchangeHistory.mgd', field: 'saleTransCode' },
      { i18n: 'exchangeHistory.tram_doan', field: 'stage', },
      { i18n: 'exchangeHistory.type_ticket', field: 'servicePlanTypeName', },
      { i18n: 'exchangeHistory.money', field: 'price', },
      { i18n: 'exchangeHistory.startBuy', field: 'saleTransDate', },
      { i18n: 'exchangeHistory.personBuy', field: 'accountOwner', },
      { i18n: 'exchangeHistory.ticket-purchase-start', field: 'effDate', },
      { i18n: 'exchangeHistory.endTime', field: 'expDate', },
      { i18n: 'Ngày BĐ được sử dụng', field: 'dateOfUse', },
      { i18n: 'customer-management.changeLockModalForm.reasonChange', field: 'changeReason', },
      { i18n: 'exchangeHistory.hieuluc', field: 'status', },
    ];
    super.mapColumn();
  }

  checkCheckBoxValidity(event) {
    this.checkBoxValidity = event.checked;
  }

  checkCheckBoxEndValidity(event) {
    this.checkBoxEndValidity = event.checked;
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.formSearch.controls.pagesize.setValue(this.pageSizeList[0]);
    this.getData();
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex == 0 ? event.pageIndex : event.pageIndex * event.pageSize,
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }

  getData() {
    const param: SearchModel = {};
    if (this.checkBoxValidity && !this.checkBoxEndValidity) {
      param.efficiencyId = 1;
    } else if (!this.checkBoxValidity && this.checkBoxEndValidity) {
      param.efficiencyId = 2;
    } else {
      param.efficiencyId = 0;
    }
    if (this.formSearch.value.saleTransDateFrom) {
      param.saleTransDateFrom = moment(this.formSearch.value.saleTransDateFrom).format(COMMOM_CONFIG.DATE_FORMAT_1);
    }
    if (this.formSearch.value.saleTransDateTo) {
      param.saleTransDateTo = moment(this.formSearch.value.saleTransDateTo).format(COMMOM_CONFIG.DATE_FORMAT_1,);
    }
    param.pagesize = this.formSearch.controls.pagesize.value;
    param.startrecord = this.formSearch.controls.startrecord.value;
    this._vehicleService.searchHistoryTransactionVehicle(param, this.vehicleId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.vehiclesTransaction = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }

  exportExcel() {
    let searchObj = { ... this.formSearch.value };
    this.searchInformationCustomerService.exportExcelTicketPurchaseHistoris(this.vehicleId, searchObj).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
}

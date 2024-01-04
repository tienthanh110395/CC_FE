import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tab-history-impact-vehicle',
  templateUrl: './tab-history-impact-vehicle.component.html',
  styleUrls: ['./tab-history-impact-vehicle.component.scss']
})
export class TabHistoryImpactVehicleComponent extends BaseComponent implements OnInit {
  listImpactHistory = []
  @Input() vehicleId;
  @Input() data = [];
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
      startrecord: [0],
      pagesize: [this.pageSizeList[0]],
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'info.actionType', field: 'actionType' },
      { i18n: 'customer-care.search-information-customer.impact_person', field: 'actionUserName' },
      { i18n: 'customer-care.search-information-customer.petitioner', field: 'userName' },
      { i18n: 'customer-care.search-information-customer.reason', field: 'reason' },
    ]
  }

  getData() {
    this.searchModel.startDate = this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      this.searchModel.endDate = this.formSearch.value.endDate ? format(this.formSearch.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      this.searchInformationCustomerService.searchImpactHistoryVehicle(this.data[0]?.custId, this.data[0]?.listContract[0].contractId, this.vehicleId, this.searchModel).subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = res.data.listData;
          this.totalRecord = res.data.count;
        }
      })
  }

  exportExcel() {
    const body = {
      startDate: this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      endDate: this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      custId: this.data[0].custId,
      contractId: this.data[0].listContract[0].contractId,
      vehicleId: this.vehicleId
    }
    this.searchInformationCustomerService.exportExcelImpactHistoryVehicle(body).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import format from 'date-fns/format';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-action-audit-tab',
  templateUrl: './action-audit.component.html',
  styleUrls: ['./action-audit.component.scss']
})
export class ActionAuditTabComponent extends BaseComponent implements OnInit {
  formSearchPT: FormGroup;
  @Input() data;
  constructor(
    private fb: FormBuilder,
    private searchInformationCustomerService: SearchInformationCustomerService,
  ) {
    super();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'info.actionType', field: 'actionType' },
      { i18n: 'customer-care.search-information-customer.impact_person', field: 'actionUserName' },
      { i18n: 'customer-care.search-information-customer.petitioner', field: 'userName' },
      { i18n: 'customer-care.search-information-customer.reason', field: 'reason' },
    ]
    this.formSearchPT = this.fb.group({
      startDate: [''],
      endDate: [''],
    })
  }
  searchForm(page) {
    if (!page) {
      this.searchModel.startrecord = 0;
      this.searchModel.pagesize = 10;
    }
    let body = {};
    body['startDate'] = this.formSearchPT.value.startDate ? format(this.formSearchPT.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      body['endDate'] = this.formSearchPT.value.endDate ? format(this.formSearchPT.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      body['startrecord'] = this.searchModel.startrecord;
    body['pagesize'] = this.searchModel.pagesize;
    this.searchInformationCustomerService.searchImpactHistoryAndReflection(this.data[0].custId, this.data[0].listContract[0].contractId, body).subscribe(res => {
      if (res.mess.code === 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }

    })
  }
  exportExcel() {
    let body = {};
    body['startDate'] = this.formSearchPT.value.startDate ? format(this.formSearchPT.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      body['endDate'] = this.formSearchPT.value.endDate ? format(this.formSearchPT.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : '',
      body['custId'] = this.data[0].custId;
    body['contractId'] = this.data[0].listContract[0].contractId
    this.searchInformationCustomerService.exportExcelImpactHistoryAndReflection(body).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      saveAs(new Blob([res.body]), fileName);
    })
  }
}

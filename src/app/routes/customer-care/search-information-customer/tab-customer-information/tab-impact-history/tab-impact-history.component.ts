import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MtxDialog, MtxGridRowSelectionFormatter } from '@ng-matero/extensions';
import { FormBuilder } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import format from 'date-fns/format';
import FileSaver from 'file-saver';
import { COMMOM_CONFIG } from '@env/environment';
import { ContractService } from '@app/core/services/contract/contract.service';

@Component({
  selector: 'app-tab-impact-history',
  templateUrl: './tab-impact-history.component.html',
  styleUrls: ['./tab-impact-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabImpactHistoryComponent extends BaseComponent implements OnInit {
  formSearchImpactHistory
  listImpactHistory = []
  @Input() data: any;
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private _contractService: ContractService,
    protected toastr: ToastrService,
    protected _changeDetectorRef: ChangeDetectorRef,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr)
  }

  ngOnInit(): void {
    this.formSearchImpactHistory = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'info.actionType', field: 'actionType' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'customer-care.search-information-customer.impact_person', field: 'actionUserName' },
      { i18n: 'customer-care.search-information-customer.petitioner', field: 'userName' },
      { i18n: 'customer-care.search-information-customer.reason', field: 'reason' },
    ];
    this.getData();
  }
  getData() {
    if (this.formSearchImpactHistory.valid) {
      this.isLoading = true;
      this.searchModel.startDate = this.formSearchImpactHistory.value.startDate ? format(this.formSearchImpactHistory.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
        this.searchModel.endDate = this.formSearchImpactHistory.value.endDate ? format(this.formSearchImpactHistory.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : '',
        this.removeNull(this.searchModel);
      this._contractService.searchActionContractHistories(this.searchModel, this.data.custId, this.data.listContract[0].contractId).subscribe(res => {
        if (res.mess.code === 1) {
          this.listImpactHistory = res.data.listData;
          this.totalRecord = res.data.count;
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        }
      })
    }
  }
  downloadFile(id) {
    this.searchInformationCustomerService.downloadAttachedFile(id).subscribe(res => {
      const fileName = res.headers.get('Content-Disposition').split('=')[1];
      FileSaver.saveAs(new Blob([res.body]), fileName);
    })
  }
  exportExcelImpactHistory() {
    if (this.formSearchImpactHistory.valid) {
      this.searchModel.startDate = this.formSearchImpactHistory.value.startDate ? format(this.formSearchImpactHistory.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : '',
        this.searchModel.endDate = this.formSearchImpactHistory.value.endDate ? format(this.formSearchImpactHistory.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : '',
        this.searchModel.contractId = this.data.listContract[0].contractId;
        this.searchModel.custId = this.data.custId;
        this.removeNull(this.searchModel);

      this.searchInformationCustomerService.exportExcelImpactHistory(this.searchModel).subscribe(res => {
        const fileName = res.headers.get('Content-Disposition').split('=')[1];
        FileSaver.saveAs(new Blob([res.body]), fileName);
      })
    }
  }
}

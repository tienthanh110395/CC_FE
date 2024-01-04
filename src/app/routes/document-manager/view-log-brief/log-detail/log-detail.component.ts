import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BriefCaseService } from '@app/core/services/briefcase/brief-case.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';

@Component({
  selector: 'app-log-detail',
  templateUrl: './log-detail.component.html',
  styleUrls: ['./log-detail.component.scss']
})
export class LogDetailComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() profileActionAuditId: number;
  constructor(

    public _briefCaseService: BriefCaseService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.profileActionAuditId?.currentValue != changes?.profileActionAuditId?.previousValue && changes?.profileActionAuditId?.previousValue && changes?.profileActionAuditId?.currentValue) {
      this.onSearch();
    }
    if (changes?.profileActionAuditId?.firstChange) {
      this.onSearch();
    }
  }

  ngOnInit() {
    this.buildColumnActionAuditDetail();
    this.getDataProfileActionAuditDetail();
  }

  buildColumnActionAuditDetail() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'info.actionType', field: 'actionName' },
      { i18n: 'ticket-statistic.object', field: 'tableName' },
      { i18n: 'ticket-statistic.infoColumn', field: 'columnName' },
      { i18n: 'ticket-statistic.oldValue', field: 'oldValue' },
      { i18n: 'ticket-statistic.newValue', field: 'newValue' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.getDataProfileActionAuditDetail();
  }

  onSearch() {
    this.pageIndex = 0;
    this.searchModel.startrecord = 0;
    this.getDataProfileActionAuditDetail();
  }

  getDataProfileActionAuditDetail() {
    this._briefCaseService.searchProfileActionAuditDetail(this.profileActionAuditId, this.searchModel.startrecord, this.searchModel.pagesize).subscribe(res => {
      this.dataModel.dataSource = res.data.listData;
      this.totalRecord = res.data.count;
    })
  }
}

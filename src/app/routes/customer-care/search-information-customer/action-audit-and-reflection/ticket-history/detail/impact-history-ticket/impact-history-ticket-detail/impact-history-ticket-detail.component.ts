import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';

@Component({
  selector: 'app-impact-history-ticket-detail',
  templateUrl: './impact-history-ticket-detail.component.html',
  styleUrls: ['./impact-history-ticket-detail.component.scss']
})
export class ImpactHistoryTicketDetailComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() actionAuditId: number;
  constructor(
    private _ticketService: TicketService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.actionAuditId?.currentValue != changes?.actionAuditId?.previousValue && changes?.actionAuditId?.previousValue && changes?.actionAuditId?.currentValue) {
      this.onSearch();
    }
    if (changes?.actionAuditId?.firstChange) {
      this.onSearch();
    }
  }

  ngOnInit() {
    this.onSearch();
    // this.getDataActionAuditDetail();
    this.buildColumnActionAuditDetail();
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
    this.getDataActionAuditDetail();
  }

  onSearch() {
    this.pageIndex = 0;
    this.searchModel.startrecord = 0;
    this.getDataActionAuditDetail();
  }

  getDataActionAuditDetail() {
    this._ticketService.searchActionAuditDetail(this.actionAuditId, this.searchModel.startrecord, this.searchModel.pagesize).subscribe(res => {
      if(res.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }
}

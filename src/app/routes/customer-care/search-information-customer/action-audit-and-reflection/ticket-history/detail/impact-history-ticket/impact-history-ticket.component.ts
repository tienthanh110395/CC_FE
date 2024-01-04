import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CC_TICKET_STATUS, HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-impact-history-ticket',
  templateUrl: './impact-history-ticket.component.html',
  styleUrls: ['./impact-history-ticket.component.scss']
})
export class ImpactHistoryTicketComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  selectedRow: any = {};
  formActionAuditDetail: FormGroup;
  activeFormDetail = false;
  statusTicketAction = CC_TICKET_STATUS;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  constructor(
    private fb: FormBuilder,
    private _ticketService: TicketService,
    private ngZone: NgZone,
  ) {
    super();
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {
    this.getDataActionAudit();
    this.buildColumnsActionAudit();
    this.buildFormActionAuditDetail()
  }

  buildColumnsActionAudit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.ticket-history.processTime', field: 'createDate' },
      { i18n: 'customer-care.search-cc.processUnit', field: 'siteName' },
      { i18n: 'customer-care.search-cc.processUser', field: 'staffName' },
      { i18n: 'info.actionType', field: 'actTypeName' },
      { i18n: 'customer-care.search-cc.processContent', field: 'description' },
      { i18n: 'customer-care.search-cc.ticketStatus', field: 'ticketStatus' },
      { i18n: 'common.detail', field: 'detail' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.getDataActionAudit();
  }

  getDataActionAudit() {
    this._ticketService.searchActionAudit(this.data.ticketId, this.searchModel.startrecord, this.searchModel.pagesize).subscribe(res => {
      if(res.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }

  buildFormActionAuditDetail() {
    this.formActionAuditDetail = this.fb.group({
      dateTime: [],
      processUser: [],
      processUnit: [],
      actionType: [],
      processContent: [],
    });
  }

  viewActionAudit(row) {
    this.activeFormDetail = true;
    this.selectedRow = row;
    this.formActionAuditDetail.get('dateTime').setValue(row.createDate);
    this.formActionAuditDetail.get('processUser').setValue(row.staffName);
    this.formActionAuditDetail.get('processUnit').setValue(row.siteName);
    this.formActionAuditDetail.get('actionType').setValue(row.actTypeName);
    this.formActionAuditDetail.get('processContent').setValue(row.processContent);
  }
}

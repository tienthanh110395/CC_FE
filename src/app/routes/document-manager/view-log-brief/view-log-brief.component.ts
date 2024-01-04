import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Inject, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BriefCaseService } from '@app/core/services/briefcase/brief-case.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-view-log-brief',
  templateUrl: './view-log-brief.component.html',
  styleUrls: ['./view-log-brief.component.scss']
})
export class ViewLogBriefComponent extends BaseComponent implements OnInit {
  selectedRow: any = {};
  activeFormDetail = false;
  formActionAuditDetail: FormGroup;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    protected _translateService: TranslateService,
    public _briefCaseService: BriefCaseService,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
    public dialogRef: MatDialogRef<TemplateRef<ViewLogBriefComponent>>,
  ) {
    super();
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {
    this.dataModel.titlePopup = this._translateService.instant('customer-care.search-information-customer.impact_history');
    this.buildColumnsActionAudit();
    this.getDataProfileActionAudit();
    this.buildFormActionAuditDetail()
  }

  buildFormActionAuditDetail() {
    this.formActionAuditDetail = this.fb.group({
      dateTime: [],
      processUser: [],
      actionType: [],
      processContent: [],
    });
  }

  buildColumnsActionAudit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.ticket-history.processTime', field: 'createDate' },
      { i18n: 'customer-care.search-cc.processUser', field: 'actionUserName' },
      { i18n: 'info.actionType', field: 'actTypeName' },
      { i18n: 'document.processContent', field: 'descriptionContent' },
      { i18n: 'common.detail', field: 'detail' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  getDataProfileActionAudit() {
    const body = {
      contractId: this.dataDialog.contractId,
      startrecord: this.searchModel.startrecord,
      pagesize: this.searchModel.pagesize,
    }
    this._briefCaseService.searchProfileActionAudit(body).subscribe(res => {
      if (res.mess.code == 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.getDataProfileActionAudit();
  }

  viewActionAudit(row) {
    this.activeFormDetail = true;
    this.selectedRow = row;
    this.formActionAuditDetail.get('dateTime').setValue(row.createDate ? row.createDate : null);
    this.formActionAuditDetail.get('processUser').setValue(row.actionUserFullName ? row.actionUserFullName : null);
    this.formActionAuditDetail.get('actionType').setValue(row.actTypeName ? row.actTypeName : null);
    this.formActionAuditDetail.get('processContent').setValue(row.descriptionContent ? row.descriptionContent : null);
  }
}

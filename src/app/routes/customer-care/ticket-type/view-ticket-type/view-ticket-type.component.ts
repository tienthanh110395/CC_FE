import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Inject, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-view-ticket-type',
  templateUrl: './view-ticket-type.component.html',
  styleUrls: ['./view-ticket-type.component.scss']
})
export class ViewTicketTypeComponent extends BaseComponent implements OnInit {
  header;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    private _translateService: TranslateService,
    private _ticketService: TicketService,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
    public dialogRef: MatDialogRef<TemplateRef<ViewTicketTypeComponent>>,
    public dialog: MtxDialog,
  ) {
    super();
    this.formSearch = this.fb.group({
      name: [],
      ticketTypeId: [],
      l1TicketTypeId: [],
      l2TicketTypeId: [],
      isCpt: [],
      description: [],
      status: [],
      ticketTemplate: [],
    });
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {
    this.header = this._translateService.instant('customer-care.search-process.ticketInfo');
    this.setValueForm();
  }

  setValueForm() {
    this._ticketService.getDetailTicketType(this.dataDialog.ticketTypeId).subscribe(res => {
      if (res.mess.code == 1) {
        this.formSearch.controls.name.setValue(res.data.name || '');
        this.formSearch.controls.ticketTypeId.setValue(res.data.ticketTypeId || '');
        this.formSearch.controls.l1TicketTypeId.setValue(this.dataDialog.groupPA || '');
        this.formSearch.controls.l2TicketTypeId.setValue(this.dataDialog.subgroupPA || '');
        this.formSearch.controls.isCpt.setValue(String(res.data.isCpt) || '');
        this.formSearch.controls.description.setValue(res.data.description || '');
        this.formSearch.controls.status.setValue(String(res.data.status) || '');
        this.formSearch.controls.ticketTemplate.setValue(res.data.ticketTemplate || '');
      }
    })
  }
}

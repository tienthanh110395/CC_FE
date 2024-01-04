import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Inject, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-view-ticket-expire-cause',
  templateUrl: './view-ticket-expire-cause.component.html',
  styleUrls: ['./view-ticket-expire-cause.component.scss']
})
export class ViewTicketExpireCauseComponent extends BaseComponent implements OnInit {
  header;
  formView: FormGroup;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  constructor(
    private fb: FormBuilder,
    protected _translateService: TranslateService,
    protected toastr: ToastrService,
    private _ticketService: TicketService,
    private ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<ViewTicketExpireCauseComponent>>,
  ) {
    super();
  }

  ngOnInit() {
    this.header = this._translateService.instant('ticket-expire-cause.viewTicketExpireCause');
    this.buildForm();
    this.pathValueForm();
  }

  riggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  buildForm() {
    this.formView = this.fb.group({
      name: [],
      code: [],
      rootCause: [],
      status: [],
      description: [],
    });
  }

  pathValueForm() {
    this.formView.controls.name.setValue(this.dataDialog.name2 ? this.dataDialog.name2 : '');
    this.formView.controls.code.setValue(this.dataDialog.code2 ? this.dataDialog.code2 : '');
    this.formView.controls.rootCause.setValue(this.dataDialog.name ? this.dataDialog.name : '');
    this.formView.controls.status.setValue(String(this.dataDialog.status) ? String(this.dataDialog.status) : '');
    this.formView.controls.description.setValue(this.dataDialog.description ? this.dataDialog.description : '');
  }
}

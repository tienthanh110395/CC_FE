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
  selector: 'app-add-edit-ticket-expire-cause',
  templateUrl: './add-edit-ticket-expire-cause.component.html',
  styleUrls: ['./add-edit-ticket-expire-cause.component.scss']
})
export class AddEditTicketExpireCauseComponent extends BaseComponent implements OnInit {
  header;
  formAddEdit: FormGroup;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  dataTicketErrorCause: any;
  public AllowParentSelection = true;
  public RestructureWhenChildSameName = false;
  constructor(
    private fb: FormBuilder,
    protected _translateService: TranslateService,
    protected toastr: ToastrService,
    private _ticketService: TicketService,
    private ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
    public dialogRef: MatDialogRef<TemplateRef<AddEditTicketExpireCauseComponent>>,
  ) {
    super();

    this.formAddEdit = this.fb.group({
      name: [],
      code: [],
      status: [],
      description: [],
    })
  }

  ngOnInit() {
    if (this.dataDialog) {
      this.header = this._translateService.instant('ticket-expire-cause.editTicketExpireCause');
      this.pathValueForm();
    } else {
      this.header = this._translateService.instant('ticket-expire-cause.addTicketExpireCause');
    }
    this.getDataTicketErrorCause();
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  pathValueForm() {
    this.formAddEdit.controls.name.setValue(this.dataDialog.name2);
    this.formAddEdit.controls.code.setValue(this.dataDialog.code2);
    // this.formAddEdit.controls.rootCause.setValue(this.dataDialog.name);
    this.formAddEdit.controls.status.setValue(String(this.dataDialog.status));
    this.formAddEdit.controls.description.setValue(this.dataDialog.description);
  }

  getDataTicketErrorCause() {
    this._ticketService.getTreeTicketExpireCause().subscribe(res => {
      if (res.mess.code == 1) {
        this.dataTicketErrorCause = res.data.listData ?? [];
      }
    })
  }

  onSelected(event) {
    this.dataModel.selectNode = event;
  }

  onSave() {
    if (this.dataDialog?.ticketExpireCauseId) {
      const bodyUpdate = Object.assign({}, this.formAddEdit.value);
      if (this.dataDialog?.parentId == null && this.dataModel.selectNode == null) {
        bodyUpdate.parentId = null;
      } else {
        bodyUpdate.parentId = this.dataModel.selectNode?.ticketExpireCauseId;
      }
      this._ticketService.editTicketExpireCause(this.dataDialog?.ticketExpireCauseId, bodyUpdate).subscribe(res => {
        if (res.mess.code == 1) {
          this.dialogRef.close(true);
          this.toastr.success(this._translateService.instant('common.notify.edit.success'))
        } else {
          this.toastr.error(res.mess.description);
        }
      })
    } else {
      const bodyInsert = Object.assign({}, this.formAddEdit.value);
      if (this.dataDialog?.parentId == null && this.dataModel.selectNode == null) {
        bodyInsert.parentId = null;
      } else {
        bodyInsert.parentId = this.dataModel.selectNode?.ticketExpireCauseId;
      }
      this._ticketService.insertTicketExpireCause(bodyInsert).subscribe(res => {
        if (res.mess.code == 1) {
          this.dialogRef.close(true);
          this.toastr.success(this._translateService.instant('common.notify.add.success'))
        } else {
          this.toastr.error(res.mess.description);
        }
      })
    }
  }
}

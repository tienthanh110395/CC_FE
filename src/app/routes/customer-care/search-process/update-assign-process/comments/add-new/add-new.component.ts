import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { HTTP_CODE } from '@app/shared';
import { ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-comment',
  templateUrl: './add-new.component.html',
  styleUrls: ['./add-new.component.scss']
})
export class AddNewCommentComponent implements OnInit {

  formGroup: FormGroup;
  commentTypeList = [
    { value: 1, label: 'Nhận xét' },
    { value: 2, label: 'Khác' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ConfirmDialogBoldFormComponent>,
    protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      ticketAssignId: this.data.ticketAssignId,
      ticketId: this.data.ticketId,
      siteId: AppStorage.getAccessToken().partner_code || 1,
      logType: [this.data.logType || null, Validators.required],
      logContent: [this.data.logContent || '', Validators.required]
    });
  }

  onConfirm(): void {
    const data = Object.assign({}, this.formGroup.value);
    this._ticketService.addTicketAssignLog(data).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('common.notify.add.success'));
        this.dialogRef.close(true);
      } else {
        this._toastrService.error(res.mess.description);
      }
    }, err => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}

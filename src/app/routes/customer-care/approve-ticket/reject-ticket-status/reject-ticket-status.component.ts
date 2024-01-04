import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ACTION_TYPE } from '@app/shared/constant/common.constant';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reject-ticket-status',
  templateUrl: './reject-ticket-status.component.html',
  styleUrls: ['./reject-ticket-status.component.scss']
})
export class RejectTicketStatusComponent extends BaseComponent implements OnInit {
  formGroupPopup: FormGroup;
  constructor(
    private fb: FormBuilder,
    private _ticketService: TicketService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<RejectTicketStatusComponent>>,
  ) {
    super();
  }

  ngOnInit() {
    this.formGroupPopup = this.fb.group({
      approveReason: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  send() {
    const body = {
      approveReason: this.formGroupPopup.controls.approveReason.value ? this.formGroupPopup.controls.approveReason.value.trim() : '',
      actTypeId: ACTION_TYPE.TICKET_REJECT_EXTENT_REQUEST,
      ticketId: this.dataDialog.ticketId,
    }
    this._ticketService.rejectTicketStatus(this.dataDialog?.ticketId, body).subscribe(res => {
      if (res.mess.code == 1) {
        this._toastrService.success(this._translateService.instant('ticket-extend.refuse-ticket-success'));
        this.dialogRef.close(true);
      } else {
        this._toastrService.error(res.mess.description);
      }
    })
  }
}

import { NgxMatDateAdapter, NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { ACTION_TYPE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { CustomDateAdapter } from './custom-date';

const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'l, LTS',
  },
  display: {
    dateInput: 'l, LTS',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-ticket-extent',
  templateUrl: './ticket-extent.component.html',
  styleUrls: ['./ticket-extent.component.scss'],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter },
  ],
})
export class TicketExtentComponent extends BaseComponent implements OnInit {
  header;
  ticketId: number;
  currentDate = new Date();
  viewMode = false;
  formExtendProcess: FormGroup;
  extentReasonIdList = [];
  managerUserNameList = [];

  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<TicketExtentComponent>>,
  ) {
    super();
  }

  ngOnInit() {
    this.ticketId = this.dataDialog.ticketId;
    this.header = this._translateService.instant('ticket-statistic.extend-process');
    this.buildForm();
    this.getDataTicketExtentReason();
    this.getDataTicketSiteUser();
    this.setValueFormExtent();
  }

  buildForm() {
    this.formExtendProcess = this.fb.group({
      extentReasonId: ['', Validators.required],
      requestExtentDate: ['', Validators.required],
      managerUserName: ['', Validators.required],
      managerPhone: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
    });
  }

  getDataTicketExtentReason() {
    this._ticketService.getTicketExtentReason().subscribe(res => {
      this.extentReasonIdList = res.data.listData.map(val => ({ value: val.ticketExtentReasonId, label: val.name }))
    })
  }

  getDataTicketSiteUser() {
    this._ticketService.getTicketSiteUser().subscribe(res => {
      this.managerUserNameList = res.data.listData.map(val => ({ label: val.staffName, value: val.userName }))
    })
  }

  setValueFormExtent() {
    this._ticketService.getDetailTicketExtent(Number(this.dataDialog.ticketId)).subscribe(res => {
      this.formExtendProcess.controls.extentReasonId.setValue(res.data.extentReasonId);
      this.formExtendProcess.controls.requestExtentDate.setValue(moment(res.data.requestExtentDate, COMMOM_CONFIG.DATE_TIME_FORMAT_3).toDate());
      this.formExtendProcess.controls.managerUserName.setValue(res.data.managerUserName);
      this.formExtendProcess.controls.managerPhone.setValue(res.data.managerPhone);
    })
  }

  onSave() {
    const bodyAdd = Object.assign({}, this.formExtendProcess.value);
    bodyAdd.requestExtentDate = moment(bodyAdd.requestExtentDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT_3);
    bodyAdd.actTypeId = ACTION_TYPE.TICKET_EXTENT_REQUEST;
    bodyAdd.managerPhone = bodyAdd.managerPhone ? bodyAdd.managerPhone.trim() : '';
    bodyAdd.ticketId = this.dataDialog?.ticketId;
    bodyAdd.isSms = true;
    this._ticketService.addTicketExtent(bodyAdd).subscribe(res => {
      if (res.mess.code == 1) {
        this._toastrService.success(this._translateService.instant('ticket-extend.success-extent-add'));
        this.dialogRef.close(true);
      } else {
        this._toastrService.warning(res.mess.description);
      }
    })
  }
}

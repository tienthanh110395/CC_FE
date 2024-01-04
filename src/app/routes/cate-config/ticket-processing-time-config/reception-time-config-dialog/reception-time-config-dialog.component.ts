import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketExpireCauseService } from '@app/core/services/expire-cause/ticket-expire-cause.service';
import { TicketSlaService } from '@app/core/services/ticket-sla/ticket-sla.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ComponentType, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reception-time-config-dialog',
  templateUrl: './reception-time-config-dialog.component.html',
  styleUrls: ['./reception-time-config-dialog.component.scss']
})
export class ReceptionTimeConfigDialogComponent extends BaseComponent implements OnInit {

  form!: FormGroup;
  disabled = false;
  data!: string;
  title!: string;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<ReceptionTimeConfigDialogComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketExpireCauseService: TicketExpireCauseService,
    private ticketSlaService: TicketSlaService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
  ) { super(null, null); }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      receptionTimeFrom: ['', [Validators.required]],
      receptionTimeTo: ['', [Validators.required]], //Nguyen nhan qua han cap 1
    });
  }

  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  doUpdateReception() {
    this.isLoading = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toars.warning(this.translateService.instant('cateConfig.ticketType.saveWarning'));
      return;
    }
    let params: object = this.form.value;
    this.ticketSlaService.updateReceptionTime(params).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
        this.toars.success(this.translateService.instant('ticketProcessConfig.updateReceptionSuccess'));
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        this.doClose();
      } else {
        this.toars.warning(this.translateService.instant('ticketProcessConfig.updateReceptionError'));
      }
    }, () => {
      this.isLoading = false;
      this.toars.error(this.translateService.instant('common.500Error'));
    },);
  }

  doClose() {
    this.dialogRef.close();
  }

}

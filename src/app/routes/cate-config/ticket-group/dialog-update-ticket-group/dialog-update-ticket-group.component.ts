import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketGroupService } from '@app/core/services/cate-config/ticket-group.service';
import { TranslateService } from '@ngx-translate/core';
import { HTTP_CODE } from '@shared';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-update-ticket-group',
  templateUrl: './dialog-update-ticket-group.component.html',
  styleUrls: ['./dialog-update-ticket-group.component.scss']
})
export class DialogUpdateTicketGroupComponent implements OnInit {

  form!: FormGroup;
  title!: string;
  data!: string;
  isLoading: boolean = false;
  status: any = 1;
  levelTt: any = 1;
  saveTimeout: any;

  constructor(
    private dialogRef: MatDialogRef<DialogUpdateTicketGroupComponent>,
    private fb: FormBuilder,
    private ticketGroupService: TicketGroupService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
    protected toars?: ToastrService,
    protected translateService?: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      ticketTypeId: [],
      ticketTypeName: ['', [Validators.required, Validators.maxLength(255)]], //Tên nhóm phản ánh
      description: ['', [Validators.maxLength(1024)]]//Mô tả
    });
  }
  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  doSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toars.warning(this.translateService.instant('cateConfig.ticketType.saveWarning'));
      return;
    }
    let params: object = {
      ticketTypeId: this.getValueOfField('ticketTypeId'),
      ticketTypeName: this.getValueOfField('ticketTypeName').trim(),
      description: this.getValueOfField('description'),
      status: this.status,
      levelTt: this.levelTt,
    };
    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.ticketGroupService.saveOrUpdate(params).subscribe(rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            this.toars.success(this.translateService.instant('cateConfig.ticketGroup.createSuccess'));
            this.isLoading = false;
            this.onClosePopup();
          } else if (rs.data === 1) {
            this.toars.warning(this.translateService.instant('Mã nhóm phản ánh đã tồn tại'));
          } else {
            this.toars.warning(this.translateService.instant('cateConfig.ticketGroup.createError'));
          }
        },
        (error) => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant('common.500Error'));
        },
      );
      this.saveTimeout = null;
    }, 1000); // Delay of 1000 milliseconds
  }

  onClosePopup(): any {
    this.dialogRef.close();
  }
}


import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HTTP_CODE, LEVEL_REASON_ERROR} from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { MatOption } from '@angular/material/core';
import {TickeErrorService} from "@core/services/cate-config/ticket-error.service";
import {MatDialog} from "@angular/material/dialog";



@Component({
  selector: 'app-dialog-edit-ticket-error-cause',
  templateUrl: './dialog-edit-ticket-error-cause.component.html',
  styleUrls: ['./dialog-edit-ticket-error-cause.component.scss']
})
export class DialogEditTicketErrorCauseComponent extends BaseComponent implements OnInit {

  @ViewChild('allLevelReasonError') private allLevelReasonError: MatOption;

  form!: FormGroup;
  lstTicketGenre: any = [];
  listOption: any = [];
  disabled = false;
  enable = true;

  selectedReasonErrorLv = null ;
  selectedLevel1: any;
  selectedLevel2: any;

  lstLevelReasonError: any = [
    {
      value: LEVEL_REASON_ERROR.LEVEL_1,
      label: this.translateService.instant('ticket-statistic.statistic-lv1'),
    },
    {
      value: LEVEL_REASON_ERROR.LEVEL_2,
      label: this.translateService.instant('ticket-statistic.statistic-lv2'),
    },
    {
      value: LEVEL_REASON_ERROR.LEVEL_3,
      label: this.translateService.instant('ticket-statistic.statistic-lv3'),
    },
  ];

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private tickeErrorService: TickeErrorService,
  ) {
    super(null, null);
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      levelReasonError: ['level1'],
      name:  ["", [Validators.required, Validators.maxLength(255)]],// tên nguyên nhân lỗi
      code: '', //mã nguyên nhân lỗi
      parentId: [null,],//Mã loại phản ánh
      status: [1,], //Trạng thái
      description: '',//Mô tả
    });
  }

  // Click chọn cấp nguyên nhân lỗi
  onChangeLevelReasonError(event) {
    this.selectedReasonErrorLv = event.value.value;
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  doSaveOrUpdate(){

    if(this.form.invalid){
      this.toastr.warning('Thông báo','Kiểm tra thông tin đầu vào')
    }else {
      let param=this.form.value;
      this.tickeErrorService.saveOrUpdate(param).subscribe(rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            this.toastr.success(this.translateService.instant("cateConfig.ticketGroup.createSuccess"));
            this.isLoading = false;
            this.dialog.closeAll();
          } else {
            this.toastr.error(this.translateService.instant("cateConfig.ticketGroup.createError"));
          }
        },
        (error) => {
          this.isLoading = false;

          if (error === "duplicate-ticket-group")
            this.toastr.warning(this.translateService.instant("common.notify.duplicate-ticket-group"));
          else
            this.toastr.error(this.translateService.instant("common.500Error"));
        }
      );

    }
  }

}

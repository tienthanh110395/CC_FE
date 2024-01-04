import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HTTP_CODE, LEVEL_REASON_ERROR } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TickeErrorService } from '@core/services/cate-config/ticket-error.service';
import { TranslateService } from '@ngx-translate/core';
import { ComponentType, ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-dialog-create-ticket-error-cause',
  templateUrl: './dialog-create-ticket-error-cause.component.html',
  styleUrls: ['./dialog-create-ticket-error-cause.component.scss'],
})
export class DialogCreateTicketErrorCauseComponent extends BaseComponent implements OnInit {
  form!: FormGroup;
  disabled = false;
  isClearLv1: boolean = false;
  isClearLv2: boolean = false;
  data!: string;
  title!: string;
  levelTt: number = 6;
  selectedLevel1: boolean = false;
  selectedLevel2: boolean = false;
  status: number = 1;
  searchModel1: any = {};
  searchModel2: any = {};
  saveTimeout: any;
  level: boolean = false;

  lstLevelError: any = [
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
  listOption: any = [];
  selectedErrorCauseLv = null;
  lstTicketErrorCauseNameLv1: any = [];
  lstTicketErrorCauseNameLv2: any = [];
  search: any = 1;

  constructor(
    public dialog: MatDialogRef<ComponentType<DialogCreateTicketErrorCauseComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private tickeErrorService: TickeErrorService,
    protected toars: ToastrService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
  ) {
    super(null, null);
  }

  ngOnInit(): void {
    this.buildForm();
    this.getLstErrorLvOne();
    this.title = this.dataInput.data['title'];

    if (this.dataInput.data.data) {
      this.search = 0;
      this.selectedErrorCauseLv = this.dataInput.data.data['levelError'];
      this.data = this.dataInput.data.data['ticketErrorCauseId'];
      this.getDataDetailTicketErrorCause(this.data);
    }
  }

  buildForm() {
    this.form = this.fb.group({
      ticketErrorCauseId: [''],
      levelError: ['', [Validators.required]],
      ticketErrorLevelOne: '', // nguyên nhân lỗi cấp 1
      ticketErrorLevelTwo: '', //nguyên nhân lỗi cấp 2
      ticketErrorCauseName: ['', [Validators.required, Validators.maxLength(255)]], // mã nguyên nhân lỗi
      description: ['', [Validators.maxLength(1024)]],//Mô tả
      levelTt: '',
    });
  }

  // Click chọn cấp nguyên nhân lỗi
  onChangeLevelReasonError(event) {
    this.selectedErrorCauseLv = event.value;
    if (this.selectedErrorCauseLv == 1) {
      this.form['controls']['ticketErrorLevelOne'].setValidators([]);
      this.form['controls']['ticketErrorLevelTwo'].setValidators([]);
    }
    if (this.selectedErrorCauseLv == 2) {
      this.form['controls']['ticketErrorLevelOne'].setValidators([Validators.required]);
      this.form['controls']['ticketErrorLevelTwo'].setValidators([]);
    }
    if (this.selectedErrorCauseLv == 3) {
      this.form['controls']['ticketErrorLevelOne'].setValidators([Validators.required]);
      this.form['controls']['ticketErrorLevelTwo'].setValidators([Validators.required]);
    }
    this.form['controls']['ticketErrorLevelOne'].updateValueAndValidity();
    this.form['controls']['ticketErrorLevelTwo'].updateValueAndValidity();
  }

  defaultDataDetail(ticketErrorCause: any) {
    this.form['controls']['levelError'].setValue(ticketErrorCause.levelError);
    if (ticketErrorCause.levelError == 3) {
      this.form['controls']['ticketErrorLevelOne'].setValue(ticketErrorCause.ticketErrorCauseId3);
    } else {
      this.form['controls']['ticketErrorLevelOne'].setValue(ticketErrorCause.parentId);
    }
    this.form['controls']['ticketErrorLevelTwo'].setValue(ticketErrorCause.parentId);
    this.form['controls']['ticketErrorCauseName'].setValue(ticketErrorCause.ticketErrorCauseName);
    this.form['controls']['description'].setValue(ticketErrorCause.description);
    this.status = ticketErrorCause.status;
    this.form['controls']['levelError'].disable();
    this.form['controls']['ticketErrorLevelOne'].disable();
    this.form['controls']['ticketErrorLevelTwo'].disable();

    this.status = ticketErrorCause.status;
  }

  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  getLstErrorLvOne() {
    this.isLoading = true;
    let params: object = {
      search: this.search,
    };
    this.tickeErrorService.getListTickecErrorCauseByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data.listData || [];
      this.lstTicketErrorCauseNameLv1 = data.map(val => ({ value: val.ticketErrorCauseId, label: val.name }));
    });
  }

  onChangLevelOne(option) {
    this.form.controls.ticketErrorLevelTwo.setValue(null);
    if (option?.value) {
      this.getListLevelErrorTwo(option.value);
      this.isClearLv1 = true;
    } else {
      this.isClearLv1 = false;
      this.isClearLv2 = false;
      this.form.controls.ticketErrorLevelTwo.setValue(null);
      this.lstTicketErrorCauseNameLv2 = [];
    }
  }

  onChangLevelTwo() {
    this.isClearLv2 = true;
  }

  getListLevelErrorTwo(lstParentId) {
    this.isLoading = true;
    let params: object = {
      lstParentId: [lstParentId],
      search: this.search,
    };
    this.tickeErrorService.getListTickecErrorCauseByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketErrorCauseNameLv2 = data.map(val => ({ value: val.ticketErrorCauseId, label: val.name }));
    });
  }


  getDataDetailTicketErrorCause(ticketErrorCauseId) {
    this.isLoading = true;
    this.tickeErrorService.getDataDetailTicketErrorCause(ticketErrorCauseId).subscribe(rs => {
      this.isLoading = false;
      this.defaultDataDetail(rs['data']);
      this.getLstErrorLvOne();
      if (this.selectedErrorCauseLv == 3) {
        this.getListLevelErrorTwo(rs['data']['ticketErrorCauseId3']);
      }
    });
  }

  doSaveOrUpdate() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toars.warning(this.translateService.instant('cateConfig.ticketType.saveWarning'));
      return;
    }
    let dataParams: object = {
      ticketErrorCauseId: this.data ? this.data : null,
      ticketErrorLevelOne: this.getValueOfField('ticketErrorLevelOne'),
      ticketErrorLevelTwo: this.getValueOfField('ticketErrorLevelTwo'),
      name: this.getValueOfField('ticketErrorCauseName').trim(),
      levelError: this.getValueOfField('levelError'),
      description: this.getValueOfField('description'),
      status: this.dataInput.data.status ? this.dataInput.data.status : this.status,
      levelTt: this.levelTt,

    };

    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.tickeErrorService.saveOrUpdate(dataParams).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            dataParams['ticketErrorCauseId'] ? this.toars.success(this.translateService.instant('cateConfig.ticketGroup.updateSussessError')) :
              this.toars.success(this.translateService.instant('cateConfig.ticketGroup.createSussessError'));
            this.dataModel.dataSource = rs.data.listData;
            this.totalRecord = rs.data.count;
            this.doClose();
          } else if (rs.data === 1) {
            this.toars.warning(this.translateService.instant('cateConfig.ticketType.createDuplicateError'));
          } else {
            this.toars.warning(this.translateService.instant('cateConfig.ticketGroup.createErrorCause'));
          }
        },
        () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant('common.500Error'));
        },
      );
      this.saveTimeout = null;
    }, 1000); // Delay of 1000 milliseconds

  }

  doClose() {
    this.dialog.close();
  }

  btnClear() {
    this.selectedErrorCauseLv = 1;
  }
}

import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketExpireCauseService } from '@app/core/services/expire-cause/ticket-expire-cause.service';
import { HTTP_CODE, TICKET_EXPIRE_CAUSE_LEVEL } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import { ComponentType, ToastrService } from 'ngx-toastr';
import { SelectOptionModel } from '@core/models/common.model';

@Component({
  selector: 'app-ticket-expire-cause-create',
  templateUrl: './ticket-expire-cause-create.component.html',
  styleUrls: ['./ticket-expire-cause-create.component.scss'],
})
export class TicketExpireCauseCreateComponent extends BaseComponent implements OnInit {
  form!: FormGroup;
  disabled = false;
  data!: string;
  title!: string;
  selectedExpireCauseLv = null;
  selectedLevel1: boolean = false;
  selectedLevel2: boolean = false;
  status: number = 1;
  search: any = 1;
  searchModel2: any = {};
  searchModel1: any = {};
  lstTicketLevel: any = [
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL.LEVEL_1,
      label: this.translateService.instant('Cấp 1'),
    },
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL.LEVEL_2,
      label: this.translateService.instant('Cấp 2'),
    },
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL.LEVEL_3,
      label: this.translateService.instant('Cấp 3'),
    },
  ];
  ticketExpireCauseId!: number;

  listOption: any = [];
  lstExpireLvOne: any = [];
  lstExpireLvTwo: any = [];
  saveTimeout: any;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<TicketExpireCauseCreateComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketExpireCauseService: TicketExpireCauseService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
  ) {
    super(null, null);
  }

  ngOnInit(): void {
    this.buildForm();
    this.getLstExpireLvOne();
    this.title = this.dataInput.data['title'];
    this.ticketExpireCauseId = this.dataInput['data']['data'] && this.dataInput['data']['data']['ticketExpireCauseId'] ? this.dataInput['data']['data']['ticketExpireCauseId'] : null;
    if (this.dataInput.data.data["ticketExpireCauseId"]) {
      this.search = 0;
      this.selectedExpireCauseLv = this.dataInput.data.data['levelExpire'];
      this.data = this.dataInput.data.data['ticketExpireCauseId'];
      this.getDataDetail(this.data);
    }
  }

  /* get list data ticket expire cause level 1 */
  getLstExpireLvOne() {
    this.isLoading = true;
    let params: object = {
      search: this.search,
    };
    this.isLoading = true;
    this.ticketExpireCauseService.getTicketExpireCauseByParent(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstExpireLvOne = data.map(val => ({ value: val.ticketExpireCauseId, label: val.name }));
    });
  }

  // onChangLevelOne(item: any) {
  //   if (item != null) {
  //     this.getListLevelTwo(item.value);
  //   }
  // }

  onChangLevelOne() {
    if (this.searchModel1) {
      this.getListLevelTwo(this.searchModel1);
    } else {
      this.searchModel2= null;
    }
  }

  getListLevelTwo(lstParentId) {
    this.isLoading = true;
    let params: object = {
      lstParentId: [lstParentId],
      search: this.search,
    };
    this.isLoading = true;
    this.ticketExpireCauseService.getTicketExpireCauseByParent(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstExpireLvTwo = data.map(val => ({ value: val.ticketExpireCauseId, label: val.name }));
    });
  }

  buildForm() {
    this.form = this.fb.group({
      ticketExpireCauseId: [''],
      levelExpire: ['', [Validators.required]],
      ticketExpireLevelOne: '', //Nguyen nhan qua han cap 1
      ticketExpireLevelTwo: '', //Nguyen nhan qua han cap 2
      ticketExpireCauseName: ['', [Validators.required, Validators.maxLength(255)]],//Tên nguyen nhan qua han
      description: '',//Mô tả
    });
  }

  onChangeLevelExpireCause(event) {
    this.selectedExpireCauseLv = event.value;
    if (this.selectedExpireCauseLv==1){
      this.form.controls.ticketExpireLevelOne = new FormControl('');
      this.form.controls.ticketExpireLevelTwo = new FormControl('');
    }
    if(this.selectedExpireCauseLv==2){
      this.form.controls.ticketExpireLevelOne = new FormControl('',Validators.required);
      this.form.controls.ticketExpireLevelTwo = new FormControl('');
    }
    if(this.selectedExpireCauseLv==3){
      this.form.controls.ticketExpireLevelOne = new FormControl('',Validators.required);
      this.form.controls.ticketExpireLevelTwo = new FormControl('',Validators.required);
    }
  }

  defaultDataDetail(ticketExpire: any) {
    this.form['controls']['levelExpire'].setValue(ticketExpire.levelExpire);
    if (ticketExpire.levelExpire == 3) {
      this.form['controls']['ticketExpireLevelOne'].setValue(ticketExpire.ticketExpireCauseThreeId);
    } else {
      this.form['controls']['ticketExpireLevelOne'].setValue(ticketExpire.parentId);
    }
    // this.form['controls']['ticketExpireLevelOne'].setValue(ticketExpire.ticketExpireCauseThreeId);
    this.form['controls']['ticketExpireLevelTwo'].setValue(ticketExpire.parentId);
    // this.form['controls']['ticketExpireCauseCode'].setValue(ticketExpire.expireCauseCode);
    this.form['controls']['ticketExpireCauseName'].setValue(ticketExpire.expireCauseName);
    this.form['controls']['description'].setValue(ticketExpire.description);
    this.status = ticketExpire.status;
    this.form['controls']['ticketExpireLevelOne'].disable();
    this.form['controls']['ticketExpireLevelTwo'].disable();
    this.form['controls']['levelExpire'].disable();
  }

  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  doSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    const ticketExpireLevelOne = this.getValueOfField('ticketExpireLevelOne');
    const ticketExpireLevelTwo = this.getValueOfField('ticketExpireLevelTwo');
    let isValid = true;
    switch (this.getValueOfField('levelExpire')) {
      case 2:
        isValid = !!ticketExpireLevelOne;
        break;
      case 3:
        isValid = !!ticketExpireLevelTwo;
        break;
    }
    if (this.form.invalid || isValid === false) {
      this.form.markAllAsTouched();
      this.toars.warning(this.translateService.instant('cateConfig.ticketType.saveWarning'));
      return;
    }

    let params: object = {
      ticketExpireCauseId: this.data ? this.data : null,
      ticketExpireLevelOne: this.getValueOfField('ticketExpireLevelOne'),
      ticketExpireLevelTwo: this.getValueOfField('ticketExpireLevelTwo'),
      // expireCauseCode: this.getValueOfField('ticketExpireCauseCode'),
      expireCauseName: this.getValueOfField('ticketExpireCauseName'),
      levelExpire: this.getValueOfField('levelExpire'),
      description: this.getValueOfField('description'),
      status: this.status,
    };

    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.ticketExpireCauseService.saveOrUpdate(params).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            params['ticketExpireCauseId'] ? this.toars.success(this.translateService.instant('ticketExpire.updateSuccess'))
              : this.toars.success(this.translateService.instant('ticketExpire.createSuccess'));
            this.dataModel.dataSource = rs.data.listData;
            this.totalRecord = rs.data.count;
            this.doClose();
          } else if (rs.data === 1) {
            this.toars.warning(this.translateService.instant('ticketExpire.createDuplicateExpire'));
          } else {
            this.toars.warning(this.translateService.instant('ticketExpire.createError'));
          }
        },
        () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant('common.500Error'));
        },
      );
      this.saveTimeout = null;
    }, 1000); // Delay of 1000 milliseconds
  };

  getDataDetail(ticketExpireCauseId) {
    this.isLoading = true;
    this.ticketExpireCauseService.getDataDetail(ticketExpireCauseId).subscribe(rs => {
      this.isLoading = false;
      this.defaultDataDetail(rs['data']);
      this.getLstExpireLvOne();
      if (this.selectedExpireCauseLv == 3) {
        this.getListLevelTwo(rs['data']['ticketExpireCauseThreeId']);
      }
    });
  }

  doClose() {
    this.dialogRef.close();
  }
  btnClear() {
    this.selectedExpireCauseLv=1;
  }
}

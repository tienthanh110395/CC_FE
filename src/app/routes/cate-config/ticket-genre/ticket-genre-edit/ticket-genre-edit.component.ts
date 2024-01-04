import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@core/models/common.model';
import { TicketGenreService } from "@core/services/cate-config/ticket-genre.service";
import { TranslateService } from '@ngx-translate/core';
import { HTTP_CODE } from '@shared';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import _ from "lodash";
import { ComponentType, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ticket-genre-edit',
  templateUrl: './ticket-genre-edit.component.html',
  styleUrls: ['./ticket-genre-edit.component.scss'],
})
export class TicketGenreEditComponent extends BaseComponent implements OnInit {
  @ViewChild('ticketGroups') private ticketGroups: MatOption;
  @ViewChild('ticketGenres') private ticketGenres: MatOption;
  formSearch!: FormGroup;
  disabled = false;
  title!: string;
  lstTicketGenre: SelectOptionModel[] = [] as SelectOptionModel[];
  lstTicketGroup: SelectOptionModel[] = [] as SelectOptionModel[];
  levelTt: any = 2;
  ticketTypeId!: number;
  data!: string;
  status: number = 1;
  listTitle: any = [];
  search: any = 1;
  searchModelGroup: any = {};
  isEdit = true;
  isClear: boolean = false;
  private saveTimeout: any;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<TicketGenreEditComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    private ticketGenreService: TicketGenreService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
    protected toars?: ToastrService,
    protected translateService?: TranslateService,
  ) {
    super(ticketGenreService, RESOURCE.CC_CATE_CONFIG, toars, translateService);
  }

  ngOnInit(): void {
    this.isClear=false;
    this.buildForm();
    this.getListTicketGroup();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketTypeId: [''],
      ticketGroup: ["", [Validators.required]], //Nhóm phản ánh
      ticketTypeName: ["", [Validators.required, Validators.maxLength(255)]],//Tên loại phản ánh
      description: ["", [Validators.maxLength(1024)]],//Mô tả
    });
  }

  doClose() {
    this.dialogRef.close();
  }

  getValueOfField(item: any) {
    return this.formSearch.get(item)?.value;
  }

  doSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    if (this.formSearch.invalid) {
      this.formSearch.markAllAsTouched();
      this.toars.warning(this.translateService.instant('cateConfig.ticketType.saveWarning'));
      return;
    }
    let params: object = {
      ticketTypeId: this.data ? this.data : null,
      parentId: this.getValueOfField('ticketGroup'),
      ticketTypeName: this.getValueOfField('ticketTypeName'),
      description: this.getValueOfField('description'),
      status: this.status,
      levelTt: this.levelTt,
    };

    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.ticketGenreService.saveOrUpdate(params).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            params['ticketTypeId'] ? this.toars.success(this.translateService.instant('cateConfig.ticket-genre.createSuccess'))
              : this.toars.success(this.translateService.instant('cateConfig.ticket-genre.createSuccess'));
            this.dataModel.dataSource = rs.data.listData;
            this.totalRecord = rs.data.count;
            this.isLoading = false;
            this.doClose();
          } else if (rs.data === 1) {
            this.toars.warning(this.translateService.instant('cateConfig.ticket-genre.duplicateCode'));
          } else {
            this.toars.warning(this.translateService.instant('cateConfig.ticket-genre.createError'));
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

  checkDupl(a: any) {
    return _.uniq(a).length !== a.length;
  }

  getListTicketGroup() {
    this.isLoading = true;
    let params: object = {
      search: this.search,
    };
    this.ticketGenreService.getTicketTypeByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketGroup = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
    });
  }

  getListTicketGenre(parentId) {
    this.ticketGenreService.getTicketTypeByParentId(parentId).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketGenre = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
    });
  }
  onChangeValue(){
      this.isClear=true;
  }
}

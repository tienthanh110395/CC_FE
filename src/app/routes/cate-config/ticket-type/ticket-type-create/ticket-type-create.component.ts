import { Component, Inject, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { RESOURCE } from "@app/core/app-config";
import { SelectOptionModel } from "@core/models/common.model";
import { TicketTypeService } from "@core/services/cate-config/ticket-type.service";
import { TranslateService } from "@ngx-translate/core";
import { HTTP_CODE } from "@shared";
import { BaseComponent } from "@shared/components/base-component/base-component.component";
import { ComponentType, ToastrService } from "ngx-toastr";

@Component({
  selector: "app-ticket-type-create",
  templateUrl: "./ticket-type-create.component.html",
  styleUrls: ["./ticket-type-create.component.scss"]
})
export class TicketTypeCreateComponent extends BaseComponent implements OnInit {
  @ViewChild("ticketGroups") private ticketGroups: MatOption;
  @ViewChild("ticketGenres") private ticketGenres: MatOption;
  form!: FormGroup;
  isEdit = false;
  title!: string;
  lstTicketGenre: SelectOptionModel[] = [] as SelectOptionModel[];
  lstTicketGroup: SelectOptionModel[] = [] as SelectOptionModel[];
  levelTt: any = 3;
  ticketTypeId!: number;
  data!: string;
  status: any = 1;
  search: any = 1;
  searchModelGroup: any = {};
  searchModelGenre: any = {};
  isClear: boolean = false;
  isClear1: boolean = false;
  saveTimeout: any;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<TicketTypeCreateComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    private ticketTypeService: TicketTypeService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
    protected toars?: ToastrService,
    protected translateService?: TranslateService
  ) {
    super(ticketTypeService, RESOURCE.CC_CATE_CONFIG, toars, translateService);
  }

  ngOnInit(): void {
    this.isEdit = true;
    this.buildForm();
    this.title = this.dataInput.data["title"];
    this.ticketTypeId = this.dataInput["data"]["data"] && this.dataInput["data"]["data"]["ticketTypeId"] ? this.dataInput["data"]["data"]["ticketTypeId"] : null;
    if (this.ticketTypeId) {
      this.isEdit = false;
      this.search = 0;
      this.getDataDetail(this.dataInput["data"]["data"]["ticketTypeId"]);
    }
    this.getListTicketGroup();
  }

  buildForm() {
    this.form = this.fb.group({
      ticketTypeId: [""],
      ticketGroup: ["", [Validators.required]], //Nhóm phản ánh
      ticketGenre: ["", [Validators.required]], //Thể loại phản ánh
      ticketTypeName: ["", [Validators.required, Validators.maxLength(255)]],//Tên loại phản ánh
      ticketTemplate: ["", [Validators.maxLength(2000)]],//Form nhập
      description: ["", [Validators.maxLength(1024)]]//Mô tả
    });
  }

  doClose() {
    this.dialogRef.close();
  }

  defaultDataDetail(ticketType: any) {
    this.form["controls"]["ticketGroup"].setValue(ticketType.ticketTypeGroupId);
    this.form["controls"]["ticketGenre"].setValue(ticketType.parentId);
    this.form["controls"]["ticketTypeName"].setValue(ticketType.ticketTypeName);
    this.form["controls"]["ticketTemplate"].setValue(ticketType.ticketTemplate);
    this.form["controls"]["description"].setValue(ticketType.description);
    this.status = ticketType.status;
    this.form["controls"]["ticketGroup"].disable();
    this.form["controls"]["ticketGenre"].disable();
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
      ticketTypeId: this.ticketTypeId ? this.ticketTypeId : null,
      ticketGroup: this.getValueOfField('ticketGroup'),
      parentId: this.getValueOfField('ticketGenre'),
      ticketTypeName: this.getValueOfField('ticketTypeName').trim(),
      ticketTemplate: this.getValueOfField('ticketTemplate'),
      description: this.getValueOfField('description'),
      status: this.dataInput.data.status ? this.dataInput.data.status : this.status,
      levelTt: this.levelTt,
    };
    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.ticketTypeService.saveOrUpdate(params).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            params['ticketTypeId'] ? this.toars.success(this.translateService.instant('cateConfig.ticketType.updateSuccess'))
              : this.toars.success(this.translateService.instant('cateConfig.ticketType.createSuccess'));
            this.dataModel.dataSource = rs.data.listData;
            this.totalRecord = rs.data.count;
            this.doClose();
          } else if (rs.data === 1) {
            this.toars.warning(this.translateService.instant('cateConfig.ticketType.createDuplicate'));
          } else {
            this.toars.warning(this.translateService.instant('cateConfig.ticketType.createError'));
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

  getDataDetail(ticketTypeId) {
    this.isLoading = true;
    this.ticketTypeService.getDataDetail(ticketTypeId).subscribe(rs => {
      this.isLoading = false;
      this.defaultDataDetail(rs["data"]);
      this.getListTicketGroup();
      this.getListTicketGenre(rs["data"]["ticketTypeGroupId"]);
    });
  }

  getListTicketGroup() {
    this.isLoading = true;
    let params: object = {
      search: this.search
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketGroup = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
    });
  }

  getListTicketGenre(parentId) {
    let params: object = {
      lstParentId: [parentId],
      search: this.search
    };
    this.isLoading = true;
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketGenre = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
    });
  }

  onGroupChange(option) {
    this.form.controls.ticketGenre.setValue("");
    if (option?.value) {
      this.getListTicketGenre(option.value);
      this.isClear=true;
    } else {
      this.isClear=false;
      this.isClear1 = false;
      this.form.controls.ticketGenre.setValue("");
      this.lstTicketGenre = [];
    }
  }
  onChangeValue(){
    this.isClear1 = true;
  }
}

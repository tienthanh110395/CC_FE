import { Component, Inject, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SelectOptionModel } from "@app/core/models/common.model";
import { TicketLevelCateService } from "@app/core/services/cate-config/ticket-level-cate.service";
import { TicketTypeService } from "@app/core/services/cate-config/ticket-type.service";
import { TicketSlaService } from "@app/core/services/ticket-sla/ticket-sla.service";
import { HTTP_CODE } from "@app/shared";
import { BaseComponent } from "@app/shared/components/base-component/base-component.component";
import { TranslateService } from "@ngx-translate/core";
import _ from "lodash";
import { ComponentType, ToastrService } from "ngx-toastr";

@Component({
  selector: "app-processing-time-config-dialog",
  templateUrl: "./processing-time-config-dialog.component.html",
  styleUrls: ["./processing-time-config-dialog.component.scss"]
})
export class ProcessingTimeConfigDialogComponent extends BaseComponent implements OnInit {

  loading: boolean = false;
  form!: FormGroup;
  lstTicketGroup: SelectOptionModel[] = [] as SelectOptionModel[];
  lstTicketGenre: SelectOptionModel[] = [] as SelectOptionModel[];
  lstTicketType: any = [];
  isEdit = true;
  disabled = false;
  checked = false;
  data!: string;
  title!: string;
  search: any = 1;
  displayedColumns: any = [];
  lstDataTicketTimeConfig: any = [];
  lstOtherCate: any = [];
  ticketLevelCateName!: string;
  searchModelGroup: any = {};
  searchModelGenre: any = {};
  inputValue: string = "";
  isClearGroup: boolean = false;
  isClearGenre: boolean = false;
  saveTimeout: any;
  checkSave: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<ProcessingTimeConfigDialogComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketTypeService: TicketTypeService,
    private ticketSlaService: TicketSlaService,
    private ticketLevelCateService: TicketLevelCateService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any
  ) {
    super(null, null);
  }

  ngOnInit(): void {
    this.buildColumn();
    this.buildForm();
    this.getListTicketGroup();

    this.title = this.dataInput.data["title"];
    if (this.dataInput.data.data) {
      this.data = this.dataInput.data.data["ticketTypeId"];
      this.getDataDetail(this.data);
    } else {
      this.getListOtherCate();
    }
  }

  buildColumn() {
    this.columns = [
      { i18n: "common.orderNumber", field: "orderNumber" },//STT
      { i18n: "ticketProcessConfig.table.LevelCate", field: "levelCate" },//Nhóm phản ánh
      { i18n: "ticketProcessConfig.table.ticketTimeFull", field: "ticketTimeFull" },//Thể loại phản ánh
      { i18n: "ticketProcessConfig.table.ticketTimeLv1", field: "ticketTimeLv1" },//Mã loại phản ánh
      { i18n: "ticketProcessConfig.table.ticketTimeLv2", field: "ticketTimeLv2" },//Tên loại phản ánh
      { i18n: "ticketProcessConfig.table.ticketRetime", field: "ticketRetime" }//Tên loại phản ánh
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  buildForm() {
    this.form = this.fb.group({
      ticketTypeId: [""],
      receptionTimeFrom: ["", [Validators.required]],
      receptionTimeTo: ["", [Validators.required]], //Nguyen nhan qua han cap 1
      ticketGroup: ["", [Validators.required]], //Nhóm phản ánh
      ticketGenre: ["", [Validators.required]] //Thể loại phản ánh
    });
  }

  getListOtherCate() {
    this.ticketLevelCateService.getTicketOtherCate().subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.getDataForm(data);
    });
  }

  getDataForm(data: any) {
    this.lstDataTicketTimeConfig = [];
    let dataResult: any = [];
    data.forEach((obj) => {
      let dataItem = _.clone(obj);
      dataResult.push(dataItem);
    });
    this.lstDataTicketTimeConfig = dataResult;
  }

  getDataFormDetail(dataDetail: any) {
    this.lstDataTicketTimeConfig = [];
    let dataResult: any = [];
    if (dataDetail) {
      dataDetail.forEach((dataDetail) => {
        let dataItemDetail = {
          ticketLevelCateName: dataDetail.priorityName,
          ticketLevelCateId: dataDetail["priorityId"],
          ticketSlaId: dataDetail.ticketSlaId,
          ticketTimeFull: dataDetail["processTime"],
          ticketTimeLv1: dataDetail["combineTimeL1"],
          ticketTimeLv2: dataDetail["combineTimeL2"],
          ticketRetime: dataDetail["reTicketTime"]
        };
        dataResult.push(dataItemDetail);
      });
      this.lstDataTicketTimeConfig = dataResult;
    }
  }

  getListTicketGroup() {
    this.isLoading = true;
    let params: object = {
      search: this.search
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      this.isLoading = false;
      this.lstTicketGroup = res.data?.listData || [];
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
      this.lstTicketGenre = res.data?.listData || [];
    });
  }

  onChangGenre(item: any) {
    if (item != null) {
      this.getListTicketGenre(item.ticketTypeId);
    }
  }

  // onChangTicketType(item: any) {
  //   if (item != null) {
  //     this.getListTicketType(item.ticketTypeId);
  //   }
  // }

  getListTicketType(parentId) {
    this.isLoading = true;
    this.ticketSlaService.getTicketTypeFordConfigTime(parentId).subscribe(res => {
      this.isLoading = false;
      this.lstTicketType = res.data || [];
    });
  }

  getListTicketTypeForConfigTimeDetail(ticketTypeId) {
    this.isLoading = true;
    this.ticketSlaService.getTicketTypeFordConfigTimeDetail(ticketTypeId).subscribe(res => {
      this.isLoading = false;
      this.lstTicketType = res.data || [];
    });
  }

  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  checkValidateList() {
    this.lstDataTicketTimeConfig.forEach((obj) => {
      if (obj['ticketTimeFull'] && obj['ticketTimeLv1'] && obj['ticketTimeLv2'] && obj['ticketRetime']) {
        this.checkSave = false;
      } else {
        this.checkSave = true;
      }
    });
    return this.checkSave;
  }

  doSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    let dataResult: any = [];
    this.checkValidateList();
    let validateTime = this.onChangeTime();
    if (this.form.invalid || this.checkSave === true || validateTime === true) {
      if (validateTime == true) {
        this.toars.warning(this.translateService.instant('ticketProcessConfig.validTime'));
      }
      if (this.form.invalid || this.checkSave === true) {
        this.form.markAllAsTouched();
        this.toars.warning(this.translateService.instant('cateConfig.ticketType.saveWarning'));
      }
      return;
    }

    let params: object = {};
    if (this.data) {
      let dataSource = this.lstDataTicketTimeConfig;
      params = {
        ticketTypeId: this.data,
        ticketGroupId: this.getValueOfField("ticketGroup"),
        ticketGenreId: this.getValueOfField("ticketGenre"),
        receptionTimeFrom: this.getValueOfField("receptionTimeFrom"),
        receptionTimeTo: this.getValueOfField("receptionTimeTo"),
        lstDataTicketTimeConfig: dataSource,
        lstTicketType: dataResult
      };
    } else {
      let dataCheck = _.filter(this.lstTicketType, (obj: any) => {
        return obj["check"] === true;
      });
      if (dataCheck && dataCheck.length > 0) {
        dataCheck.forEach((obj) => {
          let dataItem = _.clone(obj["ticketTypeId"]);
          dataResult.push(dataItem);
        });
        let dataSource = this.lstDataTicketTimeConfig;
        params = {
          ticketGroupId: this.getValueOfField("ticketGroup"),
          ticketGenreId: this.getValueOfField("ticketGenre"),
          receptionTimeFrom: this.getValueOfField("receptionTimeFrom"),
          receptionTimeTo: this.getValueOfField("receptionTimeTo"),
          lstDataTicketTimeConfig: dataSource,
          lstTicketType: dataResult
        };
      } else {
        this.toars.warning(this.translateService.instant("cateConfig.ticketType.selectOneTicketType"));
        return;
      }
    }
    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.ticketSlaService.saveOrUpdate(params).subscribe(rs => {
        this.isLoading = false;
        if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
          params["ticketTypeId"] ? this.toars.success(this.translateService.instant("ticketProcessConfig.updateSuccess"))
            : this.toars.success(this.translateService.instant("ticketProcessConfig.createSuccess"));
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.doClose();
        } else if (rs.data === 1) {
          this.toars.warning(this.translateService.instant("ticketProcessConfig.updateError"));
        } else {
          this.toars.warning(this.translateService.instant("ticketProcessConfig.createError"));
        }
      },
        () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant("common.500Error"));
        }
      );

      this.saveTimeout = null;
    }, 1000); // Delay of 1000 milliseconds
  }

  doClose() {
    this.dialogRef.close();
  }

  onCheckItem(item: any, ob: any) {
    let itemCheck = _.filter(this.lstTicketType, (obj: any) => {
      return obj["check"] === true;
    });
  }

  getDataDetail(ticketTypeId) {
    this.isLoading = true;
    this.ticketSlaService.getDataDetail(ticketTypeId).subscribe(rs => {
      this.isLoading = false;
      this.defaultDataDetail(rs["data"]["listData"]);
      this.getListTicketGroup();
      this.getListTicketGenre(rs["data"]["listData"][0]["ticketGroupId"]);
      this.getListTicketTypeForConfigTimeDetail(ticketTypeId);
      this.getDataFormDetail(rs["data"]["listData"]);
    });
  }

  defaultDataDetail(data: any) {
    this.form["controls"]["ticketGroup"].setValue(data[0]["ticketGroupId"]);
    this.form["controls"]["ticketGenre"].setValue(data[0]["ticketGenreId"]);
    this.form["controls"]["receptionTimeFrom"].setValue(data[0]["receptionTimeFrom"]);
    this.form["controls"]["receptionTimeTo"].setValue(data[0]["receptionTimeTo"]);
    this.form["controls"]["ticketGroup"].disable();
    this.form["controls"]["ticketGenre"].disable();
  }

  validateNumber(event: any) {
    const input = event.target.value;
    const pattern = /^[0-9]*$/; // Biểu thức chính quy chỉ cho phép các ký tự từ 0 đến 9

    if (!pattern.test(input)) {
      this.toars.warning("Vui lòng nhập mã dạng chữ số!");
    }
  }

  onGroupChange(option) {
    this.form.controls.ticketGenre.setValue("");
    if (option?.ticketTypeId) {
      this.getListTicketGenre(option.ticketTypeId);
      this.isClearGroup = true;
    } else {
      this.isClearGroup = false;
      this.isClearGenre = false;
      this.form.controls.ticketGenre.setValue("");
      this.lstTicketGenre = [];
      this.lstTicketType = [] as SelectOptionModel[];
    }
  }

  onChangeTicketGenre(option) {
    if (option?.ticketTypeId) {
      this.getListTicketType(option.ticketTypeId);
      this.isClearGenre = true;
    } else {
      this.isClearGenre = false;
      this.lstTicketType = [] as SelectOptionModel[];

    }
  }

  // onKeyDown(event: KeyboardEvent) {
  //   if (
  //     this.inputValue.length === 0 &&
  //     event.key === "0" &&
  //     !this.inputValue.includes("0")
  //   ) {
  //     event.preventDefault();
  //   }
  // }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default Enter key behavior
    }
  }

  onChangeTime() {
    let lstResultTime = false;
    let receptionTimeFrom = this.form["controls"]["receptionTimeFrom"].value;
    let receptionTimeTo = this.form["controls"]["receptionTimeTo"].value;
    if (receptionTimeTo && receptionTimeTo) {
      if (receptionTimeTo < receptionTimeFrom) {
        lstResultTime = true;
      }
    }
    return lstResultTime;
  }
}

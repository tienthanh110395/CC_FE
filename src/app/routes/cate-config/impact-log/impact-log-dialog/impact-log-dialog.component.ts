import { Component, Inject, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { RESOURCE } from "@core";
import { ImpactLogService } from "@core/services/cate-config/impact-log-service";
import { TranslateService } from "@ngx-translate/core";
import { HTTP_CODE } from "@shared";
import { BaseComponent } from "@shared/components/base-component/base-component.component";
import { ComponentType, ToastrService } from "ngx-toastr";

@Component({
  selector: "app-impact-log-dialog",
  templateUrl: "./impact-log-dialog.component.html",
  styleUrls: ["./impact-log-dialog.component.scss"]
})
export class ImpactLogDialogComponent extends BaseComponent implements OnInit {
  displayedColumns: any = [];
  lstData: any = [];
  pageSizeList = [10, 50, 100];
  title!: string;
  actionAuditId!: number;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<ImpactLogDialogComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    private impactLogService: ImpactLogService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
    protected toars?: ToastrService,
    protected translateService?: TranslateService) {
    super(impactLogService, RESOURCE.CC_IMPACT_LOG, toars, translateService);
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: "common.orderNumber", field: "orderNumber" },//STT
      { i18n: "cateConfig.impactLog.columnName", field: "decription" },//Trường tác động
      { i18n: "cateConfig.impactLog.oldValue", field: "oldValue" },//Giá trị cũ
      { i18n: "cateConfig.impactLog.newValue", field: "newValue" }//Giá trị mới
    ];
    this.displayedColumns = this.columns.map(x => x.field);
    this.title = this.dataInput.data["title"];

    this.actionAuditId = this.dataInput.data["actionAuditId"] ? this.dataInput.data["actionAuditId"] : null;
    if (this.actionAuditId) {
      this.pageIndex = 0;
      this.searchModel.startrecord = 0;
      this.getActionAuditDetail(this.actionAuditId);
    }
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.getActionAuditDetail(this.actionAuditId);
  }


  getActionAuditDetail(actionAuditId) {
    this.isLoading = true;
    this.impactLogService.searchActionAuditDetail(actionAuditId, this.searchModel.startrecord, this.searchModel.pagesize).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstData = rs.data.listData;
        this.totalRecord = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      }
    );
  }

  getHeightTable(source) {
    if (source) {
      if (source.length >= 10) {
        return "55vh";
      } else {
        return "fit-content";
      }
    }
  }

}

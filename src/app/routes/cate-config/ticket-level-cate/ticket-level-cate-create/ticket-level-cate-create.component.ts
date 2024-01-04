import { Component, Inject, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { RESOURCE } from "@core";
import { TicketLevelCateModel } from "@core/models/ticket-level-cate.model";
import { TicketLevelCateService } from "@core/services/cate-config/ticket-level-cate.service";
import { TranslateService } from "@ngx-translate/core";
import { HTTP_CODE } from "@shared";
import { BaseComponent } from "@shared/components/base-component/base-component.component";
import { CrmTableComponent } from "@shared/components/table-component/table-component.component";
import _ from "lodash";
import { ComponentType, ToastrService } from "ngx-toastr";

@Component({
  selector: "app-ticket-level-cate-create",
  templateUrl: "./ticket-level-cate-create.component.html",
  styleUrls: ["./ticket-level-cate-create.component.scss"]
})
export class TicketLevelCateCreateComponent extends BaseComponent implements OnInit {
  @ViewChild("crmtable") crmTable: CrmTableComponent;
  loading: boolean = false;
  checkDuplicate: boolean;

  title!: string;
  form!: FormGroup;
  data!: string;
  status: any = 1;
  type: any = 1;
  dataSource = new MatTableDataSource<TicketLevelCateModel>([]);
  countTableType = 0;
  displayedColumnsType: any = [];
  listTitle: any = [];
  lastIndex: number = 0;
  checkEmptyTypeName: boolean;
  saveTimeout: any;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ComponentType<TicketLevelCateCreateComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    private ticketLevelCateService: TicketLevelCateService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
    protected toars?: ToastrService,
    protected translateService?: TranslateService
  ) {
    super(ticketLevelCateService, RESOURCE.CC_CATE_CONFIG, toars, translateService);
  }

  ngOnInit(): void {
    this.buildColumns();
    this.displayedColumnsType = this.columns.map(x => x.field);
    this.buildForm();
    this.defaultRow();
    this.title = this.dataInput.data["title"];
  }

  buildColumns() {
    this.columns = [
      { i18n: "STT", field: "orderNumber" },//STT
      { i18n: "common.action", field: "action" },//Tác động
      { i18n: "Mã mức độ ", field: "ticketLevelCateCode" },//Mã mức độ
      { i18n: "Tên mức độ", field: "ticketLevelCateName" },//Tên mức độ
      { i18n: "search-bot.description", field: "description" }
    ];
  }

  buildForm() {
    this.form = this.fb.group({
      ticketLevelCateCode: "",//Mã loại phản ánh
      ticketLevelCateName: ["", [Validators.required, Validators.maxLength(255)]],//Tên loại phản ánh
      fromDate: "",//Từ ngày
      toDate: "",//Đến ngày
      inEffect: "", // Đang hiệu lực
      expire: "", // Hết hiệu lực
      createUser: "", //Người tạo
      startRecord: 0,
      pageSize: this.pageSizeList[0],
      status: "",
      description: ["", [Validators.maxLength(1024)]],
      type: "",
      levelTt: ""
    });
  }

  doAddRow(row: any) {
    if (this.checkDuplicate == false) {
      this.toars.warning(this.translateService.instant("Kiểm tra lại mã thể loại đang bị trùng, không thể thêm dòng mới"));
    } else {
      //Tạo một hàng rỗng
      if (row.ticketLevelCateCode && row.ticketLevelCateName && this.checkEmptyTypeName == true && (this.dataSource.data.length == this.listTitle.length)) {
        let newItem = new TicketLevelCateModel();
        newItem["status"] = 1;
        newItem["type"] = 1;
        newItem["levelTt"] = 5;
        newItem.ticketLevelCateName = "";
        newItem.ticketLevelCateCode = "";
        this.dataSource.data.push(newItem);
        this.dataSource._updateChangeSubscription();
        this.crmTable.renderTable();
        this.lastIndex = this.dataSource.data.length - 1;
        newItem.description = "";
      }
    }
  }

  onInputChangeTypeName(row: any) {
    if (row.ticketLevelCateName.trim() === "") {
      // The input is empty
      this.checkEmptyTypeName = false;
    } else {
      // The input has a value
      this.checkEmptyTypeName = true;
    }
  }

  checkDataBeforSave(): any {
    let lstResult = _.filter(this.dataSource.data, function (item) {
      if (item.ticketLevelCateName && item.ticketLevelCateCode && item.ticketLevelCateValue && item.ticketLevelCateCode.trim() != "" && item.ticketLevelCateName.trim() != "" && item.ticketLevelCateValue.trim() != "") {
        return item;
      }
    });
    return lstResult;
  }

  doSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    let dataSave = this.dataSource.data;
    let validate = this.checkDataBeforSave();
    if ((validate || []).length == 0) {
      this.toars.warning(this.translateService.instant('common.notify.null-data'));
    } else {
      this.saveTimeout = setTimeout(() => {
        // Perform the save operation
        if (this.dataSource.data.length != 0) {
          this.ticketLevelCateService.saveListTicketGroup(dataSave).subscribe(rs => {
            this.isLoading = false;
            if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
              this.toars.success(this.translateService.instant('Thêm mới mức độ ưu tiên thành công'));
              this.doClose;
            } else {
              this.toars.error(this.translateService.instant('Thêm mới mức độ ưu tiên thất bại'));
            }
          },
            (error) => {
              this.isLoading = false;
              if (error === 'duplicate-ticket-level-cate') {
                this.toars.warning(this.translateService.instant('Đã tồn tại mã mức độ ưu tiên'));
              } else if (error === 'null-data') {
                this.toars.warning(this.translateService.instant('common.notify.null-data'));
              } else if (error === 'duplicate-value') {
                this.toars.warning(this.translateService.instant('Đã tồn tại giá trị mức độ ưu tiên'));
              } else {
                this.toars.error(this.translateService.instant('common.500Error'));
              }
            },
          );

        } else {
          this.toars.warning(this.translateService.instant('common.notify.null-data'));
        }
        this.saveTimeout = null;
      }, 1000); // Delay of 1000 milliseconds
    }

  }

  deleteRow(row: any) {
    if (this.dataSource.data.length == 1) {
      this.toars.warning(this.translateService.instant("Không thể xóa"));
    } else {
      const index = this.dataSource.data.indexOf(row);
      if (index > -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource = new MatTableDataSource(this.dataSource.data);
        this.crmTable.renderTable();
        this.lastIndex = this.lastIndex - 1;
      }
    }
    this.onChangeTitle();
  }

  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  doClose() {
    this.dialogRef.close();
  }

  checkDupl(a: any) {
    return _.uniq(a).length !== a.length;
  }

  onChangeTitle() {
    this.listTitle = _.compact(_.map(this.dataSource.data, "ticketLevelCateValue"));
    if (this.listTitle.length > 0 && this.checkDupl(this.listTitle)) {
      this.toars.warning("Giá trị mức độ đã bị trùng, vui lòng nhập giá trị mức độ khác!");

      this.checkDuplicate = false;
    } else {
      this.checkDuplicate = true;
    }
  }

  defaultRow() {
    // Tạo một hàng rỗng
    let newItem = new TicketLevelCateModel();
    newItem.ticketLevelCateName = "";
    newItem.ticketLevelCateCode = "";
    newItem.description = "";
    newItem["status"] = 1;
    newItem["type"] = 1;
    newItem["levelTt"] = 5;
    this.dataSource.data.push(newItem);
    this.dataSource._updateChangeSubscription();
  }

  validateNumber(event: any) {
    const input = event.target.value;
    const pattern = /^[0-9]*$/; // Biểu thức chính quy chỉ cho phép các ký tự từ 0 đến 9

    if (!pattern.test(input)) {
      this.toars.warning("Giá trị mức độ ưu tiên chưa chính xác, vui lòng nhập giá trị dạng chữ số!");
    }
  }
}

import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { TicketGroupService } from "@app/core/services/cate-config/ticket-group.service";
import { BaseComponent } from "@app/shared/components/base-component/base-component.component";
import { CrmTableComponent } from "@app/shared/components/table-component/table-component.component";
import { HTTP_CODE } from "@app/shared/constant/common.constant";
import { TicketGroupModel } from "@core/models/ticket-group.model";
import { TranslateService } from "@ngx-translate/core";
import _ from "lodash";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-dialog-create-ticket-group",
  templateUrl: "./dialog-create-ticket-group.component.html",
  styleUrls: ["./dialog-create-ticket-group.component.scss"]
})
export class DialogCreateTicketGroupComponent extends BaseComponent implements OnInit {

  @ViewChild("crmtable") crmTable: CrmTableComponent;
  loading: boolean = false;
  formSearch!: FormGroup;
  checkEmptyTypeName: boolean;
  @Input() pageIndex: number;
  @Input() isLoading: boolean;
  countTableType = 0;
  displayedColumnsType: any = [];
  dataSource = new MatTableDataSource<TicketGroupModel>([]);
  lstTicketGroup: Array<TicketGroupModel> = [];
  lastIndex: number = 0;
  listTitle: any = [];
  checkDuplicate: boolean;
  saveTimeout: any;

  constructor(
    private dialog: MatDialog,
    protected translateService: TranslateService,
    private ticketGroupService: TicketGroupService,
    protected toars: ToastrService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public dataInput: any
  ) {
    super();
  }

  ngOnInit(): void {
    this.buildColumns();
    this.displayedColumnsType = this.columns.map(x => x.field);
    this.buildForm();
    this.defaultRow();
  }

  buildColumns() {
    this.columns = [
      { i18n: "common.orderNumber", field: "orderNumber" },
      { i18n: "common.action", field: "action" },
      { i18n: "cateConfig.ticketGroupCode", field: "ticketTypeCode" },
      { i18n: "cateConfig.ticketGroup", field: "ticketTypeName" },
      { i18n: "search-bot.description", field: "description" }
    ];
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketTypeCode: "",//Mã nhóm phản ánh
      ticketTypeName: "", //Tên nhóm phản ánh
      description: ""//Mô tả
    });
  }

  checkDataBeforSave(): any {
    let lstResult = _.filter(this.dataSource.data, function (item) {
      if (item.ticketTypeName && item.ticketTypeCode && item.ticketTypeCode.trim() != '' && item.ticketTypeName.trim() != '') {
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
    dataSave.map(item => item.levelTt = 1);
    let validate = this.checkDataBeforSave();
    if ((validate || []).length == 0) {
      this.toars.warning(this.translateService.instant('common.notify.null-data'));
    } else {
      if (this.dataSource.data.length != 0) {
        this.saveTimeout = setTimeout(() => {
          // Perform the save operation
          this.ticketGroupService.saveListTicketGroup(dataSave).subscribe(rs => {
              if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
                this.toars.success(this.translateService.instant('cateConfig.ticketGroup.createSuccess'));
                this.isLoading = false;
                this.dialog.closeAll();
              } else {
                this.toars.error(this.translateService.instant('cateConfig.ticketGroup.createError'));
              }
            },
            (error) => {
              this.isLoading = false;
              if (error === 'duplicate-ticket-group')
                this.toars.warning(this.translateService.instant('common.notify.duplicate-ticket-group'));
              else if (error === 'null-data') {
                this.toars.warning(this.translateService.instant('common.notify.null-data'));
              } else
                this.toars.error(this.translateService.instant('common.500Error'));
            },
          );
          this.saveTimeout = null;
        }, 1000); // Delay of 1000 milliseconds
      } else {
        this.toars.warning(this.translateService.instant('common.notify.null-data'));
      }
    }

  }

  getValueOfField(item: any) {
    return this.formSearch.get(item)?.value;
  }

  doAddRow(row: any) {
    if (this.checkDuplicate == false) {
      this.toars.warning(this.translateService.instant("Kiểm tra lại mã nhóm phản ánh đang bị trùng, không thể thêm dòng mới"));
    } else {
      //Tạo một hàng rỗng
      if (row.ticketTypeCode && row.ticketTypeName && this.checkEmptyTypeName == true && (this.dataSource.data.length == this.listTitle.length)) {
        let newItem = new TicketGroupModel();
        newItem["status"] = 1;
        this.dataSource.data.push(newItem);
        this.crmTable.renderTable();
        this.lastIndex = this.dataSource.data.length - 1;
        newItem.description = "";
      }
    }
  }

  onInputChangeTypeName(row: any) {
    if (row.ticketTypeName === "") {
      // The input is empty
      this.checkEmptyTypeName = false;
    } else {
      // The input has a value
      this.checkEmptyTypeName = true;
    }
  }

  doRemoveRow(row: any) {
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

  defaultRow() {
    // Tạo một hàng rỗng
    let newItem = new TicketGroupModel();
    newItem.ticketTypeName = "";
    newItem.ticketTypeCode = "";
    newItem.description = "";
    newItem["status"] = 1;
    this.dataSource.data.push(newItem);
    this.dataSource._updateChangeSubscription();
  }

  checkDupl(a: any) {
    return _.uniq(a).length !== a.length;
  }

  onChangeTitle() {
    this.listTitle = _.compact(_.map(this.dataSource.data, "ticketTypeCode"));
    if (this.listTitle.length > 0 && this.checkDupl(this.listTitle)) {
      this.toars.warning("Mã nhóm phản ánh đã bị trùng, vui lòng nhập mã nhóm ánh khác!");
      this.checkDuplicate = false;
    } else {
      this.checkDuplicate = true;
    }
  }

}

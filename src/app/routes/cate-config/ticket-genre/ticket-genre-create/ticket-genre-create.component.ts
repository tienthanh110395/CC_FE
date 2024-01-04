import {
  NgxMatDateAdapter,
  NgxMatDateFormats, NGX_MAT_DATE_FORMATS
} from "@angular-material-components/datetime-picker";
import { SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, Input, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { CustomDateAdapter } from "@app/routes/special-vehicle-management/custom-date";
import { RESOURCE } from "@core";
import { SelectOptionModel } from "@core/models/common.model";
import { TicketGroupModel } from "@core/models/ticket-group.model";
import { TicketGenreService } from "@core/services/cate-config/ticket-genre.service";
import { TranslateService } from "@ngx-translate/core";
import { HTTP_CODE, STATUS_TICKET_TYPE } from "@shared";
import { BaseComponent } from "@shared/components/base-component/base-component.component";
import { CrmTableComponent } from "@shared/components/table-component/table-component.component";
import _ from "lodash";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { ComponentType, ToastrService } from "ngx-toastr";
import { Subject } from "rxjs/internal/Subject";

const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: "l, LTS"
  },
  display: {
    dateInput: "l, LTS",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@Component({
  selector: "app-ticket-genre-create",
  templateUrl: "./ticket-genre-create.component.html",
  styleUrls: ["./ticket-genre-create.component.scss"],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter }
  ]
})
export class TicketGenreCreateComponent extends BaseComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() pageIndex: number;
  @ViewChild("crmtable") crmTable: CrmTableComponent;
  @ViewChild("ticketGroups") private ticketGroups: MatOption;
  @ViewChild("allTicketGenre") private allTicketGenre: MatOption;
  title!: string;
  onDestroy = new Subject<void>();
  data!: string;
  levelTt: any = 2;
  loading: boolean = false;
  lastIndex: number = 0;
  firstIndex: number = 1;
  lstTicketGroup: SelectOptionModel[] = [] as SelectOptionModel[];
  @ViewChild("ticketGenres") private ticketGenres: MatOption;
  form!: FormGroup;
  disabled = false;
  lstTicketGenre: SelectOptionModel[] = [] as SelectOptionModel[];
  status: any = 1;
  checkDuplicate: boolean;
  isAdd: boolean;
  formSearch!: FormGroup;
  titleTab;
  isEdit;
  canEdit: true;
  search: any = 1;
  countTableType = 0;
  ticketTypeId!: number;
  displayedColumnsType: any = [];
  listTitle: any = [];
  checkEmptyTypeName: boolean;
  isInput: boolean;
  selection = new SelectionModel<any>(true, []);
  statusTicketType = STATUS_TICKET_TYPE;
  dataSource = new MatTableDataSource<TicketGroupModel>();
  config: PerfectScrollbarConfigInterface = {
    suppressScrollX: false,
    suppressScrollY: false
  };
  saveTimeout: any;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ComponentType<TicketGenreCreateComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketGenreService: TicketGenreService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any
  ) {
    super(TicketGenreService, RESOURCE.CC_VEHICLE, toars, translateService);
  }


  ngOnInit(): void {
    this.buildForm();
    this.getListTicketGroup();
    this.buildColumns();
    this.defaultRow();
    this.title = this.dataInput.data["title"];
    if (this.dataInput["data"]["ticketTypeId"]) {
      this.data = this.dataInput["data"]["ticketTypeId"];
    }

    if (this.data) {
      this.getDataDetail(this.data);
    }
  }

  buildColumns() {
    this.columns = [
      { i18n: "STT", field: "orderNumber" },//STT
      { i18n: "cateConfig.ticket-genre.table.action", field: "action" },//Tác động
      { i18n: "cateConfig.ticket-genre.table.ticketGroup", field: "ticketGroup" },//Nhóm phản ánh
      { i18n: "cateConfig.ticket-genre.table.ticketGenreCode", field: "ticketTypeCode" },//Mã loại phản ánh
      { i18n: "cateConfig.ticket-genre.table.ticketGenreName", field: "ticketTypeName" },//Tên loại phản ánh
      { i18n: "cateConfig.ticket-genre.table.ticketDes", field: "description" }//Mô tả
    ];
    this.displayedColumnsType = this.columns.map(x => x.field);
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketTypeId: [],
      ticketGroup: "", //Nhóm phản ánh
      ticketGenre: [], //Thể loại phản ánh
      ticketTypeCode: [],//Mã thể loại phản ánh
      ticketTypeName: [],//Tên thể loại phản ánh
      status: [true, []], //Trạng thái
      description: []//Mô tả
    });
  }

  checkChange(row) {
    this.selection.toggle(row);
    row.selected = this.selection.isSelected(row);
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(", ");
    }
    return "";
  }


  onClickInsertRow() {
    const item = new TicketGroupModel();
    this.dataSource.data.push(item);
    // this.formSearch.controls.ticketGroup = null;
    // Cập nhật hiển thị của bảng
    this.crmTable.renderTable();
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
    return this.formSearch.get(item)?.value;
  }

  defaultDataDetailGenre(ticketType: any) {
    this.formSearch["controls"]["ticketGroup"].setValue(ticketType.code);
    this.formSearch["controls"]["ticketTypeCode"].setValue(ticketType.ticketTypeCode);
    this.formSearch["controls"]["ticketTypeName"].setValue(ticketType.ticketTypeName);
    this.formSearch["controls"]["description"].setValue(ticketType.description);
    this.formSearch["controls"]["status"].setValue(ticketType.status);
  }



  onInputChangeTypeName(row: any) {
    if (row.ticketTypeName.trim() === "") {
      // The input is empty
      this.checkEmptyTypeName = false;
    } else {
      // The input has a value
      this.checkEmptyTypeName = true;
    }
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
    dataSave.map(item => item.levelTt = 2);
    dataSave.map(item => item.status = 1);
    let validate = this.checkDataBeforSave();
    if ((validate || []).length == 0) {
      // this.toars.warning(this.translateService.instant("cateConfig.ticketType.genreNoSpaceAndNull"));
      this.toars.warning(this.translateService.instant("common.notify.null-data"));
    } else {
      if (this.dataSource.data.length != 0) {
        this.saveTimeout = setTimeout(() => {
          // Perform the save operation
        this.ticketGenreService.saveListTicketGroup(dataSave).subscribe(rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            this.toars.success(this.translateService.instant("cateConfig.ticket-genre.createSuccess"));
            this.isLoading = false;
            this.dialog.closeAll();
          } else {
            this.toars.error(this.translateService.instant("cateConfig.ticket-genre.createError"));
          }
        },
          (error) => {
            this.isLoading = false;
            if (error === "duplicate-ticket-group")
              this.toars.warning(this.translateService.instant("common.notify.duplicate-ticket-genre"));
            else if (error === "null-data") {
              this.toars.warning(this.translateService.instant("common.notify.null-data"));
            } else
              this.toars.error(this.translateService.instant("common.500Error"));
          }
        );
          this.saveTimeout = null;
        }, 1000); // Delay of 1000 milliseconds
      } else {
        this.toars.warning(this.translateService.instant("common.notify.null-data"));
      }
    }

  };


  doClose() {
    this.dialogRef.close();
  }

  getListTicketGroup() {
    this.isLoading = true;
    let params: object = {
      search: this.search
    };
    this.ticketGenreService.getTicketTypeByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketGroup = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
    });
  }

  getDataDetail(ticketTypeId) {
    this.isLoading = true;
    this.ticketGenreService.getDataDetail(ticketTypeId).subscribe(rs => {
      this.isLoading = false;
      this.defaultDataDetailGenre(rs["data"]["listData"][0]);
      this.getListTicketGroup();
    });
  }

  onChangGenre(value: any) {
    if (value != null) {
      this.getListTicketGenre(value);
    }else {
      // this.lstTicketGroup = [] as SelectOptionModel[];
      delete this.searchModel;
    }
  }

  getListTicketGenre(lstParentId) {
    this.isLoading = true;
    this.ticketGenreService.getTicketTypeByParentId([lstParentId]).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketGenre = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
    });
  }

  checkDupl(a: any) {
    return _.uniq(a).length !== a.length;
  }

  onChangeTitle() {
    this.listTitle = _.compact(_.map(this.dataSource.data, "ticketTypeCode"));
    if (this.listTitle.length > 0 && this.checkDupl(this.listTitle)) {
      this.toars.warning("Mã thể loại phản ánh đã bị trùng, vui lòng nhập mã thể loại phản ánh khác!");
      this.checkDuplicate = false;
    } else {
      this.checkDuplicate = true;
    }
  }
  doAddRow(row: any) {
    if (this.checkDuplicate == false) {
      this.toars.warning(this.translateService.instant("Kiểm tra lại mã thể loại đang bị trùng, không thể thêm dòng mới"));
    } else {
      //Tạo một hàng rỗng
      if (row.ticketTypeCode && row.ticketTypeName && this.checkEmptyTypeName == true && (this.dataSource.data.length == this.listTitle.length)) {
        let newItem = new TicketGroupModel();
        newItem["status"] = 1;
        newItem.ticketTypeName = "";
        newItem.ticketTypeCode = "";
        newItem.description = "";
        delete this.searchModel;
        this.dataSource.data.push(newItem);
        this.dataSource._updateChangeSubscription();
        this.crmTable.renderTable();
        this.lastIndex = this.dataSource.data.length - 1;
      }
    }
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
  onGroupChange(){
    if (this.searchModel) {
      this.getListTicketGroup();
    } else {
      // this.lstTicketGroup = [] as SelectOptionModel[];
      delete this.searchModel;
    }
  }
}

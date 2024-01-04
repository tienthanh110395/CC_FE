import {
  NgxMatDateFormats
} from "@angular-material-components/datetime-picker";
import { SelectionModel } from "@angular/cdk/collections";
import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatOption } from '@angular/material/core';
import { MatTableDataSource } from "@angular/material/table";
import { TicketLevelCateUpdateComponent } from "@app/routes/cate-config/ticket-level-cate/ticket-level-cate-update/ticket-level-cate-update.component";
import { RESOURCE } from "@core";
import { TicketLevelCateModel } from "@core/models/ticket-level-cate.model";
import { TicketLevelCateService } from "@core/services/cate-config/ticket-level-cate.service";
import { MtxDialog } from "@ng-matero/extensions";
import { TranslateService } from "@ngx-translate/core";
import { GROUP_REFLECTS_STATUS, HTTP_CODE, STATUS_TICKET_TYPE } from "@shared";
import { BaseComponent } from "@shared/components/base-component/base-component.component";
import { ConfirmDialogComponent, ConfirmDialogModel } from "@shared/components/confirm-dialog/confirm-dialog.component";
import { CrmTableComponent } from "@shared/components/table-component/table-component.component";
import _ from "lodash";
import { ToastrService } from "ngx-toastr";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { ReplaySubject } from "rxjs/internal/ReplaySubject";
import { Subject } from "rxjs/internal/Subject";
import { take } from "rxjs/operators";

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
  selector: "app-ticket-level-cate",
  templateUrl: "./ticket-level-cate.component.html",
  styleUrls: ["./ticket-level-cate.component.scss"],
  providers: [TicketLevelCateService]
})
export class TicketLevelCateComponent extends BaseComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() isLoading: boolean;
  @Input() pageIndex: number;
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild('status') private status: MatOption;
  @ViewChild("crmtable") crmTable: CrmTableComponent;
  filteredTicketLevelCate: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  search: any = 0;

  statusTicketLevelCate = STATUS_TICKET_TYPE;
  statuses = [
    {
      value: GROUP_REFLECTS_STATUS.HIEU_LUC,
      label: this.translateService.instant("cateConfig.inEffect")
    },
    {
      value: GROUP_REFLECTS_STATUS.HET_HIEU_LUC,
      label: this.translateService.instant("cateConfig.expire")
    }
  ];
  onDestroy = new Subject<void>();
  formSearch!: FormGroup;
  titleTab;
  isCheckedToggleAll: boolean = false;
  isEdit = true;
  canEdit: true;
  countTableType = 0;
  dataSource = new MatTableDataSource<TicketLevelCateModel>();
  displayedColumnsType: any = [];
  lstTicketGenre: any = [
    { code: 1, value: "Nhóm 1" },
    { code: 2, value: "Nhóm 2" },
    { code: 3, value: "Nhóm 3" }
  ];

  listOption: any = [
    { code: 1, value: "Phản ánh 1" }
  ];
  selection = new SelectionModel<any>(true, []);
  statusTicketType = STATUS_TICKET_TYPE;
  // dataSource = new MatTableDataSource<any>();
  lstDataTicketLevelCate: any = [];
  lstLevelCateId: any = [];
  countTableTicketLevelCate = 0;
  messageConfirm: any;

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketLevelCateService: TicketLevelCateService,
    private fb: FormBuilder,
    public dialog?: MtxDialog,
    private cdr?: ChangeDetectorRef) {
    super(ticketLevelCateService, RESOURCE.CC_LEVEL_CATE, toars);
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  customViewDescription(strView: string): string {
    if (strView && strView.length > 65) return strView.substring(0, 65) + " ...";
    else return strView;
  }

  customViewName(strView: string): string {
    if (strView && strView.length > 50) return strView.substring(0, 50) + " ...";
    else return strView;
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: "STT", field: "orderNumber", width: "40px" },//STT
      { i18n: "common.action", field: "action", width: "80px" },//Tác động
      { i18n: "Mã mức độ ", field: "ticketLevelCateCode", width: "100px" },//Mã mức độ
      { i18n: "Tên mức độ", field: "ticketLevelCateName", width: "130px" },//Tên mức độ
      { i18n: "cateConfig.ticket-genre.table.createDate", field: "createDate", width: "150px" },//Ngày tạo
      { i18n: "cateConfig.ticket-genre.table.createuser", field: "createUser", width: "130px" },//Người tạo
      { i18n: "cateConfig.ticketType.updateDate", field: "updateDate", width: "150px" },//Ngày cập nhật
      { i18n: "cateConfig.ticketType.updateUser", field: "updateUser", width: "130px" },//Người cập nhật
      { i18n: "search-bot.description", field: "description", width: "350" },
      { i18n: "cateConfig.ticket-genre.search.status", field: "status", width: "120px" }//Trạng thái

    ];

    this.displayedColumnsType = this.columns.map(x => x.field);
    this.buildForm();
    this.doSearch();
    this.filteredTicketLevelCate.next(this.lstLevelCateId.slice());
    this.dataChangeticketLevelCateFilter();
    this.mapData();
  }

  async mapData() {
    await this.getListTicketLevelCate();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketLevelCateCode: "",//Mã loại phản ánh
      ticketLevelCateName: "",//Tên loại phản ánh
      fromDate: "",//Từ ngày
      toDate: "",//Đến ngày
      inEffect: "", // Đang hiệu lực
      expire: "", // Hết hiệu lực
      createUser: "", //Người tạo
      startRecord: 0,
      ticketLevelCateFilter: "",
      pageSize: this.pageSizeList[0],
      status: ''
    });
  }

  doSearch(): any {
    this.isLoading = true;
    let dataParams = this.formSearch.getRawValue();
    dataParams["status"] = dataParams["status"] ? _.map(dataParams["status"], 'value').filter(x => x) : [];
    dataParams["lstLevelCateId"] = dataParams["ticketLevelCateName"] ? _.map(dataParams["ticketLevelCateName"], "value") : [];

    this.ticketLevelCateService.doSearch(dataParams).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstDataTicketLevelCate = rs.data.listData;
        this.countTableTicketLevelCate = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      }
    );

  }

  // Click chuyển trang
  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    if (this.formSearch.controls.startRecord.value != this.pageIndex) {
      this.formSearch.controls.startRecord.setValue(this.pageIndex);
      this.formSearch.controls.pageSize.setValue(event.pageSize);
      this.doSearch();
    } else {
      this.formSearch.controls.startRecord.setValue(this.pageIndex);
      this.formSearch.controls.pageSize.setValue(event.pageSize);
      this.doSearch();
    }
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startRecord.setValue(0);
    this.doSearch();
  }

  onClickInsertRow() {
    const dialog = this.dialog.open({
      width: "1200px",
      height: "auto",
      disableClose: true
    }, TicketLevelCateUpdateComponent);
    dialog.afterClosed().subscribe(_res => {
      this.btnClearToggleAll();
      this.formSearch.get('ticketLevelCateName').setValue("");
      this.getListTicketLevelCate();
      this.doSearch();
    });
  }

  doChangeStatus(item: any) {
    if (item != null) {
      if (item.status == 0) {
        this.messageConfirm = this.translateService.instant("cateConfig.ticketType.expireToEffect");
      }
      if (item.status == 1) {
        this.messageConfirm = this.translateService.instant("cateConfig.ticketType.effectToExpire");
      }
      const dialogData = new ConfirmDialogModel(this.translateService.instant("cateConfig.ticketType.changeStatus"), this.messageConfirm);
      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData
      });
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this.isLoading = true;
          let params: Object = {
            ticketLevelCateId: item.ticketLevelCateId,
            status: item.status
          };
          this.ticketLevelCateService.changeStatus(params).subscribe(rs => {
            this.isLoading = false;
            if (rs) {
              this.toars.success(this.translateService.instant("Đổi trạng thái thành công"));
              this.doSearch();
            }
          }, () => {
            this.isLoading = false;
            this.toars.error(this.translateService.instant("common.500Error"));
          });
        }
      });
    }
  }

  // Click Tất cả trạng thái
  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.formSearch.controls.status.setValue([...this.statuses, -1]);
    } else {
      this.formSearch.controls.status.setValue("");
    }
  }

  // Click 1 trạng thái
  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.formSearch.controls.status.value?.length == 0) {
      this.formSearch.get('status').setValue("");
    }
    if (this.formSearch.controls.status.value.length == this.statuses.length) {
      this.allStatus.select();
    }
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(", ");
    }
    return "";
  }

  selectAll(event) {
    this.filteredTicketLevelCate.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.isCheckedToggleAll = true;
          this.formSearch.controls.ticketLevelCateName.patchValue(val);
        } else {
          this.formSearch.controls.ticketLevelCateName.patchValue([]);
        }
      });
  }

  filterTicketLevelCate() {
    if (!this.lstLevelCateId) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("ticketLevelCateFilter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketLevelCate.next(this.lstLevelCateId.slice());
      if (this.formSearch.controls.ticketLevelCateName.value?.length == this.lstLevelCateId.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isCheckedToggleAll = true;
      } else {
        this.isCheckedToggleAll = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketLevelCate.next(
        this.lstLevelCateId.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.isCheckedToggleAll === true) {
        this.isCheckedToggleAll = true;
      } else {
        this.isCheckedToggleAll = false;
      }
    }

  }

  dataChangeticketLevelCateFilter() {
    this.formSearch.get("ticketLevelCateFilter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketLevelCate();
    });
  }

  getListTicketLevelCate() {
    let params: object = {
      search: this.search
    };
    this.ticketLevelCateService.getTicketLevelCateById(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstLevelCateId = data.map(val => ({ value: val.ticketLevelCateId, label: val.ticketLevelCateName }));
      this.filterTicketLevelCate();
    });
  }

  btnClearToggleAll() {
    this.isCheckedToggleAll = false;
  }

  onChangeLevel() {
    let search = this.formSearch.get("ticketLevelCateFilter").value;
    if (this.formSearch.controls.ticketLevelCateName.value?.length == this.lstLevelCateId.length) {
      this.isCheckedToggleAll = true;
    } else if (this.formSearch.controls.ticketLevelCateName.value?.length == this.lstLevelCateId.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isCheckedToggleAll = true;
    } else if (this.formSearch.controls.ticketLevelCateName.value?.length == 0) {
      this.formSearch.get('ticketLevelCateName').setValue('');
    } else {
      this.isCheckedToggleAll = false;
    }
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

import {
  NgxMatDateAdapter,
  NgxMatDateFormats, NGX_MAT_DATE_FORMATS
} from "@angular-material-components/datetime-picker";
import { SelectionModel } from "@angular/cdk/collections";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatOption } from "@angular/material/core";
import { ImportFileStatisticComponent } from "@app/routes/cate-config/ticket-reflective-statistics/import-file-statistic/import-file-statistic.component";
import { StatisticsCreateComponent } from "@app/routes/cate-config/ticket-reflective-statistics/statistics-create/statistics-create.component";
import { CustomDateAdapter } from "@app/routes/special-vehicle-management/custom-date";
import { BaseComponent } from "@app/shared/components/base-component/base-component.component";
import { RESOURCE } from "@core";
import { TicketCateStatisticService } from "@core/services/cate-config/ticket-cate-statistic.service";
import { MtxDialog } from "@ng-matero/extensions";
import { TranslateService } from "@ngx-translate/core";
import { GROUP_REFLECTS_STATUS, HTTP_CODE, LEVEL_STATISTICS_TYPE } from "@shared";
import { ConfirmDialogComponent, ConfirmDialogModel } from "@shared/components/confirm-dialog/confirm-dialog.component";
import { saveAs } from "file-saver";
import _ from "lodash";
import { ToastrService } from "ngx-toastr";
import { ReplaySubject, Subject } from "rxjs";
import { take } from "rxjs/internal/operators/take";
import { takeUntil } from "rxjs/operators";

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
  selector: "app-ticket-reflection-statistics",
  templateUrl: "./ticket-reflective-statistics.component.html",
  styleUrls: ["./ticket-reflective-statistics.component.scss"],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter }
  ]
})
export class TicketReflectiveStatisticsComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild("allStatus") private allStatus: MatOption;
  @ViewChild("ticketCateStatisticNameLv1s") private ticketCateStatisticNameLv1s: MatOption;
  @ViewChild("ticketCateStatisticNameLv2s") private ticketCateStatisticNameLv2s: MatOption;
  @ViewChild("ticketCateStatisticNameLv3s") private ticketCateStatisticNameLv3s: MatOption;
  @ViewChild("ticketCateStatisticNameLv4s") private ticketCateStatisticNameLv4s: MatOption;
  @ViewChild("ticketCateStatisticNameLv5s") private ticketCateStatisticNameLv5s: MatOption;
  @ViewChild("levelStatistic") private levelStatistic: MatOption;
  formSearch: FormGroup;
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
  displayedColumnsTypeStatistic: any = [];
  selection = new SelectionModel<any>(true, []);
  lstDataTicketCateStatistic: any = [];
  countTableTicketCateStatistic = 0;
  checkAll: any = false;
  isCheckedLv1: boolean = false;
  isCheckedLv2: boolean = false;
  isCheckedLv3: boolean = false;
  isCheckedLv4: boolean = false;
  isCheckedLv5: boolean = false;
  onDestroy = new Subject<void>();
  search: any = 0;
  messageConfirm: any;


  lstLevelStatistics: any = [
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_1,
      label: this.translateService.instant("ticket-statistic.statistic-lv1")
    },
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_2,
      label: this.translateService.instant("ticket-statistic.statistic-lv2")
    },
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_3,
      label: this.translateService.instant("ticket-statistic.statistic-lv3")
    },
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_4,
      label: this.translateService.instant("ticket-statistic.statistic-lv4")
    },
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_5,
      label: this.translateService.instant("ticket-statistic.statistic-lv5")
    }
  ];

  lstCateStatisticsLv1: any = [];
  lstCateStatisticsLv2: any = [];
  lstCateStatisticsLv3: any = [];
  lstCateStatisticsLv4: any = [];
  lstCateStatisticsLv5: any = [];

  filteredTicketStatisticLv1: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketStatisticLv2: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketStatisticLv3: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketStatisticLv4: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketStatisticLv5: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketCateStatisticService: TicketCateStatisticService,
    private fb: FormBuilder,
    public dialog?: MtxDialog
  ) {
    super(ticketCateStatisticService, RESOURCE.CC_CATE_CONFIG, toars, translateService);
    this.buildForm();
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
      { i18n: "common.orderNumber", field: "orderNumber", width: "40px" },
      { i18n: "", field: "select", width: "30px" },
      { i18n: "common.action", field: "action", width: "150px" },
      {
        i18n: "ticketReflectiveStatistics.table.statisticParentTypeName",
        field: "cateStatisticNameParent",
        width: "500px"
      },
      { i18n: "ticketReflectiveStatistics.table.statisticLevel", field: "levelStatistic", width: "100px" },
      { i18n: "ticketReflectiveStatistics.table.statisticsCode", field: "ticketCateStatisticsCode", width: "150px" },
      { i18n: "ticketReflectiveStatistics.table.statisticsName", field: "ticketCateStatisticsName", width: "300px" },
      { i18n: "ticketReflectiveStatistics.table.createDate", field: "createDate", width: "150px" },
      { i18n: "ticketReflectiveStatistics.table.createUser", field: "createUser", width: "130px" },
      { i18n: "ticketReflectiveStatistics.table.updateDate", field: "updateDate", width: "150px" },
      { i18n: "ticketReflectiveStatistics.table.updateUser", field: "updateUser", width: "130px" },
      { i18n: "cateConfig.ticketType.ticketTemplate", field: "template", width: "400px" },
      { i18n: "ticketReflectiveStatistics.table.status", field: "status", width: "120px" }
    ];
    this.displayedColumnsTypeStatistic = this.columns.map(x => x.field);
    this.buildForm();
    this.doSearch();
    this.mapData();
    this.dataChangeStatisticLv1Filter();

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  async mapData() {
    await this.getLstTicketStatisticLvOne();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketCateStatisticLv1Filter: "", //Filter thống kê cấp 1
      ticketCateStatisticLv2Filter: "", //Filter thống kê cấp 2
      ticketCateStatisticLv3Filter: "", //Filter thống kê cấp 3
      ticketCateStatisticLv4Filter: "", //Filter thống kê cấp 4
      ticketCateStatisticLv5Filter: "", //Filter thống kê cấp 5
      ticketCateStatisticNameLv1: "", //thống kê cấp 1
      ticketCateStatisticNameLv2: "", //thống kê cấp 2
      ticketCateStatisticNameLv3: "", //thống kê cấp 3
      ticketCateStatisticNameLv4: "", //thống kê cấp 4
      ticketCateStatisticNameLv5: "", //thống kê cấp 5
      cateStatisticNameParent: "",
      levelStatistic: "", // Cấp nguyên nhân lỗi
      fromDate: "",//Từ ngày
      toDate: "",//Đến ngày
      inEffect: "", // Đang hiệu lực
      expire: "", // Hết hiệu lực
      createUser: "", //Người tạo
      startRecord: 0,
      pageSize: this.pageSizeList[0],
      status: ''
    });
  }

  doSearch(): any {
    this.isLoading = true;
    let params = this.formSearch.getRawValue();
    params["lstCateStatisticsLv1"] = params["ticketCateStatisticNameLv1"] ? _.map(params["ticketCateStatisticNameLv1"], "value") : [];
    ;
    params["lstCateStatisticsLv2"] = params["ticketCateStatisticNameLv2"] ? _.map(params["ticketCateStatisticNameLv2"], "value") : [];
    params["lstCateStatisticsLv3"] = params["ticketCateStatisticNameLv3"] ? _.map(params["ticketCateStatisticNameLv3"], "value") : [];
    params["lstCateStatisticsLv4"] = params["ticketCateStatisticNameLv4"] ? _.map(params["ticketCateStatisticNameLv4"], "value") : [];
    params["lstCateStatisticsLv5"] = params["ticketCateStatisticNameLv5"] ? _.map(params["ticketCateStatisticNameLv5"], "value") : [];
    ;
    params["lstLevelStatistics"] = params["levelStatistic"] ? _.map(params["levelStatistic"], "value").filter(x => x) : [];
    ;
    // let status = [];
    // if (params["inEffect"]) status.push(1);
    // if (params["expire"]) status.push(0);
    // params["status"] = status;
    params["status"] = params["status"] ? _.map(params["status"], "value").filter(x => x) : [];
    ;

    this.checkAll = false;
    this.selection.clear();
    this.ticketCateStatisticService.doSearch(params).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstDataTicketCateStatistic = rs.data.listData;
        this.countTableTicketCateStatistic = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      }
    );

  }

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

  onClickEditCateStatistic(data: any): any {
    let dataParams: object = {
      title: "CHỈNH SỬA THỐNG KÊ",
      data: data
    };
    const dialog = this.dialog.open({
      width: "1200px",
      data: dataParams,
      disableClose: true
    }, StatisticsCreateComponent);

    dialog.afterClosed().subscribe(res => {
      this.getLstTicketStatisticLvOne();
      this.doSearch();
    });
  }

  onClickInsertCateStatistic() {
    let dataParams: object = {
      title: "THÔNG TIN THÊM MỚI THỐNG KÊ"
    };
    const dialog = this.dialog.open({
      width: "1200px",
      data: dataParams,
      disableClose: true
    }, StatisticsCreateComponent);

    dialog.afterClosed().subscribe(res => {
      this.btnClearLv1();
      this.getLstTicketStatisticLvOne();
      this.doSearch();
    });
  }


  onCheckAll(ob: MatCheckboxChange) {
    if (ob && ob.checked === true) {
      this.lstDataTicketCateStatistic.forEach((obj: any) => {
        obj["checked"] = true;
      });
    } else {
      this.checkAll = false;
      this.lstDataTicketCateStatistic.forEach((obj: any) => {
        obj["checked"] = false;
      });
    }
  }

  onCheckItem(_ob: MatCheckboxChange) {
    let itemCheck = _.filter(this.lstDataTicketCateStatistic, (obj: any) => {
      return obj["checked"] === true;
    });
    if (itemCheck && itemCheck.length === this.lstDataTicketCateStatistic.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.lstDataTicketCateStatistic.forEach(row => {
        row.selected = false;
      });
    } else {
      this.lstDataTicketCateStatistic.forEach(row => {
        this.selection.select(row);
        row.selected = true;
      });
    }
  }

  checkChange(row) {
    this.selection.toggle(row);
    row.selected = !this.selection.isSelected(row) ? false : true;
  }

  onChangeStatus() {
    this.doSearch();
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }

  onChangeLevelStatisticAll() {
    if (this.levelStatistic.selected) {
      this.formSearch.controls.levelStatistic.setValue([...this.lstLevelStatistics, -1]);
    } else {
      this.formSearch.controls.levelStatistic.setValue("");
    }
  }

  onChangeLevelStatistic() {
    if (this.levelStatistic.selected) {
      this.levelStatistic.deselect();
    } else if (this.formSearch.controls.levelStatistic.value?.length == 0) {
      this.formSearch.get('levelStatistic').setValue("");
    }
    if (this.formSearch.controls.levelStatistic.value.length == this.lstLevelStatistics.length) {
      this.levelStatistic.select();
    }
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(",");
    }
    return "";
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
            statisticTypeId: item.statisticTypeId,
            status: item.status
          };
          this.ticketCateStatisticService.changeStatusTicketCateStatistic(params).subscribe(rs => {
            this.isLoading = false;
            this.selection.clear();
            if (rs) {
              this.toars.success(this.translateService.instant("cateConfig.ticketType.changeSuccess"));
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

  dataChangeStatisticLv1Filter() {
    this.formSearch.get("ticketCateStatisticLv1Filter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterStatisticLevelOne();
    });
  }

  dataChangeStatisticLv2Filter() {
    this.formSearch.get("ticketCateStatisticLv2Filter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterStatisticLevelTwo();
    });
  }

  dataChangeStatisticLv3Filter() {
    this.formSearch.get("ticketCateStatisticLv3Filter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterStatisticLevelThree();
    });
  }

  dataChangeStatisticLv4Filter() {
    this.formSearch.get("ticketCateStatisticLv4Filter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterStatisticLevelFour();
    });
  }

  dataChangeStatisticLv5Filter() {
    this.formSearch.get("ticketCateStatisticLv5Filter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterStatisticLevelFive();
    });
  }

  filterStatisticLevelOne() {
    if (!this.lstCateStatisticsLv1) {
      return;
    }

    // get the search keyword
    let search = this.formSearch.get("ticketCateStatisticLv1Filter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketStatisticLv1.next(this.lstCateStatisticsLv1.slice());
      if (this.formSearch.controls.ticketCateStatisticNameLv1.value?.length == this.lstCateStatisticsLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isCheckedLv1 = true;
      } else {
        this.isCheckedLv1 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketStatisticLv1.next(
        this.lstCateStatisticsLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.isCheckedLv1 == true) {
        this.isCheckedLv1 = true;
      } else {
        this.isCheckedLv1 = false;
      }
    }
  }


  filterStatisticLevelTwo() {
    if (!this.lstCateStatisticsLv2) {
      return;
    }

    // get the search keyword
    let search = this.formSearch.get("ticketCateStatisticLv2Filter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketStatisticLv2.next(this.lstCateStatisticsLv2.slice());
      if (this.formSearch.controls.ticketCateStatisticNameLv2.value?.length == this.lstCateStatisticsLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isCheckedLv2 = true;
      } else {
        this.isCheckedLv2 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketStatisticLv2.next(
        this.lstCateStatisticsLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.isCheckedLv2 == true) {
        this.isCheckedLv2 = true;
      } else {
        this.isCheckedLv2 = false;
      }
    }
  }

  filterStatisticLevelThree() {
    if (!this.lstCateStatisticsLv3) {
      return;
    }

    // get the search keyword
    let search = this.formSearch.get("ticketCateStatisticLv3Filter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketStatisticLv3.next(this.lstCateStatisticsLv3.slice());
      if (this.formSearch.controls.ticketCateStatisticNameLv3.value?.length == this.lstCateStatisticsLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isCheckedLv3 = true;
      } else {
        this.isCheckedLv3 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketStatisticLv3.next(
        this.lstCateStatisticsLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.isCheckedLv3 == true) {
        this.isCheckedLv3 = true;
      } else {
        this.isCheckedLv3 = false;
      }
    }
  }

  filterStatisticLevelFour() {
    if (!this.lstCateStatisticsLv4) {
      return;
    }

    // get the search keyword
    let search = this.formSearch.get("ticketCateStatisticLv4Filter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketStatisticLv4.next(this.lstCateStatisticsLv4.slice());
      if (this.formSearch.controls.ticketCateStatisticNameLv4.value?.length == this.lstCateStatisticsLv4.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isCheckedLv4 = true;
      } else {
        this.isCheckedLv4 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketStatisticLv4.next(
        this.lstCateStatisticsLv4.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.isCheckedLv4 == true) {
        this.isCheckedLv4 = true;
      } else {
        this.isCheckedLv4 = false;
      }
    }
  }

  filterStatisticLevelFive() {
    if (!this.lstCateStatisticsLv4) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("ticketCateStatisticLv5Filter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketStatisticLv5.next(this.lstCateStatisticsLv5.slice());
      if (this.formSearch.controls.ticketCateStatisticNameLv5.value?.length == this.lstCateStatisticsLv5.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isCheckedLv5 = true;
      } else {
        this.isCheckedLv5 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketStatisticLv5.next(
        this.lstCateStatisticsLv5.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.isCheckedLv5 == true) {
        this.isCheckedLv5 = true;
      } else {
        this.isCheckedLv5 = false;
      }
    }
  }

  selectAll(event) {
    this.isCheckedLv1 = false;
    this.filteredTicketStatisticLv1.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.isCheckedLv1 = true;
          this.formSearch.controls.ticketCateStatisticNameLv1.patchValue(val);
          this.handleChangeStatisticTwo();
          this.handleChangeStatisticLvThree();
          this.handleChangeStatisticLvFour();
          this.handleChangeStatisticLvFive();
        } else {
          this.btnClearLv1();
        }
      });
  }

  selectAllTicketStatisticLv2(event) {
    this.isCheckedLv2 = false;
    let search = this.formSearch.get("ticketCateStatisticLv2Filter").value;
    this.filteredTicketStatisticLv2.next(
      this.lstCateStatisticsLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstCateStatisticsLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isCheckedLv2 = true;
      this.formSearch.controls.ticketCateStatisticNameLv2.patchValue(val);
      this.handleChangeStatisticLvThree();
      this.handleChangeStatisticLvFour();
      this.handleChangeStatisticLvFive();
    } else {
      this.btnClearLv2();
    }
  }

  selectAllTicketStatisticLv3(event) {
    this.isCheckedLv3 = false;
    let search = this.formSearch.get("ticketCateStatisticLv3Filter").value;
    this.filteredTicketStatisticLv3.next(
      this.lstCateStatisticsLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstCateStatisticsLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isCheckedLv3 = true;
      this.formSearch.controls.ticketCateStatisticNameLv3.patchValue(val);
      this.handleChangeStatisticLvFour();
      this.handleChangeStatisticLvFive();
    } else {
      this.btnClearLv3();
    }
  }

  selectAllTicketStatisticLv4(event) {
    this.isCheckedLv4 = false;
    let search = this.formSearch.get("ticketCateStatisticLv4Filter").value;
    this.filteredTicketStatisticLv4.next(
      this.lstCateStatisticsLv4.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstCateStatisticsLv4.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isCheckedLv4 = true;
      this.formSearch.controls.ticketCateStatisticNameLv4.patchValue(val);
      this.handleChangeStatisticLvFive();
    } else {
      this.btnClearLv4();
    }
  }

  selectAllTicketStatisticLv5(event) {
    this.isCheckedLv5 = false;
    let search = this.formSearch.get("ticketCateStatisticLv5Filter").value;
    this.filteredTicketStatisticLv5.next(
      this.lstCateStatisticsLv5.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstCateStatisticsLv5.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isCheckedLv5 = true;
      this.formSearch.controls.ticketCateStatisticNameLv5.patchValue(val);
    } else {
      this.btnClearLv4();
    }
  }

  getLstTicketStatisticLvOne() {
    let params: object = {
      search: this.search,
    };
    this.isLoading = true;
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstCateStatisticsLv1 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
      this.filterStatisticLevelOne();
      this.filteredTicketStatisticLv2.next(this.lstCateStatisticsLv2.slice());
      this.dataChangeStatisticLv2Filter();
    });
  }

  onChangeTicketCateStatisticLv1() {
    let search = this.formSearch.get("ticketCateStatisticLv1Filter").value;

    if (this.formSearch.controls.ticketCateStatisticNameLv1.value?.length == this.lstCateStatisticsLv1.length) {
      this.isCheckedLv1 = true;
      this.handleChangeStatisticTwo();
    } else if (this.formSearch.controls.ticketCateStatisticNameLv1.value?.length == 0) {
      this.formSearch.get('ticketCateStatisticLv1Filter').setValue('');
      this.isCheckedLv1 = false;
    } else if (this.formSearch.controls.ticketCateStatisticNameLv1.value?.length == this.lstCateStatisticsLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isCheckedLv1 = true;
      this.handleChangeStatisticTwo();
    } else {
      this.isCheckedLv1 = false;
      this.isCheckedLv2 = false;
      this.isCheckedLv3 = false;
      this.isCheckedLv4 = false;
      this.isCheckedLv5 = false;

      this.handleChangeStatisticTwo();
      this.formSearch.get('ticketCateStatisticNameLv2').setValue('');
      this.formSearch.get('ticketCateStatisticNameLv3').setValue('');
      this.formSearch.get('ticketCateStatisticNameLv4').setValue('');
      this.formSearch.get('ticketCateStatisticNameLv5').setValue('');

      this.lstCateStatisticsLv2 = [];
      this.lstCateStatisticsLv3 = [];
      this.lstCateStatisticsLv4 = [];
      this.lstCateStatisticsLv5 = [];

      this.filteredTicketStatisticLv2 = new ReplaySubject;
      this.filteredTicketStatisticLv3 = new ReplaySubject;
      this.filteredTicketStatisticLv4 = new ReplaySubject;
      this.filteredTicketStatisticLv5 = new ReplaySubject;
    }

  }

  handleChangeStatisticTwo() {
    this.formSearch.controls.ticketCateStatisticNameLv2.setValue(null);
    this.lstCateStatisticsLv2 = [];
    if (this.formSearch.controls.ticketCateStatisticNameLv1.value?.length > 0) {
      this.getListTicketStatisticLvTwo(this.formSearch.controls.ticketCateStatisticNameLv1.value.filter(item => item !== -1));
    }
  }

  getListTicketStatisticLvTwo(parentId) {
    let lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
    };
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstCateStatisticsLv2 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
      this.filteredTicketStatisticLv2.next(this.lstCateStatisticsLv2.slice());
      this.filterStatisticLevelTwo();
      this.filteredTicketStatisticLv3.next(this.lstCateStatisticsLv3.slice());
      this.dataChangeStatisticLv3Filter();
    });
  }

  onChangeTicketCateStatisticLv2() {
    let search = this.formSearch.get("ticketCateStatisticLv2Filter").value;

    if (this.formSearch.controls.ticketCateStatisticNameLv2.value?.length == this.lstCateStatisticsLv2.length) {
      this.isCheckedLv2 = true;
      this.handleChangeStatisticLvThree();
    } else if (this.formSearch.controls.ticketCateStatisticNameLv2.value?.length == 0) {
      this.formSearch.get('ticketCateStatisticNameLv2').setValue("");
      this.isCheckedLv2 = false;
    } else if (this.formSearch.controls.ticketCateStatisticNameLv2.value?.length == this.lstCateStatisticsLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isCheckedLv2 = true;
      this.handleChangeStatisticLvThree();
    } else {
      this.isCheckedLv2 = false;
      this.isCheckedLv3 = false;
      this.isCheckedLv4 = false;
      this.isCheckedLv5 = false;

      this.handleChangeStatisticLvThree();
      this.formSearch.get('ticketCateStatisticNameLv3').setValue('');
      this.formSearch.get('ticketCateStatisticNameLv4').setValue('');
      this.formSearch.get('ticketCateStatisticNameLv5').setValue('');

      this.lstCateStatisticsLv3 = [];
      this.lstCateStatisticsLv4 = [];
      this.lstCateStatisticsLv5 = [];

      this.filteredTicketStatisticLv3 = new ReplaySubject;
      this.filteredTicketStatisticLv4 = new ReplaySubject;
      this.filteredTicketStatisticLv5 = new ReplaySubject;
    }
  }

  handleChangeStatisticLvThree() {
    this.formSearch.controls.ticketCateStatisticNameLv3.setValue(null);
    this.lstCateStatisticsLv3 = [];
    if (this.formSearch.controls.ticketCateStatisticNameLv2.value?.length > 0) {
      this.getListTicketStatisticLvThree(this.formSearch.controls.ticketCateStatisticNameLv2.value.filter(item => item !== -1));
    }
  }

  getListTicketStatisticLvThree(parentId) {
    let lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
    };
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstCateStatisticsLv3 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
      // if (!AppStorage.get("list-ticket-statistic-lvthree")) {
      //   AppStorage.set("list-ticket-statistic-lvthree", this.lstCateStatisticsLv3);
      // }
      this.filteredTicketStatisticLv3.next(this.lstCateStatisticsLv3.slice());
      this.filterStatisticLevelThree();
      this.filteredTicketStatisticLv4.next(this.lstCateStatisticsLv4.slice());
      this.dataChangeStatisticLv4Filter();
    });
  }

  onChangeTicketCateStatisticLv3() {
    let search = this.formSearch.get("ticketCateStatisticLv3Filter").value;

    if (this.formSearch.controls.ticketCateStatisticNameLv3.value?.length == this.lstCateStatisticsLv3.length) {
      this.isCheckedLv3 = true;
      this.handleChangeStatisticLvFour();
    } else if (this.formSearch.controls.ticketCateStatisticNameLv3.value?.length == 0) {
      this.formSearch.get('ticketCateStatisticNameLv3').setValue("");
    } else if (this.formSearch.controls.ticketCateStatisticNameLv3.value?.length == this.lstCateStatisticsLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isCheckedLv3 = true;
      this.handleChangeStatisticLvFour();
    } else {
      this.isCheckedLv3 = false;
      this.isCheckedLv4 = false;
      this.isCheckedLv5 = false;

      this.handleChangeStatisticLvFour();
      this.formSearch.get('ticketCateStatisticNameLv4').setValue('');
      this.formSearch.get('ticketCateStatisticNameLv5').setValue('');

      this.lstCateStatisticsLv4 = [];
      this.lstCateStatisticsLv5 = [];

      this.filteredTicketStatisticLv4 = new ReplaySubject;
      this.filteredTicketStatisticLv5 = new ReplaySubject;
    }
  }

  handleChangeStatisticLvFour() {
    this.formSearch.controls.ticketCateStatisticNameLv4.setValue(null);
    this.lstCateStatisticsLv4 = [];
    if (this.formSearch.controls.ticketCateStatisticNameLv3.value?.length > 0) {
      this.getListTicketStatisticLvfour(this.formSearch.controls.ticketCateStatisticNameLv3.value.filter(item => item !== -1));
    }
  }

  getListTicketStatisticLvfour(parentId) {
    let lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
    };
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstCateStatisticsLv4 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
      this.filteredTicketStatisticLv4.next(this.lstCateStatisticsLv4.slice());
      this.filterStatisticLevelFour();
      this.filteredTicketStatisticLv5.next(this.lstCateStatisticsLv5.slice());
      this.dataChangeStatisticLv5Filter();
    });
  }

  onChangeTicketCateStatisticLv4() {
    let search = this.formSearch.get("ticketCateStatisticLv4Filter").value;

    if (this.formSearch.controls.ticketCateStatisticNameLv4.value?.length == this.lstCateStatisticsLv4.length) {
      this.isCheckedLv4 = true;
      this.handleChangeStatisticLvFive();
    } else if (this.formSearch.controls.ticketCateStatisticNameLv4.value?.length == 0) {
      this.formSearch.get('ticketCateStatisticNameLv4').setValue("");
    } else if (this.formSearch.controls.ticketCateStatisticNameLv4.value?.length == this.lstCateStatisticsLv4.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isCheckedLv4 = true;
      this.handleChangeStatisticLvFive();
    } else {
      this.isCheckedLv4 = false;
      this.isCheckedLv5 = false;

      this.handleChangeStatisticLvFive();
      this.formSearch.get('ticketCateStatisticNameLv5').setValue('');

      this.lstCateStatisticsLv5 = [];

      this.filteredTicketStatisticLv5 = new ReplaySubject;
    }
  }

  onChangeTicketCateStatisticLv5() {
    let search = this.formSearch.get("ticketCateStatisticLv5Filter").value;

    if (this.formSearch.controls.ticketCateStatisticNameLv5.value?.length == this.lstCateStatisticsLv5.length) {
      this.isCheckedLv5 = true;
    } if (this.formSearch.controls.ticketCateStatisticNameLv5.value?.length == 0) {
      this.formSearch.get('ticketCateStatisticNameLv5').setValue("");
    } else if (this.formSearch.controls.ticketCateStatisticNameLv5.value?.length == this.lstCateStatisticsLv5.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isCheckedLv5 = true;
    } else {
      this.isCheckedLv5 = false;
    }
  }

  handleChangeStatisticLvFive() {
    this.formSearch.controls.ticketCateStatisticNameLv5.setValue(null);
    this.lstCateStatisticsLv5 = [];
    if (this.formSearch.controls.ticketCateStatisticNameLv4.value?.length > 0) {
      this.getListTicketStatisticLvFive(this.formSearch.controls.ticketCateStatisticNameLv4.value.filter(item => item !== -1));
    }
  }

  getListTicketStatisticLvFive(parentId) {
    let lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
    };
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstCateStatisticsLv5 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
      this.filteredTicketStatisticLv5.next(this.lstCateStatisticsLv5.slice());
      this.dataChangeStatisticLv5Filter();
      this.filterStatisticLevelFive();
    });
  }

  onChangeStatusMultiple() {

    let dataCheck = _.filter(this.lstDataTicketCateStatistic, (obj: any) => {
      return obj["checked"] === true;
    });
    if (dataCheck && dataCheck.length > 0) {
      let lstIdsActive = _.filter(dataCheck, (obj: any) => {
        return obj["status"] === 1;
      });
      let lstIdsInactive = _.filter(dataCheck, (obj: any) => {
        return obj["status"] === 0;
      });
      if (lstIdsInactive.length > 0 && lstIdsActive.length > 0) {
        this.isLoading = false;
        this.toars.warning(this.translateService.instant("Phải chọn các bản ghi có cùng trạng thái", "Cảnh báo"));
        return;
      }

      if (dataCheck[0].status == 1) {
        this.messageConfirm = this.translateService.instant("cateConfig.ticketType.effectToExpire");
      }
      if (dataCheck[0].status == 0) {
        this.messageConfirm = this.translateService.instant("cateConfig.ticketType.expireToEffect");
      }
      const dialogData = new ConfirmDialogModel(this.translateService.instant("cateConfig.ticketType.changeStatus"), this.messageConfirm);
      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this.isLoading = true;
          let lstIdsActive = _.filter(dataCheck, (obj: any) => {
            return obj["status"] === 1;
          });
          let lstIdsInactive = _.filter(dataCheck, (obj: any) => {
            return obj["status"] === 0;
          });
          let params: object = {
            lstIdsActive: _.map(lstIdsActive, "statisticTypeId"),
            lstIdsInactive: _.map(lstIdsInactive, "statisticTypeId")
          };
          this.ticketCateStatisticService.approveChangeStatusTicketStatistic(params).subscribe(rs => {
            this.isLoading = false;
            this.selection.clear();
            if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
              this.toars.success(this.translateService.instant("cateConfig.ticketType.changeSuccess"));
              this.checkAll = false;
              this.doSearch();
            } else {
              this.toars.error(this.translateService.instant("cateConfig.ticketType.changeError"));
            }
          }, () => {
            this.isLoading = false;
            this.toars.error(this.translateService.instant("common.500Error"));
          });
        }
      });
    } else {
      this.toars.warning("Chọn ít nhất một bản ghi đổi trạng thái", "Cảnh báo");
    }
  }

  doDeleteStatistic(data: any) {
    const message = this.translateService.instant("ticketReflectiveStatistics.deleteStatistic") + ` : ${data.ticketCateStatisticsName}`;
    const dialogData = new ConfirmDialogModel(this.translateService.instant("buttonTitle.deleteStatistic"), message, this.translateService.instant("common.button.delete"));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: "700px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.isLoading = true;
        this.ticketCateStatisticService.onDeleteStatistic(data.statisticTypeId).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            this.toars.warning(this.translateService.instant("ticketReflectiveStatistics.deleteError"));
          } else {
            this.toars.success(this.translateService.instant("ticketReflectiveStatistics.deleteSuccess"));
            this.doSearch();
          }
        }, () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant("common.500Error"));
        });
      }
    });
  }

  importFile() {
    let dataParams: object = {
      title: "LỊCH SỬ IMPORT FILE"
    };
    const dialog = this.dialog.open({
      width: "1200px",
      data: dataParams,
      disableClose: true
    }, ImportFileStatisticComponent);

    dialog.afterClosed().subscribe(res => {
      this.doSearch();
    });
  }

  exportFile() {
    let params = this.formSearch.getRawValue();
    params["lstCateStatisticsLv1"] = params["ticketCateStatisticNameLv1"] ? _.map(params["ticketCateStatisticNameLv1"], "value") : [];
    ;
    params["lstCateStatisticsLv2"] = params["ticketCateStatisticNameLv2"] ? _.map(params["ticketCateStatisticNameLv2"], "value") : [];
    params["lstCateStatisticsLv3"] = params["ticketCateStatisticNameLv3"] ? _.map(params["ticketCateStatisticNameLv3"], "value") : [];
    params["lstCateStatisticsLv4"] = params["ticketCateStatisticNameLv4"] ? _.map(params["ticketCateStatisticNameLv4"], "value") : [];
    params["lstCateStatisticsLv5"] = params["ticketCateStatisticNameLv5"] ? _.map(params["ticketCateStatisticNameLv5"], "value") : [];
    ;
    params["lstLevelStatistics"] = params["levelStatistic"] ? _.map(params["levelStatistic"], "value").filter(x => x) : [];
    ;
    let status = [];
    if (params["inEffect"]) status.push(1);
    if (params["expire"]) status.push(0);
    params["status"] = status;
    // const search = { ...this.formSearch.value };
    this.ticketCateStatisticService.exportExcel(params)
      .subscribe(res => {
        const contentDisposition = res.headers.get("content-disposition");
        const filename = contentDisposition.split(";")[1].split("filename")[1].split("=")[1].trim();
        saveAs(res.body, filename);
      });
  }

  btnClearLv1() {
    this.btnClearLv2();
    this.isCheckedLv1 = false;
    this.formSearch.get('ticketCateStatisticNameLv1').setValue('');
    this.filteredTicketStatisticLv2 = new ReplaySubject;
    this.lstCateStatisticsLv2 = [];
  }

  btnClearLv2() {
    this.btnClearLv3();
    this.isCheckedLv2 = false;
    this.formSearch.get('ticketCateStatisticNameLv2').setValue('');
    this.filteredTicketStatisticLv3 = new ReplaySubject;
    this.lstCateStatisticsLv3 = [];
  }

  btnClearLv3() {
    this.btnClearLv4();
    this.isCheckedLv3 = false;
    this.formSearch.get('ticketCateStatisticNameLv3').setValue('');
    this.filteredTicketStatisticLv4 = new ReplaySubject;
    this.lstCateStatisticsLv4 = [];
  }

  btnClearLv4() {
    this.btnClearLv5()
    this.isCheckedLv4 = false;
    this.formSearch.get('ticketCateStatisticNameLv4').setValue('');
    this.filteredTicketStatisticLv5 = new ReplaySubject;
    this.lstCateStatisticsLv5 = [];
  }

  btnClearLv5() {
    this.isCheckedLv5 = false;
    this.formSearch.get('ticketCateStatisticNameLv5').setValue('');
  }

  getHeightTable(source) {
    if (source) {
      if (source.length >= 10) {
        return '55vh';
      } else {
        return 'fit-content';
      }
    }
  }
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
    } else if (this.formSearch.controls.status.value?.length == 0) {
      this.formSearch.get('status').setValue("");
    }
    if (this.formSearch.controls.status.value.length == this.statuses.length) {
      this.allStatus.select();
    }
  }
}

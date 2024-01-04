import {
  NgxMatDateAdapter,
  NgxMatDateFormats, NGX_MAT_DATE_FORMATS
} from "@angular-material-components/datetime-picker";
import { SelectionModel } from "@angular/cdk/collections";
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatOption } from "@angular/material/core";
import { MatTableDataSource } from "@angular/material/table";
import { TicketExpireCauseService } from "@app/core/services/expire-cause/ticket-expire-cause.service";
import { TicketExpireCauseCreateComponent } from "@app/routes/cate-config/ticket-expire-cause/ticket-expire-cause-create/ticket-expire-cause-create.component";
import { CustomDateAdapter } from "@app/routes/special-vehicle-management/custom-date";
import {
  ConfirmDialogComponent,
  ConfirmDialogModel
} from "@app/shared/components/confirm-dialog/confirm-dialog.component";
import { RESOURCE } from "@core";
import { MtxDialog } from "@ng-matero/extensions";
import { TranslateService } from "@ngx-translate/core";
import { GROUP_REFLECTS_STATUS, HTTP_CODE, STATUS_TICKET_TYPE, TICKET_EXPIRE_CAUSE_LEVEL_SEARCH } from "@shared";
import { BaseComponent } from "@shared/components/base-component/base-component.component";
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
  selector: "app-ticket-expire-cause",
  templateUrl: "./ticket-expire-cause.component.html",
  styleUrls: ["./ticket-expire-cause.component.scss"],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter }
  ]
})
export class TicketExpireCauseComponent extends BaseComponent implements OnInit {
  @ViewChild("ticketExpireLevelOnes") private ticketExpireLevelOnes: MatOption;
  @ViewChild("ticketExpireLevelTwos") private ticketExpireLevelTwos: MatOption;
  @ViewChild("ticketExpireLevelThrees") private ticketExpireLevelThrees: MatOption;
  @ViewChild("levelExpire") private levelExpire: MatOption;
  @ViewChild("allStatus") private allStatus: MatOption;
  @ViewChild("status") private status: MatOption;

  @Input() isLoading: boolean;
  @Input() pageIndex: number;
  formSearch!: FormGroup;
  titleTab;
  isEdit;
  canEdit: true;
  checkAll: any = false;
  countTableExpireCause = 0;
  listDataExpireCause: any = [];

  filteredExpireLevelOne: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredExpireLevelTwo: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredExpireLevelThree: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();

  activeStatus: number = -1;
  lstType: any = [];
  displayedColumnsType: any = [];
  lstExpireLvOne: any = [];
  lstExpireLvTwo: any = [];
  lstExpireLvThree: any = [];
  pageSizeList = [10, 50, 100];
  selection = new SelectionModel<any>(true, []);
  statusTicketType = STATUS_TICKET_TYPE;
  dataSource = new MatTableDataSource<any>();
  expireName: string;
  search: any = 0;

  searchEp1All: boolean = false;
  searchEp2All: boolean = false;
  searchEp3All: boolean = false;
  messageConfirm: any;

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

  lstLevelExpire = [
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL_SEARCH.CAP_1,
      label: this.translateService.instant("ticketExpire.table.ExpireLv1")
    },
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL_SEARCH.CAP_2,
      label: this.translateService.instant("ticketExpire.table.ExpireLv2")
    },
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL_SEARCH.CAP_3,
      label: this.translateService.instant("ticketExpire.table.ExpireLv3")
    }
  ];

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketExpireCauseService: TicketExpireCauseService,
    private fb: FormBuilder,
    public dialog?: MtxDialog
  ) {
    super(ticketExpireCauseService, RESOURCE.CC_EXPIRE_CAUSE, toars, translateService);
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  ngOnInit(): void {
    this.buildColumn();
    this.buildForm();
    this.doSearch();
    this.mapData();
    this.filteredExpireLevelOne.next(this.lstExpireLvOne.slice());
    this.dataChangeExpireLv1Filter();
  }

  async mapData() {
    await this.getLstExpireLvOne();
  }

  customViewDescription(strView: string): string {
    if (strView && strView.length > 65) return strView.substring(0, 65) + " ...";
    else return strView;
  }

  customViewName(strView: string): string {
    if (strView && strView.length > 50) return strView.substring(0, 50) + " ...";
    else return strView;
  }

  buildColumn() {
    this.columns = [
      { i18n: "common.orderNumber", field: "orderNumber", width: "40px" },
      { i18n: "", field: "select", width: "30px" },
      { i18n: "common.action", field: "action", width: "80px" },
      { i18n: "ticketExpire.table.ExpiraCause", field: "expireLv1", width: "410px" },
      { i18n: "ticketExpire.table.levelExpire", field: "levelExpire", width: "120px" },
      { i18n: "ticketExpire.table.ExpireCode", field: "expireCode", width: "200px" },
      { i18n: "ticketExpire.table.ExpireName", field: "expireName", width: "300px" },
      { i18n: "ticketExpire.table.createDate", field: "createDate", width: "150px" },
      { i18n: "ticketExpire.table.createUser", field: "createUser", width: "130px" },
      { i18n: "ticketExpire.table.updateLastTime", field: "updateDate", width: "150px" },
      { i18n: "ticketExpire.table.lastUpdater", field: "updateUser", width: "130px" },
      { i18n: "ticketExpire.table.Description", field: "description", width: "400px" },
      { i18n: "ticketExpire.table.status", field: "status", width: "120px" }//Trạng thái
    ];
    this.displayedColumnsType = this.columns.map(x => x.field);
  }

  onChangeStatus() {
    this.doSearch();
  }

  doSearch() {
    this.isLoading = true;
    let params = this.formSearch.getRawValue();
    // params["ticketTypeLevel"] = 3;
    params["lstExpireCauseOne"] = params["expireLevelOne"] ? _.map(params["expireLevelOne"], "value") : [];
    ;
    params["lstExpireCauseTwo"] = params["expireLevelTwo"] ? _.map(params["expireLevelTwo"], "value") : [];
    params["lstExpireCauseThree"] = params["expireLevelThree"] ? _.map(params["expireLevelThree"], "value") : [];
    ;
    params["lstLevelExpire"] = params["levelExpire"] ? _.map(params["levelExpire"], "value").filter(x => x) : [];
    ;
    // let status = [];
    // if (params['inEffect']) status.push(1);
    // if (params['expire']) status.push(0);
    // params['status'] = status;
    params["status"] = params["status"] ? _.map(params["status"], "value").filter(x => x) : [];

    this.ticketExpireCauseService.doSearch(params).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.listDataExpireCause = rs.data.listData;
        this.countTableExpireCause = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      }
    );
  }

  buildForm() {
    this.formSearch = this.fb.group({
      expireLevelOneFilter: "", //Filter Nguyên nhân cấp 1
      expireLevelTwoFilter: "", //Filter Nguyên nhân cấp 2
      expireLevelThreeFilter: "", //Filter Nguyên nhân cấp 3
      expireLevelOne: "", //Nguyên nhân cấp 1
      expireLevelTwo: "", //Nguyên nhân cấp 2
      expireLevelThree: "", //Nguyên nhân cấp 3
      levelExpire: "", //Cấp nguyên nhân
      formDate: "",//Từ ngày
      toDate: "",//Đến ngày
      createUser: "",//Nguoi tao
      startRecord: 0,
      inEffect: "", // Hiệu lực
      expire: "", // Không hiệu lực
      pageSize: this.pageSizeList[0],
      status: ""
    });
  }

  dataChangeExpireLv1Filter() {
    this.formSearch.get("expireLevelOneFilter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterExpireLevelOne();
    });
  }

  dataChangeExpireLv2Filter() {
    this.formSearch.get("expireLevelTwoFilter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterExpireLevelTwo();
    });
  }

  dataChangeExpireLv3Filter() {
    this.formSearch.get("expireLevelThreeFilter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterExpireLevelThree();
    });
  }

  filterExpireLevelOne() {
    this.searchEp1All = false;
    if (!this.lstExpireLvOne) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("expireLevelOneFilter").value;
    if (!search || search == "" || search.length == 0) {
      this.filteredExpireLevelOne.next(this.lstExpireLvOne.slice());
      if (this.formSearch.controls.expireLevelOne.value?.length == this.lstExpireLvOne.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchEp1All = true;
      } else {
        this.searchEp1All = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredExpireLevelOne.next(
        this.lstExpireLvOne.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
    }
  }

  filterExpireLevelTwo() {
    this.searchEp2All = false;
    if (!this.lstExpireLvTwo) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("expireLevelTwoFilter").value;
    if (!search || search == "" || search.length == 0) {
      this.filteredExpireLevelTwo.next(this.lstExpireLvTwo.slice());
      if (this.formSearch.controls.expireLevelTwo.value?.length == this.lstExpireLvTwo.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchEp2All = true;
      } else {
        this.searchEp2All = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredExpireLevelTwo.next(
        this.lstExpireLvTwo.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
    }
  }

  filterExpireLevelThree() {
    this.searchEp3All = false;
    if (!this.lstExpireLvThree) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("expireLevelThreeFilter").value;
    if (!search || search == "" || search.length == 0) {
      this.filteredExpireLevelThree.next(this.lstExpireLvThree.slice());
      if (this.formSearch.controls.expireLevelThree.value?.length == this.lstExpireLvThree.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchEp3All = true;
      } else {
        this.searchEp3All = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredExpireLevelThree.next(
        this.lstExpireLvThree.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
    }
  }

  selectAll(event) {
    this.filteredExpireLevelOne.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.searchEp1All = true;
          this.formSearch.controls.expireLevelOne.patchValue(val);
          this.handleChangeExpireLvTwo();
        } else {
          this.searchEp1All = false;
          this.searchEp2All = false;
          this.searchEp3All = false;
          this.formSearch.get("expireLevelOne").setValue("");
          this.formSearch.get("expireLevelTwoFilter").setValue("");
          this.formSearch.get("expireLevelThreeFilter").setValue("");
          this.filteredExpireLevelTwo = new ReplaySubject;
          this.filteredExpireLevelThree = new ReplaySubject;
          this.lstExpireLvTwo = [];
          this.lstExpireLvThree = [];
        }
      });

  }

  selectAllExpireTwo(event) {
    this.searchEp2All = false;
    let search = this.formSearch.get("expireLevelTwoFilter").value;
    this.filteredExpireLevelTwo.next(
      this.lstExpireLvTwo.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstExpireLvTwo.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.searchEp2All = true;
      this.formSearch.controls.expireLevelTwo.patchValue(val);
      this.handleChangeExpireLvThree();
    } else {
      this.searchEp2All = false;
      this.searchEp3All = false;
      this.formSearch.get("expireLevelTwo").setValue("");
      this.filteredExpireLevelThree = new ReplaySubject;
      this.formSearch.get("expireLevelThree").setValue("");
      this.lstExpireLvThree = [];
    }
  }

  selectAllExpireThree(event) {
    this.searchEp3All = false;
    let search = this.formSearch.get("expireLevelThreeFilter").value;
    this.filteredExpireLevelThree.next(
      this.lstExpireLvThree.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstExpireLvThree.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.searchEp3All = true;
      this.formSearch.controls.expireLevelThree.patchValue(val);
    } else {
      this.searchEp3All = false;
      this.formSearch.get("expireLevelThree").setValue("");
    }
  }

  /* get list data ticket expire cause level 1 */
  getLstExpireLvOne() {
    let params: object = {
      search: this.search
    };
    this.isLoading = true;
    this.ticketExpireCauseService.getTicketExpireCauseByParent(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstExpireLvOne = data.map(val => ({ value: val.ticketExpireCauseId, label: val.name }));
      this.filterExpireLevelOne();
      this.filteredExpireLevelTwo.next(this.lstExpireLvTwo.slice());
      this.dataChangeExpireLv2Filter();
    });
  }

  onChangeExpireLvOne() {
    let search = this.formSearch.get("expireLevelOneFilter").value;

    if (this.formSearch.controls.expireLevelOne.value?.length == this.lstExpireLvOne.length) {
      this.searchEp1All = true;
      this.handleChangeExpireLvTwo();
    } else if (this.formSearch.controls.expireLevelOne.value?.length == 0) {
      this.formSearch.get("expireLevelOne").setValue("");
    } else if (this.formSearch.controls.expireLevelOne.value?.length == this.lstExpireLvOne.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchEp1All = true;
      this.handleChangeExpireLvTwo();
    } else {
      this.searchEp1All = false;
      this.searchEp2All = false;
      this.searchEp3All = false;
      this.handleChangeExpireLvTwo();
      this.lstExpireLvTwo = [];
      this.lstExpireLvThree = [];
      this.formSearch.get('expireLevelTwo').setValue('');
      this.formSearch.get('expireLevelThree').setValue('');
      this.filteredExpireLevelTwo = new ReplaySubject;
      this.filteredExpireLevelThree = new ReplaySubject;
    }
  }

  onChangeExpireLvTwo() {
    let search = this.formSearch.get("expireLevelTwoFilter").value;

    if (this.formSearch.controls.expireLevelTwo.value?.length == this.lstExpireLvTwo.length) {
      this.searchEp2All = true;
      this.handleChangeExpireLvThree();
    } else if (this.formSearch.controls.expireLevelTwo.value?.length == 0) {
      this.formSearch.get("expireLevelTwo").setValue("");
    } else if (this.formSearch.controls.expireLevelTwo.value?.length == this.lstExpireLvTwo.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchEp2All = true;
      this.handleChangeExpireLvThree();
    } else {
      this.searchEp2All = false;
      this.searchEp3All = false;
      this.handleChangeExpireLvThree();
      this.formSearch.get('expireLevelThree').setValue("");
      this.filteredExpireLevelThree = new ReplaySubject;
    }

  }

  onChangeExpireLvThree() {
    let search = this.formSearch.get("expireLevelThreeFilter").value;

    if (this.formSearch.controls.expireLevelThree.value?.length == this.lstExpireLvThree.length) {
      this.searchEp3All = true;
    } else if (this.formSearch.controls.expireLevelThree.value?.length == 0) {
      this.formSearch.get("expireLevelThree").setValue("");
    } else if (this.formSearch.controls.expireLevelThree.value?.length == this.lstExpireLvThree.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchEp3All = true;
    } else {
      this.searchEp3All = false;
    }
  }

  handleChangeExpireLvTwo() {
    this.formSearch.controls.expireLevelTwo.setValue(null);
    this.lstExpireLvTwo = [];
    if (this.formSearch.controls.expireLevelOne.value?.length > 0) {
      this.getListTicketExpireLvTwo(this.formSearch.controls.expireLevelOne.value.filter(item => item !== -1));
    }
  }

  handleChangeExpireLvThree() {
    this.formSearch.controls.expireLevelThree.setValue(null);
    this.lstExpireLvThree = [];
    if (this.formSearch.controls.expireLevelOne.value?.length > 0) {
      this.getListTicketExpireLvThree(this.formSearch.controls.expireLevelTwo.value.filter(item => item !== -1));
    }
  }

  /* get list data ticket expire cause level 2 */
  getListTicketExpireLvTwo(parentId) {
    let lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search
    };
    this.ticketExpireCauseService.getTicketExpireCauseByParent(params).subscribe(res => {
      // const data = res.data?.listData || [];
      // this.lstExpireLvTwo = data.map(val => ({ value: val.ticketExpireCauseId, label: val.name }));

      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstExpireLvTwo = data.map(val => ({ value: val.ticketExpireCauseId, label: val.name }));

      this.filteredExpireLevelTwo.next(this.lstExpireLvTwo.slice());
      this.filterExpireLevelTwo();
      this.filteredExpireLevelThree.next(this.lstExpireLvThree.slice());
      this.dataChangeExpireLv3Filter();

    });
  }

  /* get list data ticket expire cause level 3 */
  getListTicketExpireLvThree(parentId) {
    let lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search
    };
    this.ticketExpireCauseService.getTicketExpireCauseByParent(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstExpireLvThree = data.map(val => ({ value: val.ticketExpireCauseId, label: val.name }));

      this.filteredExpireLevelThree.next(this.lstExpireLvThree.slice());
      this.dataChangeExpireLv3Filter();
      this.filterExpireLevelThree();
    });
  }

  // Click Tất cả trạng thái
  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.formSearch.controls.status.setValue([...this.statuses, -1]);
    } else {
      this.formSearch.controls.status.setValue([]);
    }
  }

  // Click 1 trạng thái
  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.formSearch.controls.status.value.length == this.statuses.length) {
      this.allStatus.select();
    }
  }

  onChangeStatusMultiple() {
    let dataCheck = _.filter(this.listDataExpireCause, (obj: any) => {
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
            lstIdsActive: _.map(lstIdsActive, "ticketExpireCauseId"),
            lstIdsInactive: _.map(lstIdsInactive, "ticketExpireCauseId")
          };
          this.ticketExpireCauseService.approveChangeStatus(params).subscribe(rs => {
            this.isLoading = false;
            this.selection.clear();
            if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
              this.toars.success(this.translateService.instant("cateConfig.ticketType.changeSuccess"));
              this.checkAll = false;
              this.doSearch();
            } else {
              this.toars.warning(this.translateService.instant("cateConfig.ticketType.changeError"));
            }
          }, () => {
            this.isLoading = false;
            this.toars.error(this.translateService.instant("common.500Error"));
          });
        }
      });
    } else {
      this.toars.warning(this.translateService.instant("cateConfig.ticketType.checkedStatus"));
    }
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
            ticketExpireCauseId: item.ticketExpireCauseId,
            status: item.status
          };
          this.ticketExpireCauseService.changeStatus(params).subscribe(rs => {
            this.isLoading = false;
            if (rs) {
              this.toars.success(this.translateService.instant("cateConfig.ticketType.changeSuccess"));
              this.doSearch();
            } else {
              this.toars.warning(this.translateService.instant("cateConfig.ticketType.changeError"));
            }
          }, () => {
            this.isLoading = false;
            this.toars.error(this.translateService.instant("common.500Error"));
          });
          this.checkAll = false;
        }
      });
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.lstType ? this.lstType.filter(x => x.status == STATUS_TICKET_TYPE.CREATE_NEW).length : 0;
    return numSelected === numRows;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }

  checkChange(row) {
    this.selection.toggle(row);
    row.selected = this.selection.isSelected(row);
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.lstType.forEach(row => {
        row.selected = false;
      });
    } else {
      this.lstType.forEach(row => {
        if (row.status === STATUS_TICKET_TYPE.CREATE_NEW) {
          this.selection.select(row);
          row.selected = true;
        }
      });
    }
  }

  onPageChange(event) {
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

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(", ");
    }
    return "";
  }

  onOpenDialog() {
    let params: object = {
      title: "THÊM MỚI NGUYÊN NHÂN QUÁ HẠN"
    };
    const dialog = this.dialog.open({
      width: "1200px",
      data: params,
      disableClose: true
    }, TicketExpireCauseCreateComponent);

    dialog.afterClosed().subscribe(res => {
      this.clearCheckAll1();
      this.clearTicketExpired1();
      this.formSearch.get("expireLevelOne").setValue("");
      this.getLstExpireLvOne();
      this.doSearch();
    });
  }

  doUpdate(data: any): any {
    let params: object = {
      title: "CẬP NHẬT NGUYÊN NHÂN QUÁ HẠN",
      data: data
    };

    const dialog = this.dialog.open({
      width: "1200px",
      data: params,
      disableClose: true
    }, TicketExpireCauseCreateComponent);

    dialog.afterClosed().subscribe(() => {
      this.getLstExpireLvOne();
      this.doSearch();
    });
  }

  doDelete(data: any) {
    const message = this.translateService.instant("cateConfig.ticketType.deleteTicketExpire") + ` : ${data.expireCauseName}`;
    const dialogData = new ConfirmDialogModel(this.translateService.instant("buttonTitle.deleteTicketExpire"), message, this.translateService.instant("common.button.delete"));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: "700px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.isLoading = true;
        this.ticketExpireCauseService.doDeleteData(data.ticketExpireCauseId).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === 1) {
            this.toars.warning(this.translateService.instant("cateConfig.ticketType.deleteErrorExpire"));
          } else {
            this.toars.success(this.translateService.instant("cateConfig.ticketType.deleteSuccessExpire"));
            this.doSearch();
          }
        }, () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant("common.500Error"));
        });
      }
    });
  }

  onCheckAll(ob: MatCheckboxChange) {
    if (ob && ob.checked === true) {
      this.listDataExpireCause.forEach((obj: any) => {
        obj["checked"] = true;
      });
    } else {
      this.checkAll = false;
      this.listDataExpireCause.forEach((obj: any) => {
        obj["checked"] = false;
      });
    }
  }

  onCheckItem(ob: MatCheckboxChange) {
    let itemCheck = _.filter(this.listDataExpireCause, (obj: any) => {
      return obj["checked"] === true;
    });
    if (itemCheck && itemCheck.length === this.listDataExpireCause.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  onChangeLevelExpireAll() {
    if (this.levelExpire.selected) {
      this.formSearch.controls.levelExpire.setValue([...this.lstLevelExpire, -1]);
    } else {
      this.formSearch.controls.levelExpire.setValue([]);
    }
  }

  onChangeLevelExpire() {
    if (this.levelExpire.selected) {
      this.levelExpire.deselect();
    }
    if (this.formSearch.controls.levelExpire.value.length == this.lstLevelExpire.length) {
      this.levelExpire.select();
    }
  }

  clearTicketExpired1() {
    this.filteredExpireLevelTwo = new ReplaySubject;
    this.lstExpireLvTwo = [];
    this.filteredExpireLevelThree = new ReplaySubject;
    this.lstExpireLvThree = [];
    this.formSearch.get("expireLevelTwo").setValue("");
    this.formSearch.get("expireLevelThree").setValue("");
  }

  clearTicketExpired2() {
    this.filteredExpireLevelThree = new ReplaySubject;
    this.lstExpireLvThree = [];
    this.formSearch.get("expireLevelThree").setValue("");
  }

  clearCheckAll1() {
    this.searchEp1All = false;
    this.searchEp2All = false;
    this.searchEp3All = false;
  }

  clearCheckAll2() {
    this.searchEp2All = false;
    this.searchEp3All = false;
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

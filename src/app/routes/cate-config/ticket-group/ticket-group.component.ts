import { SelectionModel } from "@angular/cdk/collections";
import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatOption } from "@angular/material/core";
import { ActivatedRoute } from "@angular/router";
import { RESOURCE } from "@app/core/app-config";
import { TicketGroupService } from "@app/core/services/cate-config/ticket-group.service";
import { GROUP_REFLECTS_STATUS, HTTP_CODE, STATUS_TICKET_TYPE } from "@app/shared";
import { BaseComponent } from "@app/shared/components/base-component/base-component.component";
import { MtxDialog } from "@ng-matero/extensions";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmDialogComponent, ConfirmDialogModel } from "@shared/components/confirm-dialog/confirm-dialog.component";
import _ from "lodash";
import { ToastrService } from "ngx-toastr";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { ReplaySubject } from "rxjs/internal/ReplaySubject";
import { Subject } from "rxjs/internal/Subject";
import { take } from "rxjs/operators";
import { DialogUpdateTicketGroupComponent } from "./dialog-update-ticket-group/dialog-update-ticket-group.component";

@Component({
  selector: "app-ticket-group",
  templateUrl: "./ticket-group.component.html",
  styleUrls: ["./ticket-group.component.scss"]
})
export class TicketGroupComponent extends BaseComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() isLoading: boolean;
  @Input() pageIndex: number;
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild("ticketGroupsTag") private ticketGroupsTag: MatOption;

  form!: FormGroup;
  onDestroy = new Subject<void>();
  statusTicketType = STATUS_TICKET_TYPE;
  lstTicketGroup: any = [];
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

  // data
  selectAllChecked: boolean = false;
  isCheckBoxAll: boolean = false;
  filteredTicketGroup: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  lstType: any = [];
  ticketGroup!: string;
  countTableType = 0;
  formDate!: string;
  pageSizeList = [10, 50, 100];
  displayedColumnsType: any = [];
  selection = new SelectionModel<any>(true, []);
  toastrService: any;
  countTableTicketGroup = 0;
  lstDataTicketGroup: any = [];
  open: any;
  checkAll: any = false;
  search: any = 0;
  messageConfirm: any;

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketGroupService: TicketGroupService,
    private fb: FormBuilder,
    public actr: ActivatedRoute,
    public dialog?: MtxDialog,
    private cdr?: ChangeDetectorRef) {
    super(ticketGroupService, RESOURCE.CC_CATE_CONFIG, toars);
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  customViewDescription(strView: string): string {
    if (strView && strView.length > 65) return strView.substring(0, 65) + " ..."
    else return strView;
  }

  customViewName(strView: string): string {
    if (strView && strView.length > 50) return strView.substring(0, 50) + " ..."
    else return strView;
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: "STT", field: "orderNumber", width: '40px' },
      { i18n: "", field: "select", width: '30px' },
      { i18n: "common.action", field: "action", width: '80px' },
      { i18n: "cateConfig.ticketGroup.ticketGroupCode", field: "ticketTypeCode", width: '150px' }, //note
      { i18n: "cateConfig.ticketGroup.ticketGroup", field: "ticketTypeName", width: '300px' },
      { i18n: "promotion.createDate", field: "createDate", width: '150px' },
      { i18n: "promotion.createUser", field: "createUser", width: '130px' },
      { i18n: "cateConfig.updateLastTime", field: "updateDate", width: '130px' },
      { i18n: "cateConfig.lastUpdater", field: "updateUser", width: '150px' },
      { i18n: "search-bot.description", field: "description", width: '350px', type: 'string' },
      { i18n: "common.status", field: "status", width: '100px' }

    ];
    this.displayedColumnsType = this.columns.map(x => x.field);
    this.buildForm();
    this.doSearch();
    this.mapData();
    this.filteredTicketGroup.next(this.lstTicketGroup.slice());
    this.dataChangeTicketGroupFilter();

  }

  async mapData() {
    await this.getListTicketGroup();
  }


  buildForm() {
    this.form = this.fb.group({
      ticketGroupFilter: "",
      ticketGroup: [""], //Nhóm phản ánh
      // ticketTypeName: [''], //Tên nhóm phản ánh
      // ticketTypeCode: [''], //Mã nhóm phản ánh
      formDate: null,//Từ ngày
      toDate: null,//Đến ngày
      // inEffect: "", // Đang hiệu lực
      // expire: "", // Hết hiệu lực
      createUser: "", //Người tạo
      startRecord: 0,
      pageSize: this.pageSizeList[0],
      status: ['']
    });
  }

  dataChangeTicketGroupFilter() {
    this.form.get("ticketGroupFilter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGroup();
    });
  }

  doSearch(): any {
    this.isLoading = true;
    this.selection.clear();
    this.checkAll = false;
    let dataParams = this.form.getRawValue();
    dataParams["ticketTypeLevel"] = 1;
    dataParams["lstTicketTypeGroupId"] = dataParams["ticketGroup"] ? _.map(dataParams["ticketGroup"], "value") : [];
    dataParams["lstTicketTypeGenreId"] = dataParams["ticketGenre"] ? _.map(dataParams["ticketGenre"], "value") : [];
    dataParams['status'] = dataParams['status'] ? _.map(dataParams['status'], 'value').filter(x => x) : [];
    this.ticketGroupService.doSearch(dataParams).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstDataTicketGroup = rs.data.listData;
        this.countTableTicketGroup = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      }
    );
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }


  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  setValueToField(item: any, data: any) {
    return this.form.get(item)?.setValue(data);
  }

  setValueStatus(params: any) {
    if (params.status && params.status.length > 1) {
      params.status = -1;
    } else if (params.status && params.status.length > 0) {
      params.status = params.status.filter(item => item !== -1).map(item => item.value).join(";");
    } else {
      params.status = null;
    }
  }

  onClickInsertGroupReflects() {
    this.onDetailBeforeUpdate(DialogUpdateTicketGroupComponent);
  }

  // Open Dialog chỉnh sửa nhóm phản ánh
  onDetailBeforeUpdate(componentTemplate?) {
    const dialog = this.dialog.open({
      width: "60%",
      height: "auto",
      disableClose: true
    }, componentTemplate);
    dialog.afterClosed().subscribe(_res => {
      this.btnClear();
      this.doSearch();
      this.getListTicketGroup();
    });
  }

  // Click Tất cả trạng thái
  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.form.controls.status.setValue([...this.statuses, -1]);
    } else {
      this.form.controls.status.setValue([]);
    }
  }

  // Click 1 trạng thái
  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.form.controls.status.value.length == this.statuses.length) {
      this.allStatus.select();
    }
    if (this.form.controls.status.value?.length == 0) {
      this.form.get('status').setValue("");
    }
  }

  // Click chuyển trang
  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    if (this.form.controls.startRecord.value != this.pageIndex) {
      this.form.controls.startRecord.setValue(this.pageIndex);
      this.form.controls.pageSize.setValue(event.pageSize);
      this.doSearch();
    } else {
      this.form.controls.startRecord.setValue(this.pageIndex);
      this.form.controls.pageSize.setValue(event.pageSize);
      this.doSearch();
    }
  }

  onSearch() {
    this.pageIndex = 0;
    this.form.controls.startRecord.setValue(0);
    this.doSearch();
  }


  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.lstDataTicketGroup ? this.lstDataTicketGroup.length : 0;
    return numSelected === numRows;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }


  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.lstDataTicketGroup.forEach(row => {
        row.selected = false;
      });
    } else {
      this.lstDataTicketGroup.forEach(row => {
        this.selection.select(row);
        row.selected = true;
      });
    }
  }

  onCheckAll(ob: MatCheckboxChange) {
    if (ob && ob.checked === true) {
      this.lstDataTicketGroup.forEach((obj: any) => {
        obj["checked"] = true;
      });
    } else {
      this.checkAll = false;
      this.lstDataTicketGroup.forEach((obj: any) => {
        obj["checked"] = false;
      });
    }
  }

  onCheckItem(_ob: MatCheckboxChange) {
    let itemCheck = _.filter(this.lstDataTicketGroup, (obj: any) => {
      return obj["checked"] === true;
    });
    if (itemCheck && itemCheck.length === this.lstDataTicketGroup.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  onChangeStatusMultipleTicketGroup() {
    let dataCheck = _.filter(this.lstDataTicketGroup, (obj: any) => {
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
            lstIdsActive: _.map(lstIdsActive, "ticketTypeId"),
            lstIdsInactive: _.map(lstIdsInactive, "ticketTypeId")
          };
          this.ticketGroupService.approveChangeStatus(params).subscribe(rs => {
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
          this.ticketGroupService.changeStatus(item).subscribe(rs => {
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
        }
      });
    }
  }

  getListTicketGroup() {
    let params: object = {
      search: this.search
    };
    this.ticketGroupService.getTicketTypeByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketGroup = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
      this.filterTicketGroup();
    });
  }

  filterTicketGroup() {
    if (!this.lstTicketGroup) {
      return;
    }
    // get the search keyword
    let search = this.form.get("ticketGroupFilter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketGroup.next(this.lstTicketGroup.slice());
      if (this.form.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isCheckBoxAll = true;
      } else {
        this.isCheckBoxAll = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGroup.next(
        this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.isCheckBoxAll == true) {
        this.isCheckBoxAll = true;
      } else {
        this.isCheckBoxAll = false;
      }
    }
  }

  onChangeTicketGroup() {
    let search = this.form.get("ticketGroupFilter").value;
    if (this.form.controls.ticketGroup.value?.length == this.lstTicketGroup.length) {
      this.isCheckBoxAll = true;
    } else if (this.form.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isCheckBoxAll = true;
    } else if (this.form.controls.ticketGroup.value?.length == 0) {
      this.form.get("ticketGroup").setValue("");
    } else {
      this.isCheckBoxAll = false;
    }
  }

  getValues() {
    return this.filteredTicketGroup.asObservable();
  }

  selectAll(event) {
    this.isCheckBoxAll = !this.isCheckBoxAll;
    this.filteredTicketGroup.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.form.controls.ticketGroup.patchValue(val);
        } else {
          this.form.get('ticketGroup').setValue("");
          this.isCheckBoxAll = false;
          // this.filteredTicketGroup = new ReplaySubject;
        }
      });
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
  btnClear() {
    this.isCheckBoxAll = false;
    this.form.get('ticketGroup').setValue('');
  }
}

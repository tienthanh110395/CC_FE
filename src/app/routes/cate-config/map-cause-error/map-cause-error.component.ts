import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { BaseComponent } from "@shared/components/base-component/base-component.component";
import { SelectionModel } from "@angular/cdk/collections";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { CreateMapErrorCauseComponent } from "@app/routes/cate-config/map-cause-error/create-map-error-cause/create-map-error-cause.component";
import { UpdateMapCauseErrorComponent } from "@app/routes/cate-config/map-cause-error/update-map-cause-error/update-map-cause-error.component";
import { RESOURCE } from "@core";
import { AppStorage } from "@core/services/AppStorage";
import { MapErrorCauseService } from "@core/services/cate-config/map-error-cause.service";
import { TickeErrorService } from "@core/services/cate-config/ticket-error.service";
import { TicketTypeService } from "@core/services/cate-config/ticket-type.service";
import { MtxDialog } from "@ng-matero/extensions";
import { TranslateService } from "@ngx-translate/core";
import { HTTP_CODE } from "@shared";
import { ConfirmDialogComponent, ConfirmDialogModel } from "@shared/components/confirm-dialog/confirm-dialog.component";
import _ from "lodash";
import { ToastrService } from "ngx-toastr";
import { ReplaySubject, Subject } from "rxjs";
import { take } from "rxjs/internal/operators/take";
import { takeUntil } from "rxjs/operators";
import { ImportFileMapErrorCauseComponent } from "./import-file-map-error-cause/import-file-map-error-cause.component";

@Component({
  selector: "app-map-cause-error",
  templateUrl: "./map-cause-error.component.html",
  styleUrls: ["./map-cause-error.component.scss"]
})
export class MapCauseErrorComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild("ticketErrorCauseNameLv1s") private ticketErrorCauseNameLv1s: MatOption;
  @ViewChild("ticketErrorCauseNameLv2s") private ticketErrorCauseNameLv2s: MatOption;
  @ViewChild("ticketErrorCauseNameLv3s") private ticketErrorCauseNameLv3s: MatOption;
  formSearch!: FormGroup;
  checkAll: any = false;
  selection = new SelectionModel<any>(true, []);

  filteredTicketErrorCauseLv1: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketErrorCauseLv2: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketErrorCauseLv3: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();

  search: any = 0;
  lstDataTicketType: any = [];
  lstTicketGenre: any = [];
  lstTicketGroup: any = [];
  filteredTicketGroup: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketGenre: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  lstTicketErrorCauseLv1: any = [];
  lstTicketErrorCauseLv2: any = [];
  lstTicketErrorCauseLv3: any = [];

  lstDataTicketErrorCause: any = [];
  displayedColumnsTypeError: any = [];
  countTableTicketErrorCause = 0;

  searchGroupAll: boolean = false;
  searchGenreAll: boolean = false;
  searchNNC1All: boolean = false;
  searchNNC2All: boolean = false;
  searchNNC3All: boolean = false;

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private tickeErrorService: TickeErrorService,
    private ticketTypeService: TicketTypeService,
    private mapErrorCauseService: MapErrorCauseService,
    private fb: FormBuilder,
    public dialog?: MtxDialog
  ) {
    super(tickeErrorService, RESOURCE.CC_CATE_CONFIG, toars, translateService);
  }

  customViewName(strView: string): string {
    if (strView && strView.length > 50) return strView.substring(0, 50) + " ...";
    else return strView;
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: "common.orderNumber", field: "orderNumber", width: "40px" },
      // { i18n: "", field: "select", width: "30px" },
      { i18n: "common.action", field: "action", width: "80px" },
      { i18n: "ticketProcessConfig.table.ticketGroup", field: "ticketGroup", width: "200px" },// Nhóm phản ánh
      { i18n: "ticketProcessConfig.table.ticketGenre", field: "ticketGenre", width: "200px" },// Thể loại phản ánh
      { i18n: "search-cc.reasonLevel1", field: "ticketErrorName1", width: "200px" },
      { i18n: "search-cc.reasonLevel2", field: "ticketErrorName2", width: "200px" },
      { i18n: "search-cc.reasonLevel3", field: "ticketErrorName3", width: "200px" },
      { i18n: "promotion.createDate", field: "createDate", width: "130px" },
      { i18n: "promotion.createUser", field: "createUser", width: "110px" },
      { i18n: "cateConfig.updateLastTime", field: "updateDate", width: "150px" },
      { i18n: "cateConfig.lastUpdater", field: "updateUser", width: "130px" }
    ];
    this.displayedColumnsTypeError = this.columns.map(x => x.field);
    this.buildForm();
    this.doSearch();
    this.mapData();
    this.filteredTicketErrorCauseLv1.next(this.lstTicketErrorCauseLv1.slice());
    this.filteredTicketGroup.next(this.lstTicketGroup.slice());
    this.dataChangeTicketGroupFilter();
    this.dataChangeErrorLv1Filter();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketGroup: [null], //Nhóm phản ánh
      ticketGenre: [null], //Thể loại phản ánh
      ticketGroupFilter: "", //Filter Nhóm phản ánh
      ticketGenreFilter: "", //Filter Thể loại phản ánh
      ticketErrorCauseLv1Filter: "", //Filter Nguyên nhân lỗi cấp 1
      ticketErrorCauseLv2Filter: "", //Filter Nguyên nhân lỗi cấp 2
      ticketErrorCauseLv3Filter: "", //Filter Nguyên nhân lỗi cấp 3
      ticketErrorCauseNameLv1: "", //Nguyên nhân lỗi cấp 1
      ticketErrorCauseNameLv2: "", //Nguyên nhân lỗi cấp 2
      ticketErrorCauseNameLv3: "", //Nguyên nhân lỗi cấp 3
      formDate: "",//Từ ngày
      toDate: "",//Đến ngày
      createUser: "", //Người tạo
      startRecord: 0,
      pageSize: this.pageSizeList[0]
    });
  }

  async mapData() {
    await this.getLstTicketErrorLvOne();
    await this.getListTicketGroup();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startRecord.setValue(0);
    this.doSearch();
  }

  // Lấy danh sách nguyên nhân lỗi
  doSearch(): any {
    this.isLoading = true;
    const params = this.formSearch.getRawValue();
    params["lstErrorCauseLv1"] = params["ticketErrorCauseNameLv1"] ? _.map(params["ticketErrorCauseNameLv1"], "value") : [];
    params["lstErrorCauseLv2"] = params["ticketErrorCauseNameLv2"] ? _.map(params["ticketErrorCauseNameLv2"], "value") : [];
    params["lstErrorCauseLv3"] = params["ticketErrorCauseNameLv3"] ? _.map(params["ticketErrorCauseNameLv3"], "value") : [];
    params["lstTicketTypeGroupId"] = params["ticketGroup"] ? _.map(params["ticketGroup"], "value") : [];
    params["lstTicketCategoryId"] = params["ticketGenre"] ? _.map(params["ticketGenre"], "value") : [];
    this.checkAll = false;
    this.selection.clear();
    this.mapErrorCauseService.doSearch(params).subscribe(rs => {
        this.isLoading = false;
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.lstDataTicketErrorCause = rs.data.listData;
          this.countTableTicketErrorCause = rs.data.count;
        }
      },
      () => {
        this.isLoading = false;
      }
    );

  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(",");
    }
    return "";
  }


  selectAll(event) {
    this.filteredTicketErrorCauseLv1.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.searchNNC1All = true;
          this.formSearch.controls.ticketErrorCauseNameLv1.patchValue(val);
          this.handleChangeErrorTwo();
        } else {
          this.searchNNC1All = false;
          this.searchNNC2All = false;
          this.searchNNC3All = false;
          this.filteredTicketErrorCauseLv2 = new ReplaySubject;
          this.filteredTicketErrorCauseLv3 = new ReplaySubject;
          this.formSearch.get("ticketErrorCauseNameLv1").setValue("");
          this.formSearch.get("ticketErrorCauseNameLv2").setValue("");
          this.formSearch.get("ticketErrorCauseNameLv3").setValue("");
        }
      });
  }

  selectAllTicketErrorCauseLv2(event) {
    this.searchNNC2All = false;
    let search = this.formSearch.get("ticketErrorCauseLv2Filter").value;
    this.filteredTicketErrorCauseLv2.next(
      this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.searchNNC2All = true;
      this.formSearch.controls.ticketErrorCauseNameLv2.patchValue(val);
      this.handleChangeErrorLvThree();
    } else {
      this.searchNNC2All = false;
      this.searchNNC3All = false;
      this.filteredTicketErrorCauseLv3 = new ReplaySubject;
      this.formSearch.get("ticketErrorCauseNameLv2").setValue("");
      this.formSearch.get("ticketErrorCauseNameLv3").setValue("");
    }
  }

  selectAllTicketErrorCauseLv3(event) {
    this.searchNNC3All = false;
    let search = this.formSearch.get("ticketErrorCauseLv3Filter").value;
    this.filteredTicketErrorCauseLv3.next(
      this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.searchNNC3All = true;
      this.formSearch.controls.ticketErrorCauseNameLv3.patchValue(val);
    } else {
      this.searchNNC3All = false;
      this.formSearch.get("ticketErrorCauseNameLv3").setValue("");
    }
  }

  handleChangeErrorTwo() {
    this.formSearch.controls.ticketErrorCauseNameLv2.setValue(null);
    this.lstTicketErrorCauseLv2 = [];
    if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length > 0) {
      this.getListTicketErrorLvTwo(this.formSearch.controls.ticketErrorCauseNameLv1.value.filter(item => item !== -1));
    }
  }

  handleChangeErrorLvThree() {
    this.formSearch.controls.ticketErrorCauseNameLv3.setValue(null);
    this.lstTicketErrorCauseLv3 = [];
    if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length > 0) {
      this.getListTicketErrorLvThree(this.formSearch.controls.ticketErrorCauseNameLv2.value.filter(item => item !== -1));
    }
  }

  /* get list data ticket eror cause level 1 */
  getLstTicketErrorLvOne() {
    this.isLoading = true;
    let params: object = {
      search: this.search
    };
    this.tickeErrorService.getListTickecErrorCauseByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketErrorCauseLv1 = data.map(val => ({ value: val.ticketErrorCauseId, label: val.name }));
      this.filterErrorLevelOne();
      this.filteredTicketErrorCauseLv2.next(this.lstTicketErrorCauseLv2.slice());
      this.dataChangeErrorLv2Filter();
    });
  }

  getListTicketErrorLvTwo(parentId) {
    const lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search
    };
    this.tickeErrorService.getListTickecErrorCauseByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketErrorCauseLv2 = data.map(val => ({ value: val.ticketErrorCauseId, label: val.name }));
      this.filteredTicketErrorCauseLv2.next(this.lstTicketErrorCauseLv2.slice());
      this.filterErrorLevelTwo();
      this.filteredTicketErrorCauseLv3.next(this.lstTicketErrorCauseLv3.slice());
      this.dataChangeErrorLv3Filter();
    });
  }

  /* get list data ticket expire cause level 3 */
  getListTicketErrorLvThree(parentId) {
    const lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search
    };
    this.tickeErrorService.getListTickecErrorCauseByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketErrorCauseLv3 = data.map(val => ({ value: val.ticketErrorCauseId, label: val.name }));
      this.filteredTicketErrorCauseLv3.next(this.lstTicketErrorCauseLv3.slice());
      this.dataChangeErrorLv3Filter();
      this.filterErrorLevelThree();
    });
  }

  dataChangeErrorLv1Filter() {
    this.formSearch.get("ticketErrorCauseLv1Filter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterErrorLevelOne();
    });
  }

  dataChangeErrorLv2Filter() {
    this.formSearch.get("ticketErrorCauseLv2Filter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterErrorLevelTwo();
    });
  }

  dataChangeErrorLv3Filter() {
    this.formSearch.get("ticketErrorCauseLv3Filter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterErrorLevelThree();
    });
  }

  filterErrorLevelOne() {
    if (!this.lstTicketErrorCauseLv1) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("ticketErrorCauseLv1Filter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketErrorCauseLv1.next(this.lstTicketErrorCauseLv1.slice());
      if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length == this.lstTicketErrorCauseLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchNNC1All = true;
      } else {
        this.searchNNC1All = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketErrorCauseLv1.next(
        this.lstTicketErrorCauseLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.searchNNC1All == true) {
        this.searchNNC1All = true;
      } else {
        this.searchNNC1All = false;
      }
    }
  }

  filterErrorLevelTwo() {
    if (!this.lstTicketErrorCauseLv2) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("ticketErrorCauseLv2Filter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketErrorCauseLv2.next(this.lstTicketErrorCauseLv2.slice());
      if (this.formSearch.controls.ticketErrorCauseNameLv2.value?.length == this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchNNC2All = true;
      } else {
        this.searchNNC2All = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketErrorCauseLv2.next(
        this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.searchNNC2All == true) {
        this.searchNNC2All = true;
      } else {
        this.searchNNC2All = false;
      }
    }
  }

  filterErrorLevelThree() {
    if (!this.lstTicketErrorCauseLv3) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("ticketErrorCauseLv3Filter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketErrorCauseLv3.next(this.lstTicketErrorCauseLv3.slice());
      if (this.formSearch.controls.ticketErrorCauseNameLv3.value?.length == this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchNNC3All = true;
      } else {
        this.searchNNC3All = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketErrorCauseLv3.next(
        this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.searchNNC3All == true) {
        this.searchNNC3All = true;
      } else {
        this.searchNNC3All = false;
      }
    }
  }

  onChangeTicketErrorCauseLv1() {
    let search = this.formSearch.get("ticketErrorCauseLv1Filter").value;

    if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length == this.lstTicketErrorCauseLv1.length) {
      this.searchNNC1All = true;
    } else if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length == 0) {
      this.formSearch.get("ticketErrorCauseNameLv1").setValue("");
    } else if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length == this.lstTicketErrorCauseLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchNNC1All = true;
      this.handleChangeErrorTwo();
    } else {
      this.searchNNC1All = false;
    }
    this.filteredTicketErrorCauseLv2 = new ReplaySubject;
    this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    this.handleChangeErrorTwo();
  }

  onChangeTicketErrorCauseLv2() {
    let search = this.formSearch.get("ticketErrorCauseLv2Filter").value;

    if (this.formSearch.controls.ticketErrorCauseNameLv2.value?.length == this.lstTicketErrorCauseLv2.length) {
      this.searchNNC2All = true;
    } else if (this.formSearch.controls.ticketErrorCauseNameLv2.value?.length == 0) {
      this.formSearch.get("ticketErrorCauseNameLv2").setValue("");
    }else if (this.formSearch.controls.ticketErrorCauseNameLv2.value?.length == this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchNNC2All = true;
      this.handleChangeErrorLvThree();
    } else {
      this.searchNNC2All = false;
    }
    this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    this.handleChangeErrorLvThree();

  }

  onChangeTicketErrorCauseLv3() {
    let search = this.formSearch.get("ticketErrorCauseLv3Filter").value;

    if (this.formSearch.controls.ticketErrorCauseNameLv3.value?.length == this.lstTicketErrorCauseLv3.length) {
      this.searchNNC3All = true;
    } else if (this.formSearch.controls.ticketErrorCauseNameLv3.value?.length == 0) {
      this.formSearch.get("ticketErrorCauseNameLv3").setValue("");
    }else if (this.formSearch.controls.ticketErrorCauseNameLv3.value?.length == this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchNNC3All = true;
      this.handleChangeErrorLvThree();
    } else {
      this.searchNNC3All = false;
    }
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

  onCheckAll(ob: MatCheckboxChange) {
    if (ob && ob.checked === true) {
      this.lstDataTicketErrorCause.forEach((obj: any) => {
        obj["checked"] = true;
      });
    } else {
      this.checkAll = false;
      this.lstDataTicketErrorCause.forEach((obj: any) => {
        obj["checked"] = false;
      });
    }
  }

  onCheckItem(_ob: MatCheckboxChange) {
    const itemCheck = _.filter(this.lstDataTicketErrorCause, (obj: any) => {
      return obj["checked"] === true;
    });
    if (itemCheck && itemCheck.length === this.lstDataTicketErrorCause.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  onExportFile() {
    this.isLoading = true;
    const params = this.formSearch.getRawValue();
    params["lstErrorCauseLv1"] = params["ticketErrorCauseNameLv1"] ? _.map(params["ticketErrorCauseNameLv1"], "value") : [];
    params["lstErrorCauseLv2"] = params["ticketErrorCauseNameLv2"] ? _.map(params["ticketErrorCauseNameLv2"], "value") : [];
    params["lstErrorCauseLv3"] = params["ticketErrorCauseNameLv3"] ? _.map(params["ticketErrorCauseNameLv3"], "value") : [];
    params["lstTicketTypeGroupId"] = params["ticketGroup"] ? _.map(params["ticketGroup"], "value") : [];
    params["lstTicketCategoryId"] = params["ticketGenre"] ? _.map(params["ticketGenre"], "value") : [];
    this.checkAll = false;
    this.selection.clear();
    this.mapErrorCauseService.exportExcel(params)
      .subscribe(res => {
        const contentDisposition = res.headers.get("content-disposition");
        const filename = contentDisposition.split(";")[1].split("filename")[1].split("=")[1].trim();
        saveAs(res.body, filename);
        this.isLoading = false;
      });
  }

  onImportFile() {
    let params: object = {
      title: this.translateService.instant("map-cause-error.title-import")
    };
    const dialog = this.dialog.open({
      width: "100%",
      data: params,
      disableClose: true
    }, ImportFileMapErrorCauseComponent);

    dialog.afterClosed().subscribe(() => {
      this.doSearch();
    });
  }

  onClickCreateMap() {

    const dataParams: object = {
      title: this.translateService.instant("map-cause-error.title-create")
    };
    const dialog = this.dialog.open({
      width: "1300px",
      height: "650px",
      data: dataParams,
      disableClose: true
    }, CreateMapErrorCauseComponent);

    dialog.afterClosed().subscribe(res => {
      this.doSearch();
    });
  }


  /* update data processing time config*/
  doUpdate(data: any): any {
    const dataParams: object = {
      title: this.translateService.instant("map-cause-error.title-update"),
      ticketGenreId: data.ticketGenreId
    };
    const dialog = this.dialog.open({
      width: "1300px",
      height: "650px",
      data: dataParams,
      disableClose: true
    }, UpdateMapCauseErrorComponent);

    dialog.afterClosed().subscribe(() => {
      this.doSearch();
    });
  }

  doDelete(mapErrorCause) {
    this.confirmDialogDeleteMapErrorCause(mapErrorCause);
  }

  confirmDialogDeleteMapErrorCause(mapErrorCause) {
    const message = this.translateService.instant("map-cause-error.confirm-delete-map");
    const dialogData = new ConfirmDialogModel(this.translateService.instant("map-cause-error.confirmDelete"),
      message, this.translateService.instant("common.button.delete"));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: "700px",
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.isLoading = true;
        this.mapErrorCauseService.deleteMapErrorCause(mapErrorCause.mapErrorCauseId).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            this.toars.success(this.translateService.instant("map-cause-error.deleteSuccess"));
            this.doSearch();
          } else {
            this.toars.warning(this.translateService.instant("map-cause-error.deleteError"));
          }
        }, () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant("common.500Error"));
        });
      }
    });
  }

  dataChangeTicketGroupFilter() {
    this.formSearch.get("ticketGroupFilter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGroup();
    });
  }

  dataChangeTicketGenreFilter() {
    this.formSearch.get("ticketGenreFilter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGenre();
    });
  }

  onChangeTicketGroup() {
    let search = this.formSearch.get("ticketGroupFilter").value;

    if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.length) {
      this.searchGroupAll = true;
    } else if (this.formSearch.controls.ticketGroup.value?.length == 0) {
      this.formSearch.get("ticketGroup").setValue("");
    } else if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchGroupAll = true;
      this.handleChangeTicketGenre();
    } else {
      this.searchGroupAll = false;
    }
    this.handleChangeTicketGenre();
  }

  onChangeTicketGenre() {
    let search = this.formSearch.get("ticketGenreFilter").value;

    if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.length) {
      this.searchGenreAll = true;
    } else if (this.formSearch.controls.ticketGenre.value?.length == 0) {
      this.formSearch.get("ticketGenre").setValue("");
    } else if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchGenreAll = true;
    } else {
      this.searchGenreAll = false;
    }
  }

  handleChangeTicketGenre() {
    this.formSearch.controls.ticketGenre.setValue(null);
    this.lstTicketGenre = [];
    if (this.formSearch.controls.ticketGroup.value?.length > 0) {
      this.getListTicketGenre(this.formSearch.controls.ticketGroup.value.filter(item => item !== -1));
    }
  }

  getListTicketGroup() {
    let params: object = {
      search: this.search
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketGroup = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
      this.filterTicketGroup();
      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      this.dataChangeTicketGenreFilter();
    });
  }

  getListTicketGenre(parentId) {
    let lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketGenre = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      this.filterTicketGenre();
    });
  }

  filterTicketGroup() {
    if (!this.lstDataTicketType) {
      return;
    }
    let search = this.formSearch.get("ticketGroupFilter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketGroup.next(this.lstTicketGroup.slice());
      if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchGroupAll = true;
      } else {
        this.searchGroupAll = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGroup.next(
        this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.searchGroupAll == true) {
        this.searchGroupAll = true;
      } else {
        this.searchGroupAll = false;
      }
    }
  }

  filterTicketGenre() {
    if (!this.lstTicketGenre) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("ticketGenreFilter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchGenreAll = true;
      } else {
        this.searchGenreAll = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGenre.next(
        this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.searchGenreAll == true) {
        this.searchGenreAll = true;
      } else {
        this.searchGenreAll = false;
      }
    }
  }

  selectAllTicketGroup(event) {
    this.filteredTicketGroup.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.searchGroupAll = true;
          this.formSearch.controls.ticketGroup.patchValue(val);
          this.handleChangeTicketGenre();
        } else {
          this.searchGroupAll = false;
          this.searchGenreAll = false;
          this.formSearch.get("ticketGroup").setValue("");
          this.filteredTicketGenre = new ReplaySubject;
          this.selectAllTicketGenre(false);
        }
      });
  }

  selectAllTicketGenre(event) {
    this.searchGenreAll = false;
    let search = this.formSearch.get("ticketGenreFilter").value;
    this.filteredTicketGenre.next(
      this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.searchGenreAll = true;
      this.formSearch.controls.ticketGenre.patchValue(val);
    } else {
      this.searchGenreAll = false;
      this.formSearch.get("ticketGenre").setValue("");
    }
  }

  clearTicketGroup() {
    this.formSearch.get("ticketGroup").setValue("");
    this.formSearch.get("ticketGenre").setValue("");
    this.filteredTicketGenre = new ReplaySubject;
  }

  clearTicketErrorCause1() {
    this.filteredTicketErrorCauseLv2 = new ReplaySubject;
    this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    this.formSearch.get("ticketErrorCauseNameLv2").setValue("");
    this.formSearch.get("ticketErrorCauseNameLv3").setValue("");
  }

  clearTicketErrorCause2() {
    this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    this.formSearch.get("ticketErrorCauseNameLv3").setValue("");
  }

  clearGroup() {
    this.searchGroupAll = false;
    this.searchGenreAll = false;
  }

  clearGenre() {
    this.searchGenreAll = false;
  }

  clearCheckAll1() {
    this.searchNNC1All = false;
    this.searchNNC2All = false;
    this.searchNNC3All = false;
  }

  clearCheckAll2() {
    this.searchNNC2All = false;
    this.searchNNC3All = false;
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

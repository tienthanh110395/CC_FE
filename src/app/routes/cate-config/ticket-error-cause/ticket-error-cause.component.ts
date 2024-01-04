import { SelectionModel } from "@angular/cdk/collections";
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatOption } from '@angular/material/core';
import { GROUP_REFLECTS_STATUS, HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { RESOURCE } from '@core';
import { TickeErrorService } from "@core/services/cate-config/ticket-error.service";
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { TICKET_ERROR_CAUSE_LEVEL_SEARCH } from '@shared';
import { ConfirmDialogComponent, ConfirmDialogModel } from "@shared/components/confirm-dialog/confirm-dialog.component";
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject } from "rxjs";
import { take } from "rxjs/internal/operators/take";
import { takeUntil } from "rxjs/operators";
import { DialogCreateTicketErrorCauseComponent } from './dialog-create-ticket-error-cause/dialog-create-ticket-error-cause.component';


@Component({
  selector: 'app-ticket-error-cause',
  templateUrl: './ticket-error-cause.component.html',
  styleUrls: ['./ticket-error-cause.component.scss']
})
export class TicketErrorCauseComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild('ticketErrorCauseNameLv1s') private ticketErrorCauseNameLv1s: MatOption;
  @ViewChild('ticketErrorCauseNameLv2s') private ticketErrorCauseNameLv2s: MatOption;
  @ViewChild('ticketErrorCauseNameLv3s') private ticketErrorCauseNameLv3s: MatOption;
  @ViewChild('levelError') private levelError: MatOption;
  @ViewChild('status') private status: MatOption;

  formSearch!: FormGroup;

  toastrService: any;
  displayedColumnsTypeError: any = [];
  selection = new SelectionModel<any>(true, []);
  lstDataTicketErrorCause: any = [];
  countTableTicketErrorCause = 0;
  checkAll: any = false;
  lstTicketErrorCauseLv1: any = [];
  lstTicketErrorCauseLv2: any = [];
  lstTicketErrorCauseLv3: any = [];

  filteredTicketErrorCauseLv1: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketErrorCauseLv2: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketErrorCauseLv3: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();
  searchGroupAll: boolean = false;
  searchGroupAll2: boolean = false;
  searchGroupAll3: boolean = false;
  search: any = 0;
  messageConfirm: any;



  lstLevelError = [
    {
      value: TICKET_ERROR_CAUSE_LEVEL_SEARCH.CAP_1,
      label: this.translateService.instant("ticketExpire.table.ExpireLv1")
    },
    {
      value: TICKET_ERROR_CAUSE_LEVEL_SEARCH.CAP_2,
      label: this.translateService.instant("ticketExpire.table.ExpireLv2")
    },
    {
      value: TICKET_ERROR_CAUSE_LEVEL_SEARCH.CAP_3,
      label: this.translateService.instant("ticketExpire.table.ExpireLv3")
    }
  ];

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


  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private tickeErrorService: TickeErrorService,
    private fb: FormBuilder,
    public dialog?: MtxDialog,
  ) {
    super(tickeErrorService, RESOURCE.CC_CATE_CONFIG, toars, translateService)
    this.buildForm();
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
      { i18n: 'common.orderNumber', field: 'orderNumber', width: '40px' },
      { i18n: '', field: 'select', width: '30px' },
      { i18n: 'common.action', field: 'action', width: '80px' },
      { i18n: 'ticketError.table.errorCause', field: 'errorCauseNameParent', width: '410px' },
      { i18n: 'ticketError.table.levelError', field: 'levelError', width: '100px' },
      { i18n: 'ticketError.table.errorCode', field: 'errorCode', width: '200px' },
      { i18n: 'ticketError.table.errorName', field: 'errorName', width: '300px' },
      { i18n: 'promotion.createDate', field: 'createDate', width: '150px' },
      { i18n: 'promotion.createUser', field: 'createUser', width: '130px' },
      { i18n: 'cateConfig.updateLastTime', field: 'updateDate', width: '150px' },
      { i18n: 'cateConfig.lastUpdater', field: 'updateUser', width: '130px' },
      { i18n: 'search-bot.description', field: 'description', width: '400px' },
      { i18n: 'common.status', field: 'status', width: '120px' },
    ];
    this.displayedColumnsTypeError = this.columns.map(x => x.field);
    this.buildForm();
    this.doSearch();
    this.filteredTicketErrorCauseLv1.next(this.lstTicketErrorCauseLv1.slice());
    this.mapData();
    this.dataChangeErrorLv1Filter();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  async mapData() {
    await this.getLstTicketErrorLvOne();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketErrorCauseLv1Filter: '', //Filter Nguyên nhân lỗi cấp 1
      ticketErrorCauseLv2Filter: '', //Filter Nguyên nhân lỗi cấp 2
      ticketErrorCauseLv3Filter: '', //Filter Nguyên nhân lỗi cấp 3
      ticketErrorCauseNameLv1: '', //Nguyên nhân lỗi cấp 1
      ticketErrorCauseNameLv2: '', //Nguyên nhân lỗi cấp 2
      ticketErrorCauseNameLv3: '', //Nguyên nhân lỗi cấp 3
      errorCauseNameParent: "",
      levelError: '', // Cấp nguyên nhân lỗi
      formDate: '',//Từ ngày
      toDate: '',//Đến ngày
      inEffect: '', // Đang hiệu lực
      expire: '', // Hết hiệu lực
      createUser: '', //Người tạo
      startRecord: 0,
      pageSize: this.pageSizeList[0],
      status: ''
    });
  }


  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startRecord.setValue(0);
    this.doSearch();
  }

  // Lấy danh sách nguyên nhân lỗi
  doSearch(): any {
    this.isLoading = true;
    let params = this.formSearch.getRawValue();
    params["lstErrorCauseLv1"] = params["ticketErrorCauseNameLv1"] ? _.map(params["ticketErrorCauseNameLv1"], 'value') : [];
    params["lstErrorCauseLv2"] = params["ticketErrorCauseNameLv2"] ? _.map(params["ticketErrorCauseNameLv2"], 'value') : [];
    params["lstErrorCauseLv3"] = params["ticketErrorCauseNameLv3"] ? _.map(params["ticketErrorCauseNameLv3"], 'value') : [];
    params["lstLevelError"] = params["levelError"] ? _.map(params["levelError"], 'value').filter(x => x) : [];
    params["status"] = params["status"] ? _.map(params["status"], 'value').filter(x => x) : [];

    this.checkAll = false;
    this.selection.clear();
    this.tickeErrorService.doSearch(params).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstDataTicketErrorCause = rs.data.listData;
        this.countTableTicketErrorCause = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      },
    );

  }

  dataChangeErrorLv1Filter() {
    this.formSearch.get('ticketErrorCauseLv1Filter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterErrorLevelOne();
    });
  }

  dataChangeErrorLv2Filter() {
    this.formSearch.get('ticketErrorCauseLv2Filter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterErrorLevelTwo();
    });
  }

  dataChangeErrorLv3Filter() {
    this.formSearch.get('ticketErrorCauseLv3Filter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterErrorLevelThree();
    });
  }

  filterErrorLevelOne() {
    this.searchGroupAll = false;
    if (!this.lstTicketErrorCauseLv1) {
      return;
    }

    // get the search keyword
    let search = this.formSearch.get('ticketErrorCauseLv1Filter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketErrorCauseLv1.next(this.lstTicketErrorCauseLv1.slice());
      if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length == this.lstTicketErrorCauseLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchGroupAll = true;
      } else {
        this.searchGroupAll = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketErrorCauseLv1.next(
        this.lstTicketErrorCauseLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
    }
  }

  filterErrorLevelTwo() {
    this.searchGroupAll2 = false;
    if (!this.lstTicketErrorCauseLv2) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get('ticketErrorCauseLv2Filter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketErrorCauseLv2.next(this.lstTicketErrorCauseLv2.slice());
      if (this.formSearch.controls.ticketErrorCauseNameLv2.value?.length == this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchGroupAll2 = true;
      } else {
        this.searchGroupAll2 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketErrorCauseLv2.next(
        this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
    }
  }

  filterErrorLevelThree() {
    this.searchGroupAll3 = false;
    if (!this.lstTicketErrorCauseLv3) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get('ticketErrorCauseLv3Filter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketErrorCauseLv3.next(this.lstTicketErrorCauseLv3.slice());
      if (this.formSearch.controls.ticketErrorCauseNameLv3.value?.length == this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.searchGroupAll3 = true;
      } else {
        this.searchGroupAll3 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketErrorCauseLv3.next(
        this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
    }
  }

  selectAll(event) {
    this.filteredTicketErrorCauseLv1.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.searchGroupAll = true;
          this.formSearch.controls.ticketErrorCauseNameLv1.patchValue(val);
          this.handleChangeErrorTwo();
        } else {
          this.searchGroupAll = false;
          this.searchGroupAll2 = false;
          this.searchGroupAll3 = false;
          this.formSearch.get('ticketErrorCauseNameLv1').setValue('');
          this.formSearch.get('ticketErrorCauseLv2Filter').setValue('');
          this.formSearch.get('ticketErrorCauseLv1Filter').setValue('');
          this.formSearch.get('ticketErrorCauseLv3Filter').setValue('');

          this.filteredTicketErrorCauseLv2 = new ReplaySubject;
          this.filteredTicketErrorCauseLv3 = new ReplaySubject;
        }
      });
  }

  selectAllTicketErrorCauseLv2(event) {
    this.searchGroupAll2 = false;
    let search = this.formSearch.get("ticketErrorCauseLv2Filter").value;
    this.filteredTicketErrorCauseLv2.next(
      this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.searchGroupAll2 = true;
      this.formSearch.controls.ticketErrorCauseNameLv2.patchValue(val);
      this.handleChangeErrorLvThree();
    } else {
      this.searchGroupAll2 = false
      this.searchGroupAll3 = false;
      this.formSearch.get('ticketErrorCauseNameLv2').setValue('');
      this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    }
  }

  selectAllTicketErrorCauseLv3(event) {
    this.searchGroupAll3 = false;
    let search = this.formSearch.get("ticketErrorCauseLv3Filter").value;
    this.filteredTicketErrorCauseLv3.next(
      this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.searchGroupAll3 = true;
      this.formSearch.controls.ticketErrorCauseNameLv3.patchValue(val);
    } else {
      this.searchGroupAll3 = false
      this.formSearch.get('ticketErrorCauseNameLv3').setValue('');
      this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    }
  }

  /* get list data ticket eror cause level 1 */
  getLstTicketErrorLvOne() {
    let params: object = {
      search: this.search,
    };
    this.isLoading = true;
    this.tickeErrorService.getListTickecErrorCauseByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketErrorCauseLv1 = data.map(val => ({ value: val.ticketErrorCauseId, label: val.name }));
      this.filterErrorLevelOne();
      this.filteredTicketErrorCauseLv2.next(this.lstTicketErrorCauseLv2.slice());
      this.dataChangeErrorLv2Filter();
    });
  }

  onChangeTicketErrorCauseLv1() {
    let search = this.formSearch.get("ticketErrorCauseLv1Filter").value;

    if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length == this.lstTicketErrorCauseLv1.length) {
      this.searchGroupAll = true;
      this.handleChangeErrorTwo();
    } else if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length == 0) {
      this.formSearch.get('ticketErrorCauseNameLv1').setValue("");
    } else if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length == this.lstTicketErrorCauseLv1.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchGroupAll = true;
      this.handleChangeErrorTwo();
    } else {
      this.searchGroupAll = false;
      this.searchGroupAll2 = false;
      this.searchGroupAll3 = false;
      this.handleChangeErrorTwo();
      this.lstTicketErrorCauseLv2 = [];
      this.lstTicketErrorCauseLv3 = [];
      this.formSearch.get('ticketErrorCauseNameLv2').setValue('');
      this.formSearch.get('ticketErrorCauseNameLv3').setValue('');
      this.filteredTicketErrorCauseLv2 = new ReplaySubject;
      this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    }
  }

  handleChangeErrorTwo() {
    this.formSearch.controls.ticketErrorCauseNameLv2.setValue(null);
    this.lstTicketErrorCauseLv2 = [];
    if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length > 0) {
      this.getListTicketErrorLvTwo(this.formSearch.controls.ticketErrorCauseNameLv1.value.filter(item => item !== -1));
    }
  }

  getListTicketErrorLvTwo(parentId) {
    let lstParentId = parentId ? _.map(parentId, 'value') : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
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

  onChangeTicketErrorCauseLv2() {
    let search = this.formSearch.get("ticketErrorCauseLv2Filter").value;

    if (this.formSearch.controls.ticketErrorCauseNameLv2.value?.length == this.lstTicketErrorCauseLv2.length) {
      this.searchGroupAll2 = true;
      this.handleChangeErrorLvThree();
    } else if (this.formSearch.controls.ticketErrorCauseNameLv2.value?.length == 0) {
      this.formSearch.get('ticketErrorCauseNameLv2').setValue("");
      this.searchGroupAll2 = false;
    } else if (this.formSearch.controls.ticketErrorCauseNameLv2.value?.length == this.lstTicketErrorCauseLv2.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchGroupAll2 = true;
      this.handleChangeErrorLvThree();
    } else {
      this.searchGroupAll2 = false;
      this.searchGroupAll3 = false;
      this.handleChangeErrorLvThree();
      this.lstTicketErrorCauseLv3 = [];
      this.formSearch.get('ticketErrorCauseNameLv3').setValue('');
      this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    }
  }

  onChangeTicketErrorCauseLv3() {
    let search = this.formSearch.get("ticketErrorCauseLv3Filter").value;

    if (this.formSearch.controls.ticketErrorCauseNameLv3.value?.length == this.lstTicketErrorCauseLv3.length) {
      this.searchGroupAll3 = true;
    } else if (this.formSearch.controls.ticketErrorCauseNameLv3.value?.length == 0) {
      this.formSearch.get('ticketErrorCauseNameLv3').setValue("");
    } else if (this.formSearch.controls.ticketErrorCauseNameLv3.value?.length == this.lstTicketErrorCauseLv3.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.searchGroupAll3 = true;
    } else {
      this.searchGroupAll3 = false;
    }
  }

  handleChangeErrorLvThree() {
    this.formSearch.controls.ticketErrorCauseNameLv3.setValue(null);
    this.lstTicketErrorCauseLv3 = [];
    if (this.formSearch.controls.ticketErrorCauseNameLv1.value?.length > 0) {
      this.getListTicketErrorLvThree(this.formSearch.controls.ticketErrorCauseNameLv2.value.filter(item => item !== -1));
    }
  }

  /* get list data ticket expire cause level 3 */
  getListTicketErrorLvThree(parentId) {
    let lstParentId = parentId ? _.map(parentId, 'value') : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
    };
    this.tickeErrorService.getListTickecErrorCauseByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketErrorCauseLv3 = data.map(val => ({ value: val.ticketErrorCauseId, label: val.name }));
      this.filteredTicketErrorCauseLv3.next(this.lstTicketErrorCauseLv3.slice());
      this.dataChangeErrorLv3Filter();
      this.filterErrorLevelThree();
    });
  }


  setValueToObject(searchObj: any) {
    throw new Error('Method not implemented.');
  }

  onClickInsertErrorCause() {
    let dataParams: object = {
      title: 'THÊM MỚI NGUYÊN NHÂN LỖI',
    }
    const dialog = this.dialog.open({
      width: '1200px',
      data: dataParams,
      disableClose: true,
    }, DialogCreateTicketErrorCauseComponent);

    dialog.afterClosed().subscribe(res => {
      this.formSearch.get('ticketErrorCauseNameLv1').setValue('');
      this.clearTicketErrorCause1();
      this.getLstTicketErrorLvOne();
      this.doSearch();
    });
  }

  onClickEditErrorCause(data: any): any {
    let dataParams: object = {
      title: 'CHỈNH SỬA NGUYÊN NHÂN LỖI',
      data: data,
    }
    const dialog = this.dialog.open({
      width: '1200px',
      data: dataParams,
      disableClose: true,
    }, DialogCreateTicketErrorCauseComponent);

    dialog.afterClosed().subscribe(res => {
      this.getLstTicketErrorLvOne();
      this.doSearch();
    });
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
        obj['checked'] = true;
      });
    } else {
      this.checkAll = false;
      this.lstDataTicketErrorCause.forEach((obj: any) => {
        obj['checked'] = false;
      });
    }
  }

  onCheckItem(_ob: MatCheckboxChange) {
    let itemCheck = _.filter(this.lstDataTicketErrorCause, (obj: any) => {
      return obj['checked'] === true;
    });
    if (itemCheck && itemCheck.length === this.lstDataTicketErrorCause.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }


  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(",");
    }
    return "";
  }

  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.lstDataTicketErrorCause.forEach(row => {
        row.selected = false;
      });
    } else {
      this.lstDataTicketErrorCause.forEach(row => {
        this.selection.select(row);
        row.selected = true;
      });
    }
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  // Checkbox Select Onee
  checkChange(row) {
    this.selection.toggle(row);
    row.selected = !this.selection.isSelected(row) ? false : true;
  }

  onChangeStatus() {
    this.doSearch();
  }

  doChangeStatus(item: any) {
    if (item != null) {
      if (item.status == 0) {
        this.messageConfirm = this.translateService.instant("cateConfig.ticketType.expireToEffect");
      }
      if (item.status == 1) {
        this.messageConfirm = this.translateService.instant("cateConfig.ticketType.effectToExpire");
      }
      const dialogData = new ConfirmDialogModel(this.translateService.instant('cateConfig.ticketType.changeStatus'), this.messageConfirm);
      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this.isLoading = true;
          let params: Object = {
            ticketErrorCauseId: item.ticketErrorCauseId,
            status: item.status,
          };
          this.tickeErrorService.changeStatusTicketErrorCause(params).subscribe(rs => {
            this.isLoading = false;
            this.selection.clear();
            if (rs) {
              this.toars.success(this.translateService.instant('cateConfig.ticketType.changeSuccess'));
              this.doSearch();
            }
          }, () => {
            this.isLoading = false;
            this.toars.error(this.translateService.instant('common.500Error'));
          });
        }
      });
    }
  }

  onChangeStatusMultiple() {

    let dataCheck = _.filter(this.lstDataTicketErrorCause, (obj: any) => {
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
            return obj['status'] === 1;
          });
          let lstIdsInactive = _.filter(dataCheck, (obj: any) => {
            return obj['status'] === 0;
          });
          let params: object = {
            lstIdsActive: _.map(lstIdsActive, 'ticketErrorCauseId'),
            lstIdsInactive: _.map(lstIdsInactive, 'ticketErrorCauseId'),
          };
          this.tickeErrorService.approveChangeStatusTicketErrorCause(params).subscribe(rs => {
            this.isLoading = false;
            this.selection.clear();
            if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
              this.toars.success(this.translateService.instant('cateConfig.ticketType.changeSuccess'));
              this.checkAll = false;
              this.doSearch();
            } else {
              this.toars.error(this.translateService.instant('cateConfig.ticketType.changeError'));
            }
          }, () => {
            this.isLoading = false;
            this.toars.error(this.translateService.instant('common.500Error'));
          });
        }
      });
    } else {
      this.toars.warning("Chọn ít nhất một bản ghi đổi trạng thái", "Cảnh báo");
    }
  }

  onChangeLevelErrorAll() {
    if (this.levelError.selected) {
      this.formSearch.controls.levelError.setValue([...this.lstLevelError, -1]);
    } else {
      this.formSearch.controls.levelError.setValue("");
    }
  }

  clearTicketErrorCause1() {
    this.filteredTicketErrorCauseLv2 = new ReplaySubject;
    this.lstTicketErrorCauseLv2 = [];
    this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    this.lstTicketErrorCauseLv3 = [];
    this.formSearch.get('ticketErrorCauseNameLv2').setValue('');
    this.formSearch.get('ticketErrorCauseNameLv3').setValue('');
    this.searchGroupAll = false;
    this.searchGroupAll2 = false;
    this.searchGroupAll3 = false;

  }

  clearTicketErrorCause2() {
    this.filteredTicketErrorCauseLv3 = new ReplaySubject;
    this.lstTicketErrorCauseLv3 = [];
    this.formSearch.get('ticketErrorCauseNameLv3').setValue('');
    this.searchGroupAll2 = false;
    this.searchGroupAll3 = false;
  }
  clearTicketErrorCause3() {
    this.searchGroupAll3 = false;
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

  onChangeLevelError() {

    if (this.levelError.selected) {
      this.levelError.deselect();
    }
    if (this.formSearch.controls.levelError.value.length == this.lstLevelError.length) {
      this.levelError.select();
    }
  }
}

import {
  NgxMatDateAdapter,
  NgxMatDateFormats, NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { TicketGenreEditComponent } from '@app/routes/cate-config/ticket-genre/ticket-genre-edit/ticket-genre-edit.component';
import { CustomDateAdapter } from '@app/routes/special-vehicle-management/custom-date';
import { RESOURCE } from '@core';
import { TicketGenreService } from '@core/services/cate-config/ticket-genre.service';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { GROUP_REFLECTS_STATUS, HTTP_CODE, STATUS_TICKET_TYPE } from '@shared';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/components/confirm-dialog/confirm-dialog.component';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { Subject } from 'rxjs/internal/Subject';
import { take } from 'rxjs/operators';

const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'l, LTS',
  },
  display: {
    dateInput: 'l, LTS',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-ticket-genre',
  templateUrl: './ticket-genre.component.html',
  styleUrls: ['./ticket-genre.component.scss'],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter },
  ],
})
export class TicketGenreComponent extends BaseComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() pageIndex: number;
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild('status') private status: MatOption;
  @ViewChild('ticketGroupsTag') private ticketGroupsTag: MatOption;
  filteredTicketGenre: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketGroup: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();
  ticketTypeId!: string;
  lstDataTicketGenre: any = [];
  lstTicketGroup: any = [];
  ticketGroup!: string;
  activeStatus: number = -1;
  formSearch!: FormGroup;
  search: any = 0;
  isEdit;
  canEdit: true;
  pageSizeList = [10, 50, 100];
  startRecord: 0;
  checkAll: any = false;
  isChecked: boolean = false;
  isCheckedGenre: boolean = false;
  messageConfirm: any;
  lstType: any = [];
  displayedColumnsGenre: any = [];
  lstTicketGenre: any = [];

  selection = new SelectionModel<any>(true, []);
  statusTicketType = STATUS_TICKET_TYPE;
  dataSource = new MatTableDataSource<any>();
  countTableTicketGenre = 0;

  // pageSize: 10;
  statuses = [
    {
      value: GROUP_REFLECTS_STATUS.HIEU_LUC,
      label: this.translateService.instant('cateConfig.inEffect'),
    },
    {
      value: GROUP_REFLECTS_STATUS.HET_HIEU_LUC,
      label: this.translateService.instant('cateConfig.expire'),
    },
  ];

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketGenreService: TicketGenreService,
    private fb: FormBuilder,
    public dialog?: MtxDialog,
  ) {
    super(ticketGenreService, RESOURCE.CC_EXPIRE_CAUSE, toars, translateService);
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
    this.filteredTicketGroup.next(this.lstTicketGroup.slice());
    this.dataChangeTicketGroupFilter();
    this.mapData();
  }

  async mapData() {
    await this.getListTicketGroup();
  }

  customViewDescription(strView: string): string {
    if (strView && strView.length > 65) return strView.substring(0, 65) + ' ...';
    else return strView;
  }

  customViewName(strView: string): string {
    if (strView && strView.length > 50) return strView.substring(0, 50) + ' ...';
    else return strView;
  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', width: '40px' },//STT
      { i18n: '', field: 'select', width: '30px' },
      { i18n: 'cateConfig.ticket-genre.table.action', field: 'action', width: '80px' },//Tác động
      { i18n: 'cateConfig.ticket-genre.table.ticketGroup', field: 'ticketGroup', width: '300px' },//Nhóm phản ánh
      { i18n: 'cateConfig.ticket-genre.table.ticketGenreCode', field: 'ticketTypeCode', width: '150px' },//Mã thể loại phản ánh
      { i18n: 'cateConfig.ticket-genre.table.ticketGenreName', field: 'ticketTypeName', width: '300px' },//Tên thể loại phản ánh
      { i18n: 'cateConfig.ticket-genre.table.createDate', field: 'createDate', width: '150px' },//Ngày tạo
      { i18n: 'cateConfig.ticket-genre.table.createuser', field: 'createUser', width: '130px' },//Người tạo
      { i18n: 'cateConfig.ticketType.updateDate', field: 'updateDate', width: '150px' },//Ngày cập nhật
      { i18n: 'cateConfig.ticketType.updateUser', field: 'updateUser', width: '130px' },//Người cập nhật
      { i18n: 'cateConfig.ticket-genre.table.ticketDes', field: 'description', width: '350px' },//Mô tả
      { i18n: 'cateConfig.ticket-genre.search.status', field: 'status', width: '120px' },//Trạng thái
    ];
    this.displayedColumnsGenre = this.columns.map(x => x.field);
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketGroupFilter: '',
      ticketGroup: [''], //Nhóm phản ánh
      ticketGenre: [''],
      // ticketTypeCode: "",//Mã loại phản ánh
      // ticketTypeName: "",//Tên loại phản ánh
      formDate: '',//Từ ngày
      toDate: '',//Đến ngày
      createUser: '',
      updateUser: '',
      inEffect: '', // Đang hiệu lực
      expire: '', // Hết hiệu lực
      ticketGenreFilter: '',
      startRecord: 0,
      pageSize: this.pageSizeList[0],
      status: '',
    });
  }

  dataChangeTicketGroupFilter() {
    this.formSearch.get('ticketGroupFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGroup();
    });
  }

  dataChangeTicketGenreFilter() {
    this.formSearch.get('ticketGenreFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGenre();
    });
  }

  getValueOfField(item: any) {
    return this.formSearch.get(item)?.value;
  }

  onChangeStatus() {
    this.doSearch();
  }

  doSearch() {
    this.selection.clear();
    this.checkAll = false;
    this.isLoading = true;
    let params = this.formSearch.getRawValue();
    params['ticketTypeLevel'] = 2;
    params['lstTicketTypeGroupId'] = params['ticketGroup'] ? _.map(params['ticketGroup'], 'value') : [];
    params['lstTicketTypeGenreId'] = params['ticketGenre'] ? _.map(params['ticketGenre'], 'value') : [];
    params['status'] = params['status'] ? _.map(params['status'], 'value').filter(x => x) : [];

    this.ticketGenreService.doSearch(params).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstDataTicketGenre = rs.data.listData;
        this.countTableTicketGenre = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      },
    );
  }

  getListTicketGroup() {
    let params: object = {
      search: this.search,
    };
    this.ticketGenreService.getTicketTypeByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketGroup = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
      this.filterTicketGroup();
      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      this.dataChangeTicketGenreFilter();
    });
  }

  filterTicketGroup() {
    if (!this.lstTicketGroup) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get('ticketGroupFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketGroup.next(this.lstTicketGroup.slice());
      if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isChecked = true;
      } else {
        this.isChecked = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGroup.next(
        this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if (this.isChecked == true) {
        this.isChecked = true;
      } else {
        this.isChecked = false;
      }
    }
  }

  selectAll(event) {
    this.filteredTicketGroup.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.isChecked = true;
          this.formSearch.controls.ticketGroup.patchValue(val);
          this.handleChangeTicketGenre();
        } else {
          this.isCheckedGenre = false;
          this.isChecked = false;
          this.formSearch.get('ticketGroup').setValue('');
          this.filteredTicketGenre = new ReplaySubject;
        }
      });
  }

  onCheckAll(ob: MatCheckboxChange) {
    if (ob && ob.checked === true) {
      this.lstDataTicketGenre.forEach((obj: any) => {
        obj['checked'] = true;
      });
    } else {
      this.checkAll = false;
      this.lstDataTicketGenre.forEach((obj: any) => {
        obj['checked'] = false;
      });
    }
  }

  onCheckItem(ob: MatCheckboxChange) {
    let itemCheck = _.filter(this.lstDataTicketGenre, (obj: any) => {
      return obj['checked'] === true;
    });
    if (itemCheck && itemCheck.length === this.lstDataTicketGenre.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.lstDataTicketGenre ? this.lstDataTicketGenre.length : 0;
    return numSelected === numRows;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  // Checkbox Select one

  checkChange(row) {
    this.selection.toggle(row);
    row.selected = !this.selection.isSelected(row) ? false : true;
  }

  // Checkbox Select All
  checkEditStatusButtonDisable(): boolean {
    return this.selection.selected?.length === 0;
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.formSearch.controls.status.setValue([...this.statuses, -1]);
    } else {
      this.formSearch.controls.status.setValue('');
    }
  }

  // Click 1 trạng thái
  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.formSearch.controls.status.value?.length == 0) {
      this.formSearch.get('status').setValue('');
    }
    if (this.formSearch.controls.status.value.length == this.statuses.length) {
      this.allStatus.select();
    }
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.selection.clear();
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

  doCreate() {
    let params: object = {
      title: 'THÊM MỚI THỂ LOẠI PHẢN ÁNH',
    };
    const dialog = this.dialog.open({
      width: '60%',
      height: 'auto',
      data: params,
      disableClose: true,
    }, TicketGenreEditComponent);

    dialog.afterClosed().subscribe(res => {
      this.formSearch.get('ticketGroup').setValue('');
      this.formSearch.get('ticketGenre').setValue('');
      this.filteredTicketGenre = new ReplaySubject;
      this.lstTicketGroup = [];
      this.lstTicketGenre = [];
      this.isChecked = false;
      this.isCheckedGenre = false;
      this.getListTicketGroup();
      this.doSearch();
    });
  }

  onChangeStatusMultiple() {
    let dataCheck = _.filter(this.lstDataTicketGenre, (obj: any) => {
      return obj['checked'] === true;
    });
    if (dataCheck && dataCheck.length > 0) {
      let lstIdsActive = _.filter(dataCheck, (obj: any) => {
        return obj['status'] === 1;
      });
      let lstIdsInactive = _.filter(dataCheck, (obj: any) => {
        return obj['status'] === 0;
      });
      if (lstIdsInactive.length > 0 && lstIdsActive.length > 0) {
        this.isLoading = false;
        this.toars.warning(this.translateService.instant('Phải chọn các bản ghi có cùng trạng thái', 'Cảnh báo'));
        return;
      }

      if (dataCheck[0].status == 1) {
        this.messageConfirm = this.translateService.instant('cateConfig.ticketType.effectToExpire');
      }
      if (dataCheck[0].status == 0) {
        this.messageConfirm = this.translateService.instant('cateConfig.ticketType.expireToEffect');
      }
      const dialogData = new ConfirmDialogModel(this.translateService.instant('cateConfig.ticketType.changeStatus'), this.messageConfirm);
      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
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
            lstIdsActive: _.map(lstIdsActive, 'ticketTypeId'),
            lstIdsInactive: _.map(lstIdsInactive, 'ticketTypeId'),
          };
          this.ticketGenreService.approveChangeStatus(params).subscribe(rs => {
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
      this.toars.warning('Chọn ít nhất một bản ghi đổi trạng thái', 'Cảnh báo');
    }
  }

  doChangeStatus(item: any) {
    if (item != null) {
      if (item.status == 0) {
        this.messageConfirm = this.translateService.instant('cateConfig.ticketType.expireToEffect');
      }
      if (item.status == 1) {
        this.messageConfirm = this.translateService.instant('cateConfig.ticketType.effectToExpire');
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
            ticketTypeId: item.ticketTypeId,
            status: item.status,
          };
          this.ticketGenreService.changeStatus(params).subscribe(rs => {
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

  getListTicketGenre(parentId) {
    let lstParentId = parentId ? _.map(parentId, 'value') : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
    };
    this.ticketGenreService.getTicketTypeByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketGenre = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      this.dataChangeTicketGenreFilter();
      this.filterTicketGenre();
    });
  }

  filterTicketGenre() {
    if (!this.lstTicketGenre) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get('ticketGenreFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isCheckedGenre = true;
      } else {
        this.isCheckedGenre = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGenre.next(
        this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if (this.isCheckedGenre == true) {
        this.isCheckedGenre = true;
      } else {
        this.isCheckedGenre = false;
      }
      this.dataChangeTicketGenreFilter();
    }
  }

  onChangeTicketGroup() {
    let search = this.formSearch.get("ticketGroupFilter").value;
    if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.length) {
      this.isChecked = true;
      this.handleChangeTicketGenre();
    } else if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isChecked = true;
      this.handleChangeTicketGenre();
    } else if (this.formSearch.controls.ticketGroup.value?.length == 0) {
      this.formSearch.get('ticketGroup').setValue('');
    } else {
      this.isChecked = false;
      this.isCheckedGenre = false;
    }
    this.isCheckedGenre = false;
    this.handleChangeTicketGenre();
    this.formSearch.get('ticketGenre').setValue('');
    this.filteredTicketGenre = new ReplaySubject;
  }

  onChangeTicketGenre() {
    this.isCheckedGenre = false;
    let search = this.formSearch.get("ticketGenreFilter").value;
    if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.length) {
      this.isCheckedGenre = true;
    } else if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isCheckedGenre = true;
    } else if (this.formSearch.controls.ticketGenre.value?.length == 0) {
      this.formSearch.get('ticketGenre').setValue('');
    } else {
      this.isCheckedGenre = false;
    }
  }

  handleChangeTicketGenre() {
    this.formSearch.controls.ticketGenre.setValue('');
    this.lstTicketGenre = [];
    this.filteredTicketGenre = new ReplaySubject;
    if (this.formSearch.controls.ticketGroup.value?.length > 0) {
      this.getListTicketGenre(this.formSearch.controls.ticketGroup.value.filter(item => item !== -1));
    }
  }

  selectAllTicketGenre(event) {
    this.isCheckedGenre = false;
    let search = this.formSearch.get("ticketGenreFilter").value;
    this.filteredTicketGenre.next(
      this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isCheckedGenre = true;
      this.formSearch.controls.ticketGenre.patchValue(val);
    } else {
      this.isCheckedGenre = false;
      this.formSearch.get('ticketGenre').setValue('');
    }
  }

  clearTicketGroup($event) {
    this.formSearch.get('ticketGroup').setValue('');
    this.formSearch.get('ticketGenre').setValue('');
    $event.stopPropagation();
    this.isChecked = false;
    this.isCheckedGenre = false;
    this.filteredTicketGenre = new ReplaySubject;
    this.lstTicketGenre = [];
  }

  clearTicketGenre($event) {
    this.formSearch.get('ticketGenre').setValue('');
    $event.stopPropagation();
    this.isCheckedGenre = false;
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

  checkInputData(key) {
    const value = this.formSearch?.get(key)?.value;
    return value !== undefined && value !== null && value !== '';
  }

  btnClear() {
    this.isCheckAll = false;
    this.formSearch.get('ticketGroup').setValue('');
  }
}


import {
  NgxMatDateAdapter,
  NgxMatDateFormats, NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TicketTypeCreateComponent } from '@app/routes/cate-config/ticket-type/ticket-type-create/ticket-type-create.component';
import { CustomDateAdapter } from '@app/routes/special-vehicle-management/custom-date';
import { RESOURCE } from '@core';
import { SelectOptionModel } from '@core/models/common.model';
import { TicketTypeService } from '@core/services/cate-config/ticket-type.service';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { GROUP_REFLECTS_STATUS, HTTP_CODE, STATUS_TICKET_TYPE } from '@shared';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/components/confirm-dialog/confirm-dialog.component';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/internal/operators/take';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

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
  selector: 'app-ticket-type',
  templateUrl: './ticket-type.component.html',
  styleUrls: ['./ticket-type.component.scss'],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter },
  ],
})
export class TicketTypeComponent extends BaseComponent implements OnInit {
  form!: FormGroup;
  titleTab;
  isEdit;
  canEdit: true;
  countTableType = 0;
  lstType: any = [];
  isToggleAll: boolean = false;
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild('status') private status: MatOption;
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
  displayedColumnsType: any = [];
  lstTicketGenre: any = [];
  lstTicketGroup: any = [];
  lstTicketType: any = [];
  listOption: SelectOptionModel[] = [] as SelectOptionModel[];
  lstDataTicketType: any = [];
  selection = new SelectionModel<any>(true, []);
  statusTicketType = STATUS_TICKET_TYPE;
  dataSource = new MatTableDataSource<any>();
  title!: string;
  ticketTypeId!: string;
  label!: string;
  ticketGroup!: string;
  ticketGenre!: string;
  ticketTypeCode!: string;
  ticketTypeName!: string;
  formDate!: string;
  countTableTicketType = 0;
  pageSizeList = [10, 50, 100];
  checkAll: any = false;
  search: any = 0;
  isUncheckGroup: boolean = false;
  isUncheckGenre: boolean = false;
  isUncheckType: boolean = false;
  filteredTicketGroup: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketGenre: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketType: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();
  messageConfirm: any;

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketTypeService: TicketTypeService,
    private fb: FormBuilder,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
  ) {
    super(ticketTypeService, RESOURCE.CC_CATE_CONFIG, toars, translateService);
  }

  customViewDescription(strView: string): string {
    if (strView && strView.length > 65) return strView.substring(0, 65) + ' ...';
    else return strView;
  }

  customViewName(strView: string): string {
    if (strView && strView.length > 50) return strView.substring(0, 50) + ' ...';
    else return strView;
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', width: '40px' },//STT
      { i18n: '', field: 'select', width: '30px' },
      { i18n: 'common.action', field: 'action', width: '140px' },//Tác động
      { i18n: 'cateConfig.ticketType.ticketGroup', field: 'ticketGroup', width: '300px' },//Nhóm phản ánh
      { i18n: 'cateConfig.ticketType.ticketGenre', field: 'ticketGenre', width: '300px' },//Thể loại phản ánh
      { i18n: 'cateConfig.ticketType.ticketTypeCode', field: 'ticketTypeCode', width: '150px' },//Mã loại phản ánh
      { i18n: 'cateConfig.ticketType.ticketTypeName', field: 'ticketTypeName', width: '300px' },//Tên loại phản ánh
      { i18n: 'cateConfig.ticketType.createDate', field: 'createDate', width: '150px' },//Ngày tạo
      { i18n: 'cateConfig.ticketType.createUser', field: 'createUser', width: '130px' },//Người tạo
      { i18n: 'cateConfig.ticketType.updateDate', field: 'updateDate', width: '150px' },//Ngày tạo
      { i18n: 'cateConfig.ticketType.updateUser', field: 'updateUser', width: '130px' },//Người tạo
      { i18n: 'cateConfig.ticketType.ticketTemplate', field: 'ticketTemplate', width: '400px' },//Form nhap
      { i18n: 'cateConfig.ticketType.status', field: 'status', width: '120px' },//Trạng thái
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
      ticketGroupFilter: '', //Filter Nhóm phản ánh
      ticketGenreFilter: '', //Filter Thể loại phản ánh
      ticketTypeFilter: '', //Filter Loại phản ánh
      ticketGroup: [''], //Nhóm phản ánh
      ticketGenre: [''], //Thể loại phản ánh
      ticketTypeCode: [''],//Mã loại phản ánh
      ticketTypeName: [''],//Tên loại phản ánh
      formDate: '',//Từ ngày
      toDate: '',//Đến ngày
      inEffect: '', // Đang hiệu lực
      expire: '', // Hết hiệu lực
      createUser: '',//Người tạo
      ticketType: '',
      startRecord: 0,
      pageSize: this.pageSizeList[0],
      status: '',
    });
  }

  doUpdate(data: any): any {
    let params: object = {
      title: this.translateService.instant('cateConfig.ticketType.update'),
      data: data,
    };

    const dialog = this.dialog.open({
      width: '1200px',
      data: params,
      disableClose: true,
    }, TicketTypeCreateComponent);

    dialog.afterClosed().subscribe(() => {
      this.btnClearGroup();
      this.getListTicketGroup();
      this.doSearch();
    });
  }

  doCreate() {
    let params: object = {
      title: this.translateService.instant('cateConfig.ticketType.create'),
    };

    const dialog = this.dialog.open({
      width: '60%',
      data: params,
      disableClose: true,
    }, TicketTypeCreateComponent);

    dialog.afterClosed().subscribe(() => {
      this.btnClearGroup();
      this.getListTicketGroup();
      this.doSearch();
    });
  }

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

  onCheckAll(ob: MatCheckboxChange) {
    if (ob && ob.checked === true) {
      this.lstDataTicketType.forEach((obj: any) => {
        obj['checked'] = true;
      });
    } else {
      this.checkAll = false;
      this.lstDataTicketType.forEach((obj: any) => {
        obj['checked'] = false;
      });
    }
  }

  onCheckItem(ob: MatCheckboxChange) {
    let itemCheck = _.filter(this.lstDataTicketType, (obj: any) => {
      return obj['checked'] === true;
    });
    if (itemCheck && itemCheck.length === this.lstDataTicketType.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  doSearch() {

    this.isLoading = true;
    this.selection.clear();
    this.checkAll = false;
    let params = this.form.getRawValue();
    params['ticketTypeLevel'] = 3;
    params['lstTicketTypeGroupId'] = params['ticketGroup'] ? _.map(params['ticketGroup'], 'value') : [];
    params['lstTicketCategoryId'] = params['ticketGenre'] ? _.map(params['ticketGenre'], 'value') : [];
    params['lstTicketType'] = params['ticketType'] ? _.map(params['ticketType'], 'value') : [];
    params['status'] = params['status'] ? _.map(params['status'], 'value').filter(x => x) : [];

    this.ticketTypeService.doSearch(params).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstDataTicketType = rs.data.listData;
        this.countTableTicketType = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      },
    );
  }

  // Click Tất cả trạng thái
  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.form.controls.status.setValue([...this.statuses, -1]);
    } else {
      this.form.controls.status.setValue('');
    }
  }

  // Click 1 trạng thái
  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.form.controls.status.value?.length == 0) {
      this.form.get('status').setValue('');
    }
    if (this.form.controls.status.value.length == this.statuses.length) {
      this.allStatus.select();
    }
  }

  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  setValueToField(item: any, data: any) {
    return this.form.get(item)?.setValue(data);
  }

  getListTicketGroup() {
    let params: object = {
      search: this.search,
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
    let lstParentId = parentId ? _.map(parentId, 'value') : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketGenre = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));

      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      this.filterTicketGenre();
      this.filteredTicketType.next(this.lstTicketType.slice());
      this.dataChangeTicketTypeFilter();
    });
  }

  getListTicketType(parentId) {
    let lstParentId = parentId ? _.map(parentId, 'value') : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: 0,
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketType = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
      this.filteredTicketType.next(this.lstTicketType.slice());
      this.dataChangeTicketTypeFilter();
      this.filterTicketType();
    });
  }

  dataChangeTicketGroupFilter() {
    this.form.get('ticketGroupFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGroup();
    });
  }

  dataChangeTicketGenreFilter() {
    this.form.get('ticketGenreFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGenre();
    });
  }

  filterTicketGroup() {
    if (!this.lstDataTicketType) {
      return;
    }
    // get the search keyword
    let search = this.form.get('ticketGroupFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketGroup.next(this.lstTicketGroup.slice());
      if (this.form.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isUncheckGroup = true;
      } else {
        this.isUncheckGroup = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGroup.next(
        this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if(this.isUncheckGroup == true) {
        this.isUncheckGroup = true;
      } else {
        this.isUncheckGroup = false;
      }
    }
  }

  filterTicketGenre() {
    if (!this.lstTicketGenre) {
      return;
    }
    // get the search keyword
    let search = this.form.get('ticketGenreFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      if (this.form.controls.ticketGenre.value?.length == this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isUncheckGenre = true;
      } else {
        this.isUncheckGenre = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGenre.next(
        this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1),
      );
      if(this.isUncheckGenre == true) {
        this.isUncheckGenre = true;
      } else {
        this.isUncheckGenre = false;
      }
    }
  }

  handleChangeTicketGroup() {
    this.form.controls.ticketGenre.setValue(null);
    this.lstTicketGenre = [];
    if (this.form.controls.ticketGroup.value?.length > 0) {
      this.getListTicketGenre(this.form.controls.ticketGroup.value.filter(item => item !== -1));
    }
  }

  onChangeTicketGroup() {
    let search = this.form.get("ticketGroupFilter").value;
    if (this.form.controls.ticketGroup.value?.length == this.lstTicketGroup.length) {
      this.isUncheckGroup = true;
    } else if (this.form.controls.ticketGroup.value?.length == 0) {
      this.form.get('ticketGroup').setValue('');
      this.isUncheckGroup = false;
    } else if (this.form.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isUncheckGroup = true;
      this.handleChangeTicketGenre();
    } else {
      this.isUncheckGroup = false;
      this.isUncheckGenre = false;
      this.isUncheckType = false;
      this.handleChangeTicketGenre();
      this.form.get('ticketGenre').setValue('');
      this.lstTicketGenre = [];
      this.lstTicketType = [];
      this.form.get('ticketType').setValue('');
      this.filteredTicketGenre = new ReplaySubject;
      this.filteredTicketType = new ReplaySubject;
    }
  }

  onChangeTicketGenre() {
    let search = this.form.get("ticketGenreFilter").value;

    if (this.form.controls.ticketGenre.value?.length == this.lstTicketGenre.length) {
      this.isUncheckGenre = true;
    } else if (this.form.controls.ticketGroup.value?.length == 0) {
      this.form.get('ticketGenre').setValue('');
      this.isUncheckGenre = false;
    } else if (this.form.controls.ticketGenre.value?.length == this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isUncheckGenre = true;
      this.handleChangeTicketType();
    } else {
      this.isUncheckGenre = false;
      this.isUncheckType = false;
      this.lstTicketType = [];
      this.form.get('ticketType').setValue('');
      this.filteredTicketType = new ReplaySubject;
      this.handleChangeTicketType();
    }
  }

  handleChangeTicketGenre() {
    this.form.controls.ticketGenre.setValue(null);
    this.lstTicketGenre = [];
    if (this.form.controls.ticketGroup.value?.length > 0) {
      this.getListTicketGenre(this.form.controls.ticketGroup.value.filter(item => item !== -1));
    }
  }

  handleChangeTicketType() {
    this.form.controls.ticketType.setValue('');
    this.lstTicketType = [];
    if (this.form.controls.ticketGenre.value?.length > 0) {
      this.getListTicketType(this.form.controls.ticketGenre.value.filter(item => item !== -1));
    }
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  onChangeStatusMultiple() {
    let dataCheck = _.filter(this.lstDataTicketType, (obj: any) => {
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
          this.ticketTypeService.approveChangeStatus(params).subscribe(rs => {
            this.isLoading = false;
            this.selection.clear();
            if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
              this.toars.success(this.translateService.instant('cateConfig.ticketType.changeSuccess'));
              this.checkAll = false;
              this.doSearch();
            } else {
              this.toars.warning(this.translateService.instant('cateConfig.ticketType.changeError'));
            }
          }, () => {
            this.isLoading = false;
            this.toars.error(this.translateService.instant('common.500Error'));
          });
        }
      });
    } else {
      this.toars.warning(this.translateService.instant('cateConfig.ticketType.checkedStatus'));
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
          this.ticketTypeService.changeStatus(item).subscribe(rs => {
            this.isLoading = false;
            if (rs) {
              this.toars.success(this.translateService.instant('cateConfig.ticketType.changeSuccess'));
              this.doSearch();
            } else {
              this.toars.warning(this.translateService.instant('cateConfig.ticketType.changeError'));
            }
          }, () => {
            this.isLoading = false;
            this.toars.error(this.translateService.instant('common.500Error'));
          });
        }
      });
    }
  }

  selectAll(event) {
    this.form.get('ticketGroup').setValue('');
    this.filteredTicketGroup.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.isUncheckGroup = true
          this.form.controls.ticketGroup.patchValue(val);
          this.handleChangeTicketGenre();
        } else {
          this.isUncheckGroup = false;
          this.btnClearGroup();
        }
      });
  }

  selectAllTicketGenre(event) {
    this.isUncheckGenre = false;
    let search = this.form.get("ticketGenreFilter").value;
    this.filteredTicketGenre.next(
      this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isUncheckGenre = true;
      this.form.controls.ticketGenre.patchValue(val);
      this.handleChangeTicketType();
    } else {
      this.isUncheckGenre = false;
      this.isUncheckType = false;
      this.filteredTicketType = new ReplaySubject;
      this.form.get('ticketGenre').setValue('');
      this.form.get('ticketType').setValue('');
    }
  }

  selectAllTicketType(event) {
    this.isUncheckType = false;
    let search = this.form.get("ticketTypeFilter").value;
    this.filteredTicketType.next(
      this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isUncheckType = true;
      this.form.controls.ticketType.patchValue(val);
    } else {
      this.isUncheckType = false;
      this.form.get('ticketType').setValue('');
    }
    /*this.filteredTicketType.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.isUncheckType = true;
          this.form.controls.ticketType.setValue(val);
        } else {
          this.btnClearType();
        }
      });*/
  }

  filterTicketType() {
    if (!this.lstTicketType) {
      return;
    }
    // get the search keyword
    let search = this.form.get('ticketTypeFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketType.next(this.lstTicketType.slice());
      if (this.form.controls.ticketType.value?.length == this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isUncheckType = true;
      } else {
        this.isUncheckType = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketType.next(
        this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1),
      );
      if(this.isUncheckType == true) {
        this.isUncheckType = true;
      } else {
        this.isUncheckType = false;
      }
    }
  }

  dataChangeTicketTypeFilter() {
    this.form.get('ticketTypeFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketType();
    });
  }


  onChangeTicketType() {
    let search = this.form.get("ticketTypeFilter").value;

    if (this.form.controls.ticketType.value?.length == this.lstTicketType.length) {
      this.isUncheckType = true;
    } else if (this.form.controls.ticketType.value?.length == this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isUncheckType = true;
    } else if (this.form.controls.ticketType.value?.length == 0) {
      this.form.get('ticketType').setValue('');
    } else {
      this.isUncheckType = false;
    }
  }

  btnClearGroup() {
    this.isUncheckGroup = false;
    this.isUncheckGenre = false;
    this.isUncheckType = false;
    this.form.get('ticketGroup').setValue('');
    this.form.get('ticketGenre').setValue('');
    this.form.get('ticketType').setValue('');
    this.filteredTicketGenre = new ReplaySubject;
    this.lstTicketGenre = [];
    this.filteredTicketType = new ReplaySubject;
    this.lstTicketType = [];
  }

  btnClearGenre() {
    this.isUncheckGenre = false;
    this.isUncheckType = false;
    this.form.get('ticketGenre').setValue('');
    this.form.get('ticketType').setValue('');
    this.filteredTicketType = new ReplaySubject;
    this.lstTicketType = [];
  }

  btnClearType() {
    this.isUncheckType = false;
    this.form.get('ticketType').setValue('');
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
}

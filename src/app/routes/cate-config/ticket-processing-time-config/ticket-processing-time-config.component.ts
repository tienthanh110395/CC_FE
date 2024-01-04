import { NgxMatDateAdapter, NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { RESOURCE } from '@app/core';
import { TicketLevelCateService } from '@app/core/services/cate-config/ticket-level-cate.service';
import { TicketTypeService } from '@app/core/services/cate-config/ticket-type.service';
import { TicketSlaService } from '@app/core/services/ticket-sla/ticket-sla.service';
import { CustomDateAdapter } from '@app/routes/special-vehicle-management/custom-date';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { ImportFileProcessingTimeDialogComponent } from './import-file-processing-time-dialog/import-file-processing-time-dialog.component';
import { ProcessingTimeConfigDialogComponent } from './processing-time-config-dialog/processing-time-config-dialog.component';
import { ReceptionTimeConfigDialogComponent } from './reception-time-config-dialog/reception-time-config-dialog.component';


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
  selector: 'app-ticket-processing-time-config',
  templateUrl: './ticket-processing-time-config.component.html',
  styleUrls: ['./ticket-processing-time-config.component.scss'],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter },
  ],
})
export class TicketProcessingTimeConfigComponent extends BaseComponent implements OnInit {

  @Input() isLoading: boolean;
  @Input() pageIndex: number;
  @ViewChild('ticketLevelCate') private ticketLevelCate: MatOption;

  formSearch!: FormGroup;
  titleTab;
  isEdit;
  canEdit: true;
  countTable = 0;

  displayedColumns: any = [];
  lstTicketGroup: any = [];
  lstTicketGenre: any = [];
  lstTicketType: any = [];
  lstTicketLevelCate: any = [];
  lstDataTicketProcessTime: any = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();

  title!: string;
  ticketTypeId!: string;
  label!: string;

  pageSizeList = [10, 50, 100];
  checkAll: any = false;
  search: any = 0;

  isToggleAll1: boolean = false;
  isToggleAll2: boolean = false;
  isToggleAll3: boolean = false;

  filteredTicketGroup: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketGenre: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredTicketType: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private ticketTypeService: TicketTypeService,
    private ticketSlaService: TicketSlaService,
    private ticketLevelCateService: TicketLevelCateService,
    private fb: FormBuilder,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
  ) {
    super(translateService, RESOURCE.CC_PROCESSING_TIME_CONFIG, toars, translateService);
    this.buildForm();
  }

  ngOnInit(): void {
    this.buildColumn();
    this.buildForm();
    this.doSearch();
    this.getListOtherCate();
    this.filteredTicketGroup.next(this.lstTicketGroup.slice());
    this.dataChangeTicketGroupFilter();
    this.mapData();
  }

  onChangeTicketLevelCateAll() {
    if (this.ticketLevelCate.selected) {
      this.formSearch.controls.ticketLevelCate.setValue([...this.lstTicketLevelCate, -1]);
    } else {
      this.formSearch.controls.ticketLevelCate.setValue([]);
    }
  }

  onChangeTicketLevelCate() {
    if (this.ticketLevelCate.selected) {
      this.ticketLevelCate.deselect();
    }
    if (this.formSearch.controls.ticketLevelCate.value.length == this.lstTicketLevelCate.length) {
      this.ticketLevelCate.select();
    }
    if (this.formSearch.controls.ticketLevelCate.value?.length == 0) {
      this.formSearch.get('ticketLevelCate').setValue("");
    }
  }

  getListOtherCate() {
    let params: object = {
      search: this.search
    };
    this.ticketLevelCateService.getTicketLevelCateById(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketLevelCate = data.map(val => ({ value: val.ticketLevelCateId, label: val.ticketLevelCateName }));
    });
  }

  /* data change fiter nhóm phản ánh */
  dataChangeTicketGroupFilter() {
    this.formSearch.get('ticketGroupFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGroup();
    });
  }

  doSearch() {
    this.isLoading = true;
    this.selection.clear();
    this.checkAll = false;
    let params = this.formSearch.getRawValue();
    params['ticketTypeLevel'] = 3;
    params['lstTicketGroup'] = params['ticketGroup'] ? _.map(params['ticketGroup'], 'value') : [];
    params['lstTicketGenre'] = params['ticketGenre'] ? _.map(params['ticketGenre'], 'value') : [];
    params['lstTicketType'] = params['ticketType'] ? _.map(params['ticketType'], 'value') : [];
    params["lstPriority"] = params["ticketLevelCate"] ? _.map(params["ticketLevelCate"], 'value') : [];;

    this.ticketSlaService.doSearch(params).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstDataTicketProcessTime = rs.data.listData;
        this.countTable = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      },
    );
  }

  buildForm() {
    this.formSearch = this.fb.group({
      ticketGroupFilter: '', //Filter Nhóm phản ánh
      ticketGenreFilter: '', //Filter Thể loại phản ánh
      ticketTypeFilter: '', //Filter Loại phản ánh
      ticketLevelCateFilter: '', //Filter mức độ ưu tiên
      ticketGroup: [null], //Nhóm phản ánh
      ticketGenre: [null], //Thể loại phản ánh
      ticketType: [null],//Loại phản ánh
      ticketLevelCate: [null],//Mức độ ưu tiên
      formDate: [null],//Từ ngày
      toDate: [null],//Đến ngày
      createUser: '',//Người tạo
      startRecord: 0,
      pageSize: this.pageSizeList[0],
    });
  }

  async mapData() {
    await this.getListTicketGroup();
  }

  /* get data nhóm phản ánh */
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

  /* filter nhóm phản ánh */
  filterTicketGroup() {
    if (!this.lstTicketGroup) {
      return;
    }
    let search = this.formSearch.get('ticketGroupFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketGroup.next(this.lstTicketGroup.slice());
      if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isToggleAll1 = true;
      } else {
        this.isToggleAll1 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGroup.next(
        this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1),
      );
      if (this.isToggleAll1 == true) {
        this.isToggleAll1 = true;
      } else {
        this.isToggleAll1 = false;
      }
    }
  }

  /* get data thể loại phản ánh */
  getListTicketGenre(parentId) {
    let lstParentId = parentId ? _.map(parentId, 'value') : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: this.search,
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketGenre = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
      this.filterTicketGenre();
      this.filteredTicketType.next(this.lstTicketType.slice());
      this.dataChangeTicketTypeFilter();
    });
  }

  /* filter thể loại phản ánh */
  filterTicketGenre() {
    if (!this.lstTicketGenre) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get('ticketGenreFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketGenre.next(this.lstTicketGenre.slice());
      if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isToggleAll2 = true;
      } else {
        this.isToggleAll2 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketGenre.next(
        this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1),
      );
      if (this.isToggleAll2 == true) {
        this.isToggleAll2 = true;
      } else {
        this.isToggleAll2 = false;
      }

    }
  }

  /* change data thể loại phản ánh */
  dataChangeTicketGenreFilter() {
    this.formSearch.get('ticketGenreFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketGenre();
    });
  }

  customViewName(strView: string): string {
    if (strView && strView.length > 50) return strView.substring(0, 50) + " ..."
    else return strView;
  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', width: '40px' },// STT
      // { i18n: '', field: 'select', width: '30px' },
      { i18n: 'common.action', field: 'action', width: '80px' },// Tác động
      { i18n: 'ticketProcessConfig.table.ticketGroup', field: 'ticketGroup', width: '300px' },// Nhóm phản ánh
      { i18n: 'ticketProcessConfig.table.ticketGenre', field: 'ticketGenre', width: '300px' },// Thể loại phản ánh
      { i18n: 'ticketProcessConfig.table.ticketType', field: 'ticketType', width: '300px' },// Loại phản ánh
      { i18n: 'ticketProcessConfig.table.ticketLevelCate', field: 'ticketLevelCate', width: '150px' },// Mức độ ưu tiên
      { i18n: 'ticketProcessConfig.table.ticketTimeFull', field: 'ticketTimeFull', width: '100px' },// Thời gian xử lý toàn trình
      { i18n: 'ticketProcessConfig.table.ticketTimeLv1', field: 'ticketTimeLv1', width: '100px' },// Thời gian xử lý cấp 1
      { i18n: 'ticketProcessConfig.table.ticketTimeLv2', field: 'ticketTimeLv2', width: '100px' },// Thời gian xử lý cấp 2
      { i18n: 'ticketProcessConfig.table.ticketRetime', field: 'ticketRetime', width: '100px' },// Thời gian xử lý xuất lại
      { i18n: 'ticketProcessConfig.table.createDate', field: 'createDate', width: '180px' },// Ngày tạo
      { i18n: 'ticketProcessConfig.table.createUser', field: 'createUser', width: '130px' },// Người tạo
      { i18n: 'ticketProcessConfig.table.updateDate', field: 'updateDate', width: '180px' },// Ngày tạo
      { i18n: 'ticketProcessConfig.table.updateUser', field: 'updateUser', width: '130px' },// Người tạo
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  /* update data processing time config*/
  doUpdate(data: any): any {
    let params: object = {
      title: 'CẬP NHẬT CẤU HÌNH THỜI GIAN XỬ LÝ',
      data: data,
    };

    const dialog = this.dialog.open({
      width: '1200px',
      data: params,
      disableClose: true,
    }, ProcessingTimeConfigDialogComponent);

    dialog.afterClosed().subscribe(() => {
      this.doSearch();
    });
  }

  /* create data processing time config*/
  doCreate() {
    let params: object = {
      title: this.translateService.instant('ticketProcessConfig.TitleDialogCreate'),
    };

    const dialog = this.dialog.open({
      width: '100%',
      data: params,
      disableClose: true,
    }, ProcessingTimeConfigDialogComponent);

    dialog.afterClosed().subscribe(() => {
      this.formSearch.get('ticketGroup').setValue('');
      this.clearTicketGroup();
      this.doSearch();
    });
  }

  /* ticket reception time config*/
  doRecepptionTime() {
    let params: object = {
      title: this.translateService.instant('ticketProcessConfig.button.receptionTime'),
    };

    const dialog = this.dialog.open({
      width: '1200px',
      data: params,
      disableClose: true,
    }, ReceptionTimeConfigDialogComponent);

    dialog.afterClosed().subscribe(() => {
      this.doSearch();
    });
  }

  /* change paging */
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
      this.lstDataTicketProcessTime.forEach((obj: any) => {
        obj['checked'] = true;
      });
    } else {
      this.checkAll = false;
      this.lstDataTicketProcessTime.forEach((obj: any) => {
        obj['checked'] = false;
      });
    }
  }

  onCheckItem(ob: MatCheckboxChange) {
    let itemCheck = _.filter(this.lstDataTicketProcessTime, (obj: any) => {
      return obj['checked'] === true;
    });
    if (itemCheck && itemCheck.length === this.lstDataTicketProcessTime.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  /* delete data processing time config */
  doDelete(ticketType: any) {
    const message = this.translateService.instant('ticketProcessConfig.deleteTicketProcessConfig') + ` : ${ticketType.ticketTypeName}`;
    const dialogData = new ConfirmDialogModel(this.translateService.instant('buttonTitle.deleteTicketProcessingConfig'), message, this.translateService.instant('common.button.delete'));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '700px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.isLoading = true;
        this.ticketSlaService.doDelete(ticketType.ticketTypeId).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            this.toars.success(this.translateService.instant('ticketProcessConfig.deleteSuccess'));
            this.doSearch();
          } else {
            this.toars.warning(this.translateService.instant('ticketProcessConfig.deleteError'));
          }
        }, () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant('common.500Error'));
        });
      }
    });
  }

  getValueOfField(item: any) {
    return this.formSearch.get(item)?.value;
  }

  setValueToField(item: any, data: any) {
    return this.formSearch.get(item)?.setValue(data);
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  /* select all tìm kiếm nhóm phản ánh */
  selectAll(event) {
    this.filteredTicketGroup.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.isToggleAll1 = true
          this.formSearch.controls.ticketGroup.patchValue(val);
          this.handleChangeTicketGenre();
        } else {
          this.isToggleAll1 = false;
          this.isToggleAll2 = false;
          this.isToggleAll3 = false;
          this.filteredTicketGenre = new ReplaySubject;
          this.filteredTicketType = new ReplaySubject;
          this.formSearch.get('ticketGroup').setValue('');
          this.formSearch.get('ticketGenre').setValue('');
          this.formSearch.get('ticketType').setValue('');

        }
      });
  }

  handleChangeTicketType() {
    this.formSearch.controls.ticketType.setValue(null);
    this.lstTicketType = [];
    if (this.formSearch.controls.ticketGenre.value?.length > 0) {
      this.getListTicketType(this.formSearch.controls.ticketGenre.value.filter(item => item !== -1));
    }
  }

  getListTicketType(parentId) {
    let lstParentId = parentId ? _.map(parentId, "value") : parentId;
    let params: object = {
      lstParentId: lstParentId,
      search: 0
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketType = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
      this.filteredTicketType.next(this.lstTicketType.slice());
      this.dataChangeTicketTypeFilter();
      this.filterTicketType();
    });
  }

  dataChangeTicketTypeFilter() {
    this.formSearch.get("ticketTypeFilter").valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterTicketType();
    });
  }

  filterTicketType() {
    if (!this.lstTicketType) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get("ticketTypeFilter").value;
    if (!search || search.trim() == "" || search.trim().length == 0) {
      this.filteredTicketType.next(this.lstTicketType.slice());
      if (this.formSearch.controls.ticketType.value?.length == this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.isToggleAll3 = true;
      } else {
        this.isToggleAll3 = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketType.next(
        this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1)
      );
      if (this.isToggleAll3 == true) {
        this.isToggleAll3 = true;
      } else {
        this.isToggleAll3 = false;
      }
    }
  }

  /* select all tìm kiếm thể loại phản ánh */
  selectAllTicketGenre(event) {
    this.isToggleAll2 = false;
    let search = this.formSearch.get("ticketGenreFilter").value;
    this.filteredTicketGenre.next(
      this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isToggleAll2 = true;
      this.formSearch.controls.ticketGenre.patchValue(val);
      this.handleChangeTicketType();
    } else {
      this.isToggleAll2 = false;
      this.isToggleAll3 = false;
      this.filteredTicketType = new ReplaySubject;
      this.formSearch.get('ticketGenre').setValue('');
      this.formSearch.get('ticketType').setValue('');
    }
  }

  /* select all tìm kiếm loại phản ánh */
  selectAllTicketType(event) {
    this.isToggleAll3 = false;
    let search = this.formSearch.get("ticketTypeFilter").value;
    this.filteredTicketType.next(
      this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1)
    );
    let val = this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1);
    if (event) {
      this.isToggleAll3 = true;
      this.formSearch.controls.ticketType.patchValue(val);
    } else {
      this.isToggleAll3 = false;
      this.formSearch.get('ticketType').setValue('');
    }
  }

  onChangeTicketGroup() {
    let search = this.formSearch.get("ticketGroupFilter").value;
    if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.length) {
      this.isToggleAll1 = true;
    } else if (this.formSearch.controls.ticketGroup.value?.length == 0) {
      this.formSearch.get('ticketGroup').setValue("");
    } else if (this.formSearch.controls.ticketGroup.value?.length == this.lstTicketGroup.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isToggleAll1 = true;
      this.handleChangeTicketGenre();
    } else {
      this.isToggleAll1 = false;
      this.isToggleAll2 = false;
      this.isToggleAll3 = false;
      this.handleChangeTicketGenre();
      this.formSearch.get('ticketGenre').setValue('');
      this.formSearch.get('ticketType').setValue('');
      this.filteredTicketGenre = new ReplaySubject;
      this.filteredTicketType = new ReplaySubject;
    }
  }

  onChangeTicketGenre() {
    let search = this.formSearch.get("ticketGenreFilter").value;
    if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.length) {
      this.isToggleAll2 = true;
    } else if (this.formSearch.controls.ticketGenre.value?.length == this.lstTicketGenre.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isToggleAll2 = true;
      this.handleChangeTicketType();
    } else if (this.formSearch.controls.ticketGenre.value?.length == 0) {
      this.formSearch.get('ticketGenre').setValue("");
    } else {
      this.isToggleAll2 = false;
      this.isToggleAll3 = false;
      this.handleChangeTicketType();
      this.formSearch.get('ticketType').setValue('');
      this.filteredTicketType = new ReplaySubject;
    }
  }

  onChangeTicketType() {
    let search = this.formSearch.get("ticketTypeFilter").value;

    if (this.formSearch.controls.ticketType.value?.length == this.lstTicketType.length) {
      this.isToggleAll3 = true;
    } else if (this.formSearch.controls.ticketType.value?.length == 0) {
      this.formSearch.get('ticketType').setValue("");
    } else if (this.formSearch.controls.ticketType.value?.length == this.lstTicketType.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.isToggleAll3 = true;
    } else {
      this.isToggleAll3 = false;
    }
  }

  handleChangeTicketGroup() {
    this.formSearch.controls.ticketGenre.setValue(null);
    this.lstTicketGenre = [];
    if (this.formSearch.controls.ticketGroup.value?.length > 0) {
      this.getListTicketGenre(this.formSearch.controls.ticketGroup.value.filter(item => item !== -1));
    }
  }

  handleChangeTicketGenre() {
    this.formSearch.controls.ticketGenre.setValue(null);
    this.lstTicketGenre = [];
    if (this.formSearch.controls.ticketGroup.value?.length > 0) {
      this.getListTicketGenre(this.formSearch.controls.ticketGroup.value.filter(item => item !== -1));
    }
  }

  exportExcel() {
    let params = this.formSearch.getRawValue();
    params['ticketTypeLevel'] = 3;
    params['lstTicketGroup'] = params['ticketGroup'] ? _.map(params['ticketGroup'], 'value') : [];
    params['lstTicketGenre'] = params['ticketGenre'] ? _.map(params['ticketGenre'], 'value') : [];
    params['lstTicketType'] = params['ticketType'] ? _.map(params['ticketType'], 'value') : [];
    params["lstPriority"] = params["ticketLevelCate"] ? _.map(params["ticketLevelCate"], 'value') : [];
    this.ticketSlaService.exportExcel(params)
      .subscribe(res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      });
  }


  doImport() {
    let params: object = {
      title: this.translateService.instant('ticketProcessConfig.button.importTime'),
    };
    const dialog = this.dialog.open({
      width: '100%',
      data: params,
      disableClose: true,
    }, ImportFileProcessingTimeDialogComponent);

    dialog.afterClosed().subscribe(() => {
      this.doSearch();
    });
  }

  clearTicketGroup() {
    this.isToggleAll1 = false;
    this.isToggleAll2 = false;
    this.isToggleAll3 = false;
    this.formSearch.get('ticketGenre').setValue('');
    this.formSearch.get('ticketType').setValue('');
    this.filteredTicketGenre = new ReplaySubject;
    this.filteredTicketType = new ReplaySubject;
    this.lstTicketGenre = [];
    this.lstTicketType = [];
  }

  clearTicketGenre() {
    this.isToggleAll2 = false;
    this.isToggleAll3 = false;
    this.formSearch.get('ticketType').setValue('');
    this.filteredTicketType = new ReplaySubject;
    this.lstTicketType = [];
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

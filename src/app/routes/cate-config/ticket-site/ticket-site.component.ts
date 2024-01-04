import {
  NGX_MAT_DATE_FORMATS,
  NgxMatDateAdapter,
  NgxMatDateFormats,
} from '@angular-material-components/datetime-picker';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TicketSiteDialogComponent } from '@app/routes/cate-config/ticket-site/ticket-site-dialog/ticket-site-dialog.component';
import { CustomDateAdapter } from '@app/routes/special-vehicle-management/custom-date';
import { RESOURCE } from '@core';
import { TicketSiteService } from '@core/services/cate-config/ticket-site-service';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { GROUP_REFLECTS_STATUS, HTTP_CODE, TICKET_EXPIRE_CAUSE_LEVEL_SEARCH } from '@shared';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/components/confirm-dialog/confirm-dialog.component';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';
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
  selector: 'app-ticket-unit-responsible',
  templateUrl: './ticket-site.component.html',
  styleUrls: ['./ticket-site.component.scss'],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter },
  ],
})
export class TicketSiteComponent extends BaseComponent implements OnInit {
  @ViewChild('levelSite') private levelSite: MatOption;
  @ViewChild('allStatus') private allStatus: MatOption;
  filteredTicketSite: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();
  form!: FormGroup;
  dataSource = new MatTableDataSource<any>();
  displayedColumnsSite: any = [];
  lstDataTicketSite: any = [];
  checkAll: any = false;
  countTableTicketSite = 0;
  pageSizeList = [10, 50, 100];
  lstTicketSite: any = [];
  selection = new SelectionModel<any>(true, []);
  checkTicketSite: boolean = false;
  messageConfirm: any;

  lstSiteLv = [
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL_SEARCH.CAP_1,
      label: this.translateService.instant('ticketExpire.table.ExpireLv1'),
    },
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL_SEARCH.CAP_2,
      label: this.translateService.instant('ticketExpire.table.ExpireLv2'),
    },
    {
      value: TICKET_EXPIRE_CAUSE_LEVEL_SEARCH.CAP_3,
      label: this.translateService.instant('ticketExpire.table.ExpireLv3'),
    },
  ];
  status = [
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
    private ticketSiteService: TicketSiteService,
    private fb: FormBuilder,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
  ) {
    super(ticketSiteService, RESOURCE.CC_SITE, toars, translateService);
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
      { i18n: 'common.action', field: 'action', width: '120px' },//Tác động
      { i18n: 'cateConfig.ticketSite.ticketSiteCode', field: 'ticketSiteCode', width: '150px' },//Mã đơn vị
      { i18n: 'cateConfig.ticketSite.ticketSiteName', field: 'ticketSiteName', width: '200px' },//Tên đơn vị
      { i18n: 'cateConfig.ticketSite.phoneNumber', field: 'phoneNumber', width: '150px' },//Số điện thoại
      { i18n: 'cateConfig.ticketSite.mail', field: 'mail', width: '200px' },//Email
      { i18n: 'cateConfig.ticketSite.ticketSiteLv', field: 'levelSite', width: '150px' },//Cấp đơn vị
      { i18n: 'cateConfig.ticketSite.user', field: 'siteUser', width: '300px' },//User đơn vị
      { i18n: 'cateConfig.ticketType.createDate', field: 'createDate', width: '150px' },//Ngày tạo
      { i18n: 'cateConfig.ticketType.createUser', field: 'createUser', width: '130px' },//Người tạo
      { i18n: 'cateConfig.ticketType.updateDate', field: 'updateDate', width: '130px' },//Ngày tạo
      { i18n: 'cateConfig.ticketType.updateUser', field: 'updateUser', width: '150px' },//Người tạo
      { i18n: 'cateConfig.ticketType.status', field: 'status', width: '100px' },//Trạng thái
    ];
    this.displayedColumnsSite = this.columns.map(x => x.field);
    this.buildForm();
    this.doSearch();
    this.filteredTicketSite.next(this.lstTicketSite.slice());
    this.dataChangeSiteFilter();
    this.mapData();
  }

  async mapData() {
    await this.getListTicketSite();
  }

  buildForm() {
    this.form = this.fb.group({
      siteFilter: '', //Filter đơn vị chịu trách nhiệm cấp
      ticketSite: [null], //Đơn vị chịu trách nhiệm
      formDate: [null],//Từ ngày
      toDate: [null],//Đến ngày
      createUser: [null],//Người tạo
      status: '',//Trạng thái
      levelSite: '', // Cấp đơn vị
      siteUser: '', // User phòng ban
      startRecord: 0,
      pageSize: this.pageSizeList[0],
    });
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  doCreate() {
    let params: object = {
      title: this.translateService.instant('cateConfig.ticketSite.create'),
    };

    const dialog = this.dialog.open({
      width: '1200px',
      data: params,
      disableClose: true,
    }, TicketSiteDialogComponent);

    dialog.afterClosed().subscribe(() => {
      this.clearCheckAll();
      this.form.controls.ticketSite.setValue('')
      this.getListTicketSite();
      this.doSearch();
    });
  }

  doSearch() {
    this.isLoading = true;
    let params = this.form.getRawValue();
    params['lstTicketSite'] = params['ticketSite'] ? _.map(params['ticketSite'], 'value') : [];
    params['status'] = params['status'] ? _.map(params['status'], 'value').filter(x => x) : [];

    this.ticketSiteService.doSearch(params).subscribe(rs => {
        this.isLoading = false;
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.lstDataTicketSite = rs.data.listData;
          this.countTableTicketSite = rs.data.count;
        }
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  onCheckAll(ob: MatCheckboxChange) {
    if (ob && ob.checked === true) {
      this.lstDataTicketSite.forEach((obj: any) => {
        obj['checked'] = true;
      });
    } else {
      this.checkAll = false;
      this.lstDataTicketSite.forEach((obj: any) => {
        obj['checked'] = false;
      });
    }
  }

  onCheckItem(ob: MatCheckboxChange) {
    let itemCheck = _.filter(this.lstDataTicketSite, (obj: any) => {
      return obj['checked'] === true;
    });
    if (itemCheck && itemCheck.length === this.lstDataTicketSite.length) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
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

  doUpdate(data: any): any {
    let params: object = {
      title: this.translateService.instant('cateConfig.ticketSite.update'),
      data: data,
    };

    const dialog = this.dialog.open({
      width: '1200px',
      data: params,
      disableClose: true,
    }, TicketSiteDialogComponent);

    dialog.afterClosed().subscribe(() => {
      this.form.controls.ticketSite.setValue('')
      this.clearCheckAll();
      this.getListTicketSite();
      this.doSearch();
    });
  }

  doDelete(ticketSite: any) {
    const message = this.translateService.instant('cateConfig.ticketSite.deleteTicketSite') + ` : ${ticketSite.ticketSiteName}`;
    const dialogData = new ConfirmDialogModel(this.translateService.instant('buttonTitle.deleteTicketType'), message, this.translateService.instant('common.button.delete'));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '700px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.isLoading = true;
        let ticketSiteId = ticketSite.ticketSiteId;
        this.ticketSiteService.doDelete(ticketSiteId).subscribe(rs => {
          this.isLoading = false;
          if (rs === true) {
            this.toars.warning(this.translateService.instant('cateConfig.ticketSite.deleteError'));
          } else {
            this.toars.success(this.translateService.instant('cateConfig.ticketSite.deleteSuccess'));
            this.doSearch();
          }
        }, () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant('common.500Error'));
        });
      }
    });
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
          this.ticketSiteService.changeStatus(item).subscribe(rs => {
            this.isLoading = false;
            if (rs) {
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
    }
  }

  onChangeStatusMultiple() {
    let dataCheck = _.filter(this.lstDataTicketSite, (obj: any) => {
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
            lstIdsActive: _.map(lstIdsActive, 'ticketSiteId'),
            lstIdsInactive: _.map(lstIdsInactive, 'ticketSiteId'),
          };
          this.ticketSiteService.approveChangeStatus(params).subscribe(rs => {
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

  onChangePage(event: any) {
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

  getListTicketSite() {
    this.ticketSiteService.getTicketSite().subscribe(res => {
      const data = res.data?.listData || [];
      this.lstTicketSite = data.map(val => ({ value: val.ticketSiteId, label: val.ticketSiteName }));
      this.filterSite();
    });
  }

  dataChangeSiteFilter() {
    this.form.get('siteFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterSite();
    });
  }

  filterSite() {
    if (!this.lstTicketSite) {
      return;
    }
    // get the search keyword
    let search = this.form.get('siteFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredTicketSite.next(this.lstTicketSite.slice());
      if (this.formSearch.controls.ticketSite.value?.length == this.lstTicketSite.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
        this.checkTicketSite = true;
      }  else {
        this.checkTicketSite = false;
      }
      return;
    } else {
      search = search.toLowerCase();
      this.filteredTicketSite.next(
        this.lstTicketSite.filter(s => s.label.toLowerCase().indexOf(search) > -1),
      );
      if(this.checkTicketSite == true){
        this.checkTicketSite = true;
      } else {
        this.checkTicketSite = false;
      }
    }
  }

  selectAll(event) {
    this.filteredTicketSite.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.checkTicketSite = true;
          this.form.controls.ticketSite.patchValue(val);
        } else {
          this.checkTicketSite = false;
          this.form.controls.ticketSite.patchValue([]);
          this.form.controls.siteLv1Filter.patchValue([]);
        }
      });
  }

  onChangeSite() {
    let search = this.formSearch.get("siteFilter").value;
    if (this.formSearch.controls.ticketSite.value?.length == this.lstTicketSite.length) {
      this.checkTicketSite = true;
    }
    if (this.formSearch.controls.ticketSite.value?.length == 0) {
      this.formSearch.get('ticketSite').setValue('');
    }else if (this.formSearch.controls.ticketSite.value?.length == this.lstTicketSite.filter(s => s.label.toLowerCase().indexOf(search) > -1).length) {
      this.checkTicketSite = true;
    }  else {
      this.checkTicketSite = false;
    }
  }

  onChangeSiteLvAll() {
    if (this.levelSite.selected) {
      this.form.controls.levelExpire.setValue([...this.lstSiteLv, -1]);
    } else {
      this.form.controls.levelExpire.setValue('');
    }
  }

  onChangeSiteLv() {
    if (this.levelSite.selected) {
      this.levelSite.deselect();
    }
    if (this.form.controls.levelExpire.value.length == this.lstSiteLv.length) {
      this.levelSite.select();
    }
  }

  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.form.controls.status.setValue([...this.status, -1]);
    } else {
      this.form.controls.status.setValue('');
    }
  }

  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.form.controls.status.value?.length == 0) {
      this.form.get('status').setValue('');
    }
    if (this.form.controls.status.value.length == this.status.length) {
      this.allStatus.select();
    }
  }


  onChangeLevelSiteAll() {
    if (this.levelSite.selected) {
      this.form.controls.siteLv.setValue([...this.lstSiteLv, -1]);
    } else {
      this.form.controls.siteLv.setValue('');
    }
  }

  onChangeLevelSite() {
    if (this.levelSite.selected) {
      this.levelSite.deselect();
    }
    if (this.form.controls.siteLv.value?.length == 0) {
      this.form.get('siteLv').setValue('');
    }
    if (this.form.controls.siteLv.value.length == this.lstSiteLv.length) {
      this.levelSite.select();
    }
  }

  clearCheckAll() {
    this.checkTicketSite = false;
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


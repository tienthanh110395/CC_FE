import {
  NgxMatDateAdapter,
  NgxMatDateFormats, NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ImpactLogService } from '@app/core/services/cate-config/impact-log-service';
import { ImpactLogDialogComponent } from '@app/routes/cate-config/impact-log/impact-log-dialog/impact-log-dialog.component';
import { CustomDateAdapter } from '@app/routes/special-vehicle-management/custom-date';
import { RESOURCE } from '@core';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { HTTP_CODE, LIST_CATE_TYPE, LIST_IMPACT_TYPE } from '@shared';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';

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
  selector: 'app-impact-log',
  templateUrl: './impact-log.component.html',
  styleUrls: ['./impact-log.component.scss'],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter },
  ],
})
export class ImpactLogComponent extends BaseComponent implements OnInit {
  lstCateType: any = [
    {
      value: LIST_CATE_TYPE.NHOM_PHAN_ANH,
      label: this.translateService.instant('cateConfig.ticketType.ticketGroup'),
    },
    {
      value: LIST_CATE_TYPE.THE_lOAI_PHAN_ANH,
      label: this.translateService.instant('cateConfig.ticketType.ticketGenre'),
    },
    {
      value: LIST_CATE_TYPE.LOAI_PHAN_ANH,
      label: this.translateService.instant('cateConfig.ticketType.typeTicket'),
    },
    {
      value: LIST_CATE_TYPE.THOI_GIAN_XU_LY,
      label: this.translateService.instant('cateConfig.ticketType.processingTime'),
    },
    {
      value: LIST_CATE_TYPE.MUC_DO_UU_TIEN,
      label: this.translateService.instant('cateConfig.ticketType.priorityLevel'),
    },
    {
      value: LIST_CATE_TYPE.NGUYEN_NHAN_LOI,
      label: this.translateService.instant('cateConfig.ticketType.errorCause'),
    },
    {
      value: LIST_CATE_TYPE.MAP_NGUYEN_NHAN_LOI,
      label: this.translateService.instant('cateConfig.ticketType.mapCauseError'),
    },
    {
      value: LIST_CATE_TYPE.NGUYEN_NHAN_QUA_HAN,
      label: this.translateService.instant('cateConfig.ticketType.overdueCause'),
    },
    {
      value: LIST_CATE_TYPE.DON_VI_CHIU_TRACH_NHIEM,
      label: this.translateService.instant('cateConfig.ticketType.responsibleUnit'),
    },
    {
      value: LIST_CATE_TYPE.DANH_MUC_THONG_KE,
      label: this.translateService.instant('cateConfig.ticketType.cateStatistic'),
    },
    {
      value: LIST_CATE_TYPE.CAU_HINH_THONG_BAO,
      label: this.translateService.instant('cateConfig.ticketType.notifyConfig'),
    },
  ];

  lstImpactType: any = [
    {
      value: LIST_IMPACT_TYPE.THEM_MOI,
      label: this.translateService.instant('cateConfig.ticketType.insert'),
    },
    {
      value: LIST_IMPACT_TYPE.CAP_NHAT,
      label: this.translateService.instant('cateConfig.ticketType.updated'),
    },
  ];

  displayedColumnsImpact: any = [];
  lstDataImpactLog: any = [];
  countTableImpactLog = 0;
  form!: FormGroup;
  pageSizeList = [10, 50, 100];
  dataSource = new MatTableDataSource<any>();

  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private impactLogService: ImpactLogService,
    private fb: FormBuilder,
    private router: Router,
    private matDialog: MatDialog,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any) {
    super(impactLogService, RESOURCE.CC_IMPACT_LOG, toars, translateService);
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', width: '40px' },//STT
      { i18n: 'common.action', field: 'action', width: '40px' },//Tác động
      { i18n: 'cateConfig.impactLog.cateType', field: 'actTypeName', width: '150px' },//Loại danh mục
      { i18n: 'cateConfig.impactLog.description', field: 'description', width: '300px', type: 'string' },//Loại tác động
      { i18n: 'cateConfig.impactLog.impactType', field: 'actionName', width: '100px' },//Loại tác động
      { i18n: 'cateConfig.impactLog.impactDate', field: 'createDate', width: '130px' },//Ngày tác động
      { i18n: 'cateConfig.impactLog.impactUser', field: 'createUser', width: '100px' },//Người tác động
    ];
    this.displayedColumnsImpact = this.columns.map(x => x.field);
    this.buildForm();
    this.doSearch();
  }

  buildForm() {
    this.form = this.fb.group({
      actType: [],//Loại danh mục
      impactType: [],//Loại tác động
      description: "",//Ten danh muc
      fromDate: [null],//Từ ngày
      toDate: [null],//Đến ngày
      startRecord: 0,
      pageSize: this.pageSizeList[0],
    });
  }

  doSearch() {
    this.isLoading = true;
    let params = this.form.getRawValue();
    this.impactLogService.doSearch(params).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.lstDataImpactLog = rs.data['listData'];
        this.countTableImpactLog = rs.data.count;
      }
    },
      () => {
        this.isLoading = false;
      },
    );
  }

  customViewDescription(strView: string): string {
    if (strView && strView.length > 65) return strView.substring(0, 65) + " ..."
    else return strView;
  }

  doView(data: any) {
    let params: object = {
      // title: this.translateService.instant('cateConfig.impactLog.detailImpactCreate') + ' ' + data['description'] ? data['description'] : '',
      title: this.translateService.instant('cateConfig.impactLog.detailImpactCreate') + ' ' + ' <strong>' + '[ ' + (data['description'] ? data['description'].toUpperCase() : '') + ' ]' + '</strong>',
      actionAuditId: data["actionAuditId"],
    };

    const dialog = this.dialog.open({
      width: '1200px',
      data: params,
    }, ImpactLogDialogComponent);

    dialog.afterClosed().subscribe(() => {
      this.doSearch();
    });
  }

  exportExcel() {
    const search = { ...this.form.value };
    this.impactLogService.exportExcel(search)
      .subscribe(res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      });
  }

  onPageChange(event) {
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

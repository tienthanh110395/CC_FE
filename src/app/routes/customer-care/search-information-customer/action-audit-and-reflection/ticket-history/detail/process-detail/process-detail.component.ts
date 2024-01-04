import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CC_PRIORITY, CC_TICKET_STATUS, HTTP_CODE } from '@app/shared';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-process-detail',
  templateUrl: './process-detail.component.html',
  styleUrls: ['./process-detail.component.scss']
})
export class ProcessDetailTabComponent implements OnInit {

  formGroup: FormGroup;
  @Input() data: any;
  isFirstTime: boolean = true;
  priorityList = [
    { value: CC_PRIORITY.NORMAL, label: this._translateService.instant('customer-care.dropdown.priority.normal') },
    { value: CC_PRIORITY.HOT, label: this._translateService.instant('customer-care.dropdown.priority.hot') },
    { value: CC_PRIORITY.VIP, label: this._translateService.instant('customer-care.dropdown.priority.vip') }
  ];
  statusList = [
    { value: CC_TICKET_STATUS.TAO_MOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.new') },
    { value: CC_TICKET_STATUS.DANG_XU_LY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.process') },
    { value: CC_TICKET_STATUS.XU_LY_XONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.doneProcess') },
    { value: CC_TICKET_STATUS.DONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.close') },
    { value: CC_TICKET_STATUS.HUY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.cancel') },
    { value: CC_TICKET_STATUS.THEO_DOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.follow') }
  ];
  accountTypeList = [
    { value: 1, label: 'Tài khoản giao thông' },
  ];
  listFileDetail = [];
  listFileAdjust = [];

  columns = [];
  displayedColumns = [];

  dataSourceDetail = new MatTableDataSource<any>();
  @ViewChild('paginatorDetail') paginatorDetail: MatPaginator;

  dataSourceAdjust = new MatTableDataSource<any>();
  @ViewChild('paginatorAdjust') paginatorAdjust: MatPaginator;

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private ngZone: NgZone,
    public dialog?: MtxDialog) { }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit(): void {
    this.buildForm({});
    this.getDetailProcess(this.data.ticketId);
  }

  buildForm(data: any) {
    this.formGroup = this.fb.group({
      ticketId: [data.ticketId],
      plateNumber: [data.plateNumber],
      contractNo: [data.contractNo],
      accountType: [data.accountType ? parseInt(data.accountType) : 1],
      adjustAmount: [data.adjustAmount],
      reason: [data.reason],
      adjustContent: [data.adjustContent],
      payType: [data.payType],
      priorityId: [data.priorityId ? parseInt(data.priorityId) : null],
      groupPA: [data.groupPA || ''],
      subGroupPA: [data.subgroupPA || ''],
      status: [data.status ? parseInt(data.status) : CC_TICKET_STATUS.TAO_MOI],
      destroyReason: [data.destroyReason || ''],
      processResult: [data.processResult || ''],
      processTime: [data.processTime ? format(parseInt(data.processTime), 'dd/MM/yyyy HH:mm') : ''],
      reasonLevel1: [data.reasonLevel1 || ''],
      reasonLevel2: [data.reasonLevel2 || ''],
      phoneNumber: [data.phoneNumber || ''],
      processContent: [data.processContent || ''],
    });
    // set file detail
    if (data.listFiles?.length > 0) {
      this.dataSourceDetail.data = data.listFiles;
    }
    // set file adjust
    if (data.ticketAttachmentEntityList?.length > 0) {
      this.dataSourceAdjust.data = data.ticketAttachmentEntityList;
    }
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  ngAfterViewInit(): void {
    this.dataSourceAdjust.paginator = this.paginatorAdjust;
  }

  getDetailProcess(objectInfo: any) {
    this._ticketService.getDetailProcess(this.data.ticketId).subscribe(rs => {
      this._ticketService.getAdjustChargeInfo(this.data.ticketId).subscribe(rs2 => {
        const data = rs.data.listData?.length > 0 ? rs.data.listData[0] : {};
        this.isFirstTime = false;
        this.buildForm(Object.assign(objectInfo, rs2.data || {}, data));
      }, error => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }, error => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onDownloadFile(item: any) {
    this._ticketService.downloadFileNew(item.attachmentId).subscribe(res => {
      saveAs(res.body, item.fileName);
    }, err => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onViewFile(item: any) {
    const extension = item.fileName.split('.').pop().toLowerCase();
    if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp', 'pdf'].includes(extension)) {
      this._ticketService.viewFileNew(item.attachmentId).subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          const fullBase64 = 'data:image/png;base64,' + res.data;
          if (extension === 'pdf') {
            this.dialog.originalOpen(ViewFilePdfComponent, {
              data: { fullBase64, documentName: item.fileName }
            });
          }
          if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp'].includes(extension)) {
            this.dialog.originalOpen(ViewFileImageComponent, {
              data: { fullBase64, documentName: item.fileName }
            });
          }
        } else {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        }
      }, err => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    } else {
      this.onDownloadFile(item);
    }
  }

}

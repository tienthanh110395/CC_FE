import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { AfterViewInit, Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CC_TICKET_STATUS, HTTP_CODE, SharedDirectoryService } from '@app/shared';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-ticket-info',
  templateUrl: './ticket-info.component.html',
  styleUrls: ['./ticket-info.component.scss']
})
export class TicketInfoTabComponent implements OnInit, AfterViewInit {

  formGroup: FormGroup;
  @Input() data: any;
  customerTypeList = [];
  statusList = [
    { value: CC_TICKET_STATUS.TAO_MOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.new') },
    { value: CC_TICKET_STATUS.DANG_XU_LY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.process') },
    { value: CC_TICKET_STATUS.XU_LY_XONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.doneProcess') },
    { value: CC_TICKET_STATUS.DONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.close') },
    { value: CC_TICKET_STATUS.HUY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.cancel') },
    { value: CC_TICKET_STATUS.THEO_DOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.follow') }
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('paginator') paginator: MatPaginator;
  columns = [];
  displayedColumns = [];
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(private fb: FormBuilder,
    protected _translateService: TranslateService,
    private _sharedDirectoryService: SharedDirectoryService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private ngZone: NgZone,
    public dialog?: MtxDialog) { }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit(): void {
    // set file
    if (this.data.ticketAttachmentEntityList?.length > 0) {
      this.dataSource.data = this.data.ticketAttachmentEntityList;
    }
    this.formGroup = this.fb.group({
      plateNumber: [this.data.plateNumber || ''],
      custName: [this.data.custName || ''],
      documentNumber: [this.data.documentNumber || ''],
      custType: [this.data.custTypeId ? parseInt(this.data.custTypeId) : null],
      contactNumber: [this.data.phoneNumber || ''],
      email: [this.data.email || ''],
      ticketStatus: [this.data.status ? parseInt(this.data.status) : null],
      receiveSource: [this.data.sourceName || ''],
      address: [this.data.custAddress || ''],
      ticketContent: [this.data.contentReceive || '']
    });
    this.getListCustomerType();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getListCustomerType() {
    if (AppStorage.get('list-cust-type')) {
      this.customerTypeList = AppStorage.get('list-cust-type').map(val => ({ value: val.cust_type_id, label: val.name }));
    } else {
      this._sharedDirectoryService.getListCustomerType().subscribe(res => {
        this.customerTypeList = res.data?.map(val => ({ value: val.cust_type_id, label: val.name }));
      });
    }
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

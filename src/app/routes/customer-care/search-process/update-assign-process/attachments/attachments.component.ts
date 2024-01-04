import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CommonCRMService, HTTP_CODE, TICKET_ASSIGN_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AddNewAttachmentComponent } from './add-new/add-new.component';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-attachments-tab',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsTabComponent extends BaseComponent implements OnInit {

  @Input() data: any;
  // isFirstTime: boolean = true;
  closeStatus: string = TICKET_ASSIGN_STATUS.CLOSE + '';
  fileTypeList = [
    { value: 1, label: this._translateService.instant('customer-care.dropdown.fileType.1') },
    { value: 2, label: this._translateService.instant('customer-care.dropdown.fileType.2') },
    { value: 3, label: this._translateService.instant('customer-care.dropdown.fileType.3') },
    { value: 4, label: this._translateService.instant('customer-care.dropdown.fileType.4') },
    { value: 5, label: this._translateService.instant('customer-care.dropdown.fileType.5') },
    { value: 6, label: this._translateService.instant('customer-care.dropdown.fileType.6') },
  ];

  constructor(private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private _commonCRMService: CommonCRMService,
    public dialog: MtxDialog) {
    super();
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileType', field: 'type' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    super.mapColumn();
    this.formSearch = this.fb.group({
      ticketId: this.data.ticketId,
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
    this.search();
  }

  search() {
    this.isLoading = true;
    let searchObj = Object.assign({}, this.formSearch.value);
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item]
      }
    }
    if (this.formSearch.value.startrecord == 0) {
      searchObj.startrecord = 0;
    }
    this._ticketService.searchTicketAttachment(searchObj).subscribe(rs => {
      this.isLoading = false;
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        // this.isFirstTime = false;
      } else {
        // this._toastrService.error(rs.mess.description);
      }
    }, error => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.search();
  }

  onInsert() {
    const dialogRef = this.dialog.originalOpen(AddNewAttachmentComponent, {
      width: '60%',
      data: this.data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.search();
      }
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

  onDeleteFile(file) {
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      width: '30%',
      data: {
        title: this._translateService.instant('common.confirm.title.delete'),
        message: this._translateService.instant('common.confirm.delete-file')
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._ticketService.deleteFile(file.attachmentId).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.search();
            this._toastrService.success(this._translateService.instant('common.notify.delete.success'));
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, err => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    });
  }

  showFileTypeName(value: any): string {
    const status = this.fileTypeList.find(item => item.value + '' === value + '');
    if (status) return status.label;
    return '';
  }

}

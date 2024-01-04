import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { HTTP_CODE } from '@app/shared/constant/common.constant';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-popup-notify-email',
  templateUrl: './popup-notify-email.component.html',
  styleUrls: ['./popup-notify-email.component.scss']
})
export class PopupNotifyEmailComponent implements AfterViewInit {

  popupModel: any = {};
  listFormatFile = ['.jpg', '.png', '.tiff', '.bmp', '.jpeg', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  listFileDetail = new MatTableDataSource<any>();
  columnsFile = [];
  displayedColumnsFile = [];
  formGroupPopup: FormGroup;
  @ViewChild('paginatorDetail') paginatorDetail: MatPaginator;
  constructor(
    private fb: FormBuilder,
    protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private dialogRef: MatDialogRef<PopupNotifyEmailComponent>,
    private dialog: MtxDialog,
  ) {
    this.formGroupPopup = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
    this.popupModel.content = '';
    this.columnsFile = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumnsFile = this.columnsFile.map(x => x.field);
  }

  ngAfterViewInit(): void {
    this.listFileDetail.paginator = this.paginatorDetail;
  }
  send() {
    this.popupModel.attachmentFiles = this.listFileDetail.data.map(f => {
      return {
        fileName: f.fileName,
        base64Data: f.fileBase64,
      };
    });
    this.dialogRef.close(this.popupModel);
  }

  onDownloadFile(item: any) {
    if (item.file) {
      saveAs(item.file, item.fileName);
    }
  }

  onViewFile(item: any) {
    const extension = item.fileName.split('.').pop().toLowerCase();
    if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp', 'pdf'].includes(extension)) {
      if (item.file && item.fullBase64) {
        if (extension === 'pdf') {
          this.dialog.originalOpen(ViewFilePdfComponent, {
            data: { fullBase64: item.fullBase64, documentName: item.fileName }
          });
        }
        if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp'].includes(extension)) {
          this.dialog.originalOpen(ViewFileImageComponent, {
            data: { fullBase64: item.fullBase64, documentName: item.fileName }
          });
        }
      }
    } else {
      this.onDownloadFile(item);
    }
  }

  onDeleteFile(file, type) {
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
        if (file.attachmentId) {
          this._ticketService.deleteFile(file.attachmentId).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.deleteFileLocal(file, type);
              this._toastrService.success(this._translateService.instant('common.notify.save.success'));
            } else {
              this._toastrService.error(res.mess.description);
            }
          }, () => {
            this._toastrService.error(this._translateService.instant('common.500Error'));
          });
        } else {
          this.deleteFileLocal(file, type);
          this._toastrService.success(this._translateService.instant('common.notify.save.success'));
        }
      }
    });
  }

  deleteFileLocal(file, type) {
    let listFile = [];
    listFile = this.listFileDetail.data;
    const findFile = listFile.findIndex(f => f.fileName === file.fileName);
    if (findFile >= 0) {
      const detail = [...this.listFileDetail.data];
      detail.splice(findFile, 1);
      this.listFileDetail.data = detail;
    }
  }

  chooseFileChange(chooseFiles, type) {
    const listFile = chooseFiles.target.files;
    let i = 0;
    for (i; i < listFile.length; i++) {
      const lastIndexFile = listFile[i].name.lastIndexOf('.');
      if (lastIndexFile) {
        const extendFile = listFile[i].name.substring(lastIndexFile);
        const checkExtendFile = this.listFormatFile.find(x => x == extendFile.toLowerCase());
        if (checkExtendFile && listFile[i].size <= 5242880) {
          this.convertFile(listFile[i], type);
        } else if (listFile[i].size > 5242880) {
          this._toastrService.warning(this._translateService.instant('common.capacityFile') + `${listFile[i].name} ` + this._translateService.instant('common.max5MB'));
        } else {
          this._toastrService.warning(`File ${listFile[i].name} ` + this._translateService.instant('common.invalidFormat'));
        }
      }
    }
  }

  convertFile(file, type) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const index = reader.result.toString().indexOf('base64,');
      const base64 = index > 0 ? reader.result.toString().substring(index + 7) : '';
      const fileSelected = {
        fileName: file.name,
        fileSize: file.size,
        fileBase64: base64,
        fullBase64: reader.result.toString(),
        file
      };
      this.listFileDetail.data = [...this.listFileDetail.data, fileSelected];
    };
  }
}

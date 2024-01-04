import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { HTTP_CODE } from '@app/shared';
import { ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-add-new-attachment',
  templateUrl: './add-new.component.html',
  styleUrls: ['./add-new.component.scss']
})
export class AddNewAttachmentComponent implements OnInit, AfterViewInit {

  formGroup: FormGroup;
  fileTypeList = [
    { value: 6, label: this._translateService.instant('customer-care.dropdown.fileType.6') }
  ];
  listFile = new MatTableDataSource<any>();
  listFormatFile = ['.jpg', '.png', '.tiff', '.bmp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  @ViewChild('paginator') paginator: MatPaginator;
  columns = [];
  displayedColumns = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ConfirmDialogBoldFormComponent>,
    protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    public dialog: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      ticketId: this.data.ticketId,
      type: [null, Validators.required]
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  ngAfterViewInit(): void {
    this.listFile.paginator = this.paginator;
  }

  onConfirm(): void {
    const data = Object.assign({}, this.formGroup.value);
    data.attachmentFiles = this.listFile?.data.map(f => {
      return {
        fileName: f.fileName,
        base64Data: f.fileBase64,
      };
    });
    this._ticketService.addTicketAttachment(data).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('common.notify.add.success'));
        this.dialogRef.close(true);
      } else {
        this._toastrService.error(res.mess.description);
      }
    }, err => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

  chooseFileChange(chooseFiles) {
    const listFile = chooseFiles.target.files;
    let i = 0;
    for (i; i < listFile.length; i++) {
      const lastIndexFile = listFile[i].name.lastIndexOf('.');
      if (lastIndexFile) {
        const extendFile = listFile[i].name.substring(lastIndexFile);
        const checkExtendFile = this.listFormatFile.find(x => x == extendFile.toLowerCase());
        if (checkExtendFile && listFile[i].size <= 5242880) {
          this.convertFile(listFile[i]);
        } else if (listFile[i].size > 5242880) {
          this._toastrService.warning(this._translateService.instant('common.capacityFile') + `${listFile[i].name} ` + this._translateService.instant('common.max5MB'));
        } else {
          this._toastrService.warning(`File ${listFile[i].name} ` + this._translateService.instant('common.invalidFormat'));
        }
      }
    }
  }

  onDeleteFile(file) {
    const findFile = this.listFile.data.findIndex(f => f.fileName === file.fileName);
    if (findFile >= 0) {
      const data = [...this.listFile.data];
      data.splice(findFile, 1);
      this.listFile.data = data;
    }
  }

  convertFile(file) {
    let reader = new FileReader();
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
      this.listFile.data = [...this.listFile.data, fileSelected];
    };
    reader.onerror = (error) => {
    };
  }

  onDownloadFile(item: any) {
    if (item.filePath) {
      this._ticketService.downloadFileNew(item.attachmentId).subscribe(res => {
        saveAs(res.body, item.fileName);
      }, err => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    } else if (item.file) {
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
      } else {
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
      }
    } else {
      this.onDownloadFile(item);
    }
  }

}

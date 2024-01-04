import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ContractService } from '@app/core';
import { DocumentService } from '@app/core/services/document/document.service';
import { ACTION_TYPE, CommonCRMService, HTTP_CODE } from '@app/shared';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-document-contract',
  templateUrl: './document-contract.component.html',
  styleUrls: ['./document-contract.component.scss']
})
export class TableContractAdditionalComponent extends BaseComponent implements OnInit {
  @Input() listOptionLicense = [];
  @Input() data: any[];
  @Input() tabIndex: number;
  @Input() selectedItem: any;
  @Output() action: EventEmitter<any> = new EventEmitter();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @ViewChild('crmtable') crmTable: CrmTableComponent;

  constructor(public dialog?: MtxDialog,
    private _commonCRMService?: CommonCRMService,
    private _translateService?: TranslateService,
    private _toastrService?: ToastrService,
    private _documentService?: DocumentService,
    private _domSanitizationService?: DomSanitizer,
    private _contractService?: ContractService) {
    super();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'document.code', field: 'documentTypeName' },
      { i18n: 'document.name', field: 'fileName' },
      { i18n: 'document.scanner', field: 'createUser' },
      { i18n: 'document.check_date', field: 'approvedDate' },
      { i18n: 'document.check_status', field: 'checkStatus' },
      { i18n: 'document.rescan', field: 'rescan' },
      { i18n: 'document.failed_scan', field: 'failedScan' },
      { i18n: 'document.wrong_info', field: 'wrongInfo' },
      { i18n: 'document.fake', field: 'fake', type: 'fake' },
      { i18n: 'document.not_scan', field: 'notScan' },
      { i18n: 'common.action', field: 'action' }
    ];
    this.dataModel.dataSource = this.data;
    super.mapColumn();
  }

  chooseFileChange(event) {
    const dialog = this.dialog.open(
      {
        width: '600px',
        data: { event },
      },
      AttachFileComponent
    );

    dialog.afterClosed().subscribe(res => {
      if (res) {
        let licenseName;
        const documentSelected = this.dataModel.selectLicence;
        if (documentSelected) {
          licenseName = this.listOptionLicense.find(license => license.id === documentSelected).value;
        } else {
          licenseName = '';
        }
        res.forEach(file => {
          const license = {
            documentTypeName: licenseName,
            documentTypeId: documentSelected,
            documentName: file.fileName,
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileBase64: file.fileBase64,
            fullBase64: file.fullBase64
          };
          this.dataModel.dataSource = [...this.dataModel.dataSource, license];
        });
      }
    });
  }

  viewFile(item) {
    if (item.fullBase64) {
      const checkExtension = item.fileName.split('.')[1];
      if (checkExtension != 'pdf') {
        this.openViewImageProfile(item);
      } else {
        this.openViewPdfProfile(item);
      }
    } else {
      this._contractService.downloadProfileByContract(item.contractProfileId).subscribe(rs => {
        item.fileData = rs;
        item.documentName = item.fileName;
        const checkExtension = item.fileName.split('.')[1];
        if (checkExtension != 'pdf') {
          this.openViewImageProfile(item);
        } else {
          this.openViewPdfProfile(item);
        }
      });
    }
  }

  openViewPdfProfile(row): void {
    if (row.fullBase64) {
      this.dialog.originalOpen(ViewFilePdfComponent, {
        data: row
      });
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(row.fileData);
      reader.onload = (readerEvt: any) => {
        row.safeUrl = this._domSanitizationService.bypassSecurityTrustUrl(readerEvt.target.result);
        row.fullBase64 = row.safeUrl.changingThisBreaksApplicationSecurity;
        this.dialog.originalOpen(ViewFilePdfComponent, {
          data: row
        });
      };
    }
  }

  openViewImageProfile(row): void {
    if (row.fullBase64) {
      this.dialog.originalOpen(ViewFileImageComponent, {
        data: row
      });
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(row.fileData);
      reader.onload = (readerEvt: any) => {
        row.fullBase64 = this._domSanitizationService.bypassSecurityTrustUrl(readerEvt.target.result);
        this.dialog.originalOpen(ViewFileImageComponent, {
          data: row
        });
      };
    }
  }

  removeScan(item, index) {
    if (item.contractProfileId || item.vehicleProfileId) {
      const dialogData = new ConfirmDialogModel(
        this._translateService.instant('common.confirm.title.delete'),
        this._translateService.instant('common.confirm.delete'),
        this._translateService.instant('common.button.delete')
      );
      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // nếu có trong db thì xóa gọi api
          this._contractService.deleteProfiles(item.custId, item.contractId, item.contractProfileId).subscribe(rs => {
            if (rs.mess.code === HTTP_CODE.SUCCESS) {
              this._toastrService.success(this._translateService.instant('common.notify.save.success'));
              this.dataModel.dataSource.splice(index, 1);
              this.crmTable.renderTable();
            } else {
              this._toastrService.error(rs.mess.description);
            }
          }, error => {
            this._toastrService.error(this._translateService.instant('common.notify.fail'));
          });
        }
      });
    } else {
      // xóa ở client
      this.dataModel.dataSource.splice(index, 1);
      this.crmTable.renderTable();
    }
  }

  onSubmit() {
    const object = {
      actTypeId: ACTION_TYPE.THAY_DOI_HD,
      contractProfiles: this.dataModel.dataSource.filter(item => item.fileBase64)
    };
    this._contractService.updateProfiles(object, this.selectedItem.custId, this.selectedItem.contractId).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this.action.emit({ ...this.selectedItem, tabIndex: this.tabIndex });
        this._toastrService.success(this._translateService.instant('common.notify.save.success'));
      } else {
        this._toastrService.error(rs.mess.description);
      }
    }, error => {
      this._toastrService.error(this._translateService.instant('common.notify.fail'));
    });
  }

  handleCancel() {
    this.onCancel.emit();
  }

  reScan(item) {
    const dialog = this.dialog.open(
      {
        width: '600px',
        data: { isOnlySeleted: true },
      },
      AttachFileComponent
    );

    dialog.afterClosed().subscribe(res => {
      if (res) {
        res.forEach(file => {
          const license = {
            documentTypeName: item.documentTypeName,
            documentTypeId: item.documentTypeId,
            documentName: file.fileName,
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileBase64: file.fileBase64,
            fullBase64: file.fullBase64
          };
          // goi api rescan
          this._toastrService.success(this._translateService.instant('Không làm đâu'));
        });
      }
    });
  }

}

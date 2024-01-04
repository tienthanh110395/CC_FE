import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { ResetPasswordLockOpenAccountService } from '@app/core/services/support-after-sale/reset-password-lock-open-account/reset-password-lock-open-account.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tab-profile-attach',
  templateUrl: './tab-profile-attach.component.html',
  styleUrls: ['./tab-profile-attach.component.scss']
})
export class TabProfileAttachComponent extends BaseComponent implements OnInit {
  @Input() listFileAttach = [];
  @Input() profileStatus;
  constructor(
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private _resetPasswordLockOpenAccountService: ResetPasswordLockOpenAccountService,
    private _domSanitizationService: DomSanitizer,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'document.type', field: 'documentTypeName', type: 'documentTypeName-custom' },
      { i18n: 'document.name', field: 'fileName' },
      { i18n: 'customer-care.search-information-customer.action', field: 'actionFileAttach', type: 'actionFileAttach' },
    ]
  }

  downloadFile(item) {
    this.searchInformationCustomerService.downloadFileVehicle(item.vehicleProfileId).subscribe(res => {
      FileSaver.saveAs(new Blob([res.body]), item.fileName);
    },
      err => {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      });
  }

  viewProfile(row) {
    row.documentName = row.fileName;
    this._resetPasswordLockOpenAccountService.downloadProfileByVehicle(row.vehicleProfileId).subscribe(rs => {
      row.fileData = rs;
      const checkExtension = row.fileName.split('.')[1];
      if (checkExtension != 'pdf') {
        this.openViewImageProfile(row);
      } else {
        this.openViewPdfProfile(row);
      }
    })

  }
  openViewPdfProfile(row): void {
    let reader = new FileReader();
    reader.readAsDataURL(row.fileData);
    reader.onload = (readerEvt: any) => {
      row.safeUrl = this._domSanitizationService.bypassSecurityTrustUrl(readerEvt.target.result);
      row.fullBase64 = row.safeUrl.changingThisBreaksApplicationSecurity;
      this.dialog.originalOpen(ViewFilePdfComponent, {
        data: row
      });
    }
  }
  openViewImageProfile(row): void {
    let reader = new FileReader();
    reader.readAsDataURL(row.fileData);
    reader.onload = (readerEvt: any) => {
      row.fullBase64 = this._domSanitizationService.bypassSecurityTrustUrl(readerEvt.target.result);
      this.dialog.originalOpen(ViewFileImageComponent, {
        data: row
      });
    }
  }
}

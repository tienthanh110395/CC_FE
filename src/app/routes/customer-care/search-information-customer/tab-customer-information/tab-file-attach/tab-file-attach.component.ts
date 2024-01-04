import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { ACTION_TYPE, HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tab-file-attach',
  templateUrl: './tab-file-attach.component.html',
  styleUrls: ['./tab-file-attach.component.scss'],
})
export class TabFileAttachComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() data = [];
  displayedColumns = [];
  @Input() profileStatus;
  constructor(
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _dmdcService?: DmdcService,
    public _domSanitizationService?: DomSanitizer,
  ) {
    super(translateService, dialog, toastr)
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.getData();
    } else {
      this.dataModel.dataSource = [];
      this.totalRecord = 0;
    }
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'document.type', field: 'documentTypeName' , type: 'documentTypeName-custom'},
      { i18n: 'document.name', field: 'fileName' },
      { i18n: 'common.action', field: 'action', type: 'custom' },
    ];
  }

  getData() {
    this.searchModel.actTypeId = ACTION_TYPE.DANG_KY_KH;
    this.searchInformationCustomerService.searchContractProfiles(this.searchModel, this.data[0].listContract[0].contractId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }

  downloadFile(item) {
    this.searchInformationCustomerService.downloadProfileByContract(item.contractProfileId).subscribe(res => {
      FileSaver.saveAs(new Blob([res]), item.fileName);
    },
      err => {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      });
  }

  viewProfile(row) {
    row.documentName = row.fileName;
    this.searchInformationCustomerService.downloadProfileByContract(row.contractProfileId).subscribe(rs => {
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
        data: row,
        disableClose: true,
      });
    }
  }
  openViewImageProfile(row): void {
    let reader = new FileReader();
    reader.readAsDataURL(row.fileData);
    reader.onload = (readerEvt: any) => {
      row.fullBase64 = this._domSanitizationService.bypassSecurityTrustUrl(readerEvt.target.result);
      this.dialog.originalOpen(ViewFileImageComponent, {
        data: row,
        disableClose: true,
      });
    }
  }
}

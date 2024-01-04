import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RESOURCE } from '@app/core';
import { DocumentService } from '@app/core/services/document/document.service';
import { CommonIMService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-document-report',
  templateUrl: './document-report.component.html',
  styleUrls: ['./document-report.component.scss']
})
export class DocumentReportComponent extends BaseComponent implements OnInit {
  isLoadingShop = false;
  listShop = [];
  constructor(
    private fb: FormBuilder,
    private _documentService: DocumentService
  ) {
    super(_documentService, RESOURCE.CC_PROFILE)
  }

  ngOnInit() {
    this.formSearch = this.fb.group({
      approveFromDate: [''],
      approveToDate: ['']
    });
  }

  setValueToObject(searchObj: any) {
    if (searchObj.approveFromDate) {
      searchObj.approveFromDate = searchObj.approveFromDate ? format(searchObj.approveFromDate, COMMOM_CONFIG.DATE_FORMAT) : '';
    }
    if (searchObj.approveToDate) {
      searchObj.approveToDate = searchObj.approveToDate ? format(searchObj.approveToDate, COMMOM_CONFIG.DATE_FORMAT) : '';
    }
  }

  //web-socket export excel
  exportFileExcel() {
    if (this.formSearch.valid) {
      const searchModelExcel = Object.assign({}, this.formSearch.value);
      this.setValueToObject(searchModelExcel);
      this._documentService.exportExcelDocumentReport(searchModelExcel).subscribe(res => {
        if (res['type'] === 'API') {
          const response = res['body'];
          if (response.mess.code === 2) {
          } else {
            this.toastr.error(response.mess.description);
            this.isLoading = false;
          }
        }
        if (res['type'] === 'WEBSOCKET') {
          const response = res['headers']['Content-Disposition'];
          const filename = response.split(';')[1].split('filename')[1].split('=')[1].trim();
          saveAs(new Blob([res.body]), filename);
        }
      }, () => {
      }, () => {
        this.isLoading = false;
      });
    }
  }

  //web-socket export pdf
  exportFilePdf() {
    if (this.formSearch.valid) {
      const searchModelExcel = Object.assign({}, this.formSearch.value);
      this.setValueToObject(searchModelExcel);
      this._documentService.exportPdfDocumentReport(searchModelExcel).subscribe(res => {
        if (res['type'] === 'API') {
          const response = res['body'];
          if (response.mess.code === 2) {
          } else {
            this.toastr.error(response.mess.description);
            this.isLoading = false;
          }
        }
        if (res['type'] === 'WEBSOCKET') {
          const response = res['headers']['Content-Disposition'];
          const filename = response.split(';')[1].split('filename')[1].split('=')[1].trim();
          saveAs(new Blob([res.body]), filename);
        }
      }, () => {
      }, () => {
        this.isLoading = false;
      });
    }
  }
}

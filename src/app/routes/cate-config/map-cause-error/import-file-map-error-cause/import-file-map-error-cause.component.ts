import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TicketSlaService } from '@core/services/ticket-sla/ticket-sla.service';
import { MapErrorCauseService } from '@core/services/cate-config/map-error-cause.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-import-file-map-error-cause',
  templateUrl: './import-file-map-error-cause.component.html',
  styleUrls: ['./import-file-map-error-cause.component.scss']
})
export class ImportFileMapErrorCauseComponent extends BaseComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() pageIndex: number;

  form!: FormGroup;
  fileList: File = null;

  countTable = 0;
  lstDataImport: any = [];
  displayedColumns: any = [];
  pageSizeList = [10, 50, 100];
  title!: string;

  constructor(
    private fb: FormBuilder,
    protected toastr: ToastrService,
    protected translateService: TranslateService,
    protected mapErrorCauseService: MapErrorCauseService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
  ) { super();
    this.buildForm();
  }

  ngOnInit(): void {
    this.title = this.dataInput.data['title'];
    this.buildColumn();
    this.form = this.fb.group({
      startRecord: 0,
      inputFile: ['']
    });
  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'ticketExpire.table.ExpiraCause', field: 'fileImports' },
      { i18n: 'ticketExpire.table.levelExpire', field: 'importDate' },
      { i18n: 'ticketExpire.table.ExpireCode', field: 'importUser' },
      { i18n: 'ticketExpire.table.ExpireName', field: 'fileResult' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  buildForm() {
    this.form = this.fb.group({
      inputFile: '',
      pageSize: this.pageSizeList[0],
    });
  }

  onDownloadFile(event) {
    // this._ticketPricesService.downloadTemplateTicketPrice().subscribe(res => {
    //   saveAs(res, 'template.xlsx');
    // });
    event.stopPropagation();
  }

  onFileChange(files: FileList) {
    this.fileList = files[0];
    this.form.get('inputFile').patchValue(this.fileList.name);
  }

  uploadFile() {
    let data = this.form.value;
    this.mapErrorCauseService.importFileMapError(data).subscribe(res => {
        const contentDisposition = res.headers.get('content-disposition');
        if (contentDisposition) {
          const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
          this.toastr.success(this.translateService.instant('pricelist.import-success'));
          saveAs(res.body, filename);
        } else {
          this.toastr.error(this.translateService.instant('common.file-invalid-format'));
        }
      },
      err => {
        if (err.type === 'application/octet-stream') {
          saveAs(err, 'import_fail.xlsx');
          this.toastr.error(this.translateService.instant('common.notify.err.excel.sevice_plan'));
        } else if (err.type === 'error' || err.type === 'application/json') {
          this.toastr.error(this.translateService.instant('common.notify.err.excel.sevice_plan.template.fail'));
        }
      });
  }

  onSaveFile() {
    const formData: FormData = new FormData();
    formData.append('fileImport', this.fileList);
    this.saveImportFile(formData);
  }

  saveImportFile(data) {

  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;

  }

  downloadTemplateMapError() {
    this.mapErrorCauseService.downloadTemplateMapError()
      .subscribe(res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      });
  }
}

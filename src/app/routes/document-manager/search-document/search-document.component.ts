import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { RESOURCE } from '@app/core';
import { DocumentService } from '@app/core/services/document/document.service';
import { HTTP_CODE, STATUS_BRIEFCASE, STATUS_CONTRACT } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { InfoDocumentApproveComponent } from '../approve-document/info-document/info-document.component';
import { ViewLogBriefComponent } from '../view-log-brief/view-log-brief.component';

@Component({
  selector: 'app-search-document',
  templateUrl: './search-document.component.html',
  styleUrls: ['./search-document.component.scss']
})
export class SearchDocumentComponent extends BaseComponent implements OnInit {
  @ViewChild('allStatus') private allStatus: MatOption;
  isLoadingShop = false;
  statusContract = STATUS_CONTRACT;
  statusProfile = STATUS_BRIEFCASE;
  statuses = [
    {
      value: STATUS_BRIEFCASE.CHUATIEPNHAN,
      label: this._translateService.instant('briefcase.unreception'),
    },
    {
      value: STATUS_BRIEFCASE.DAPHEDUYET,
      label: this._translateService.instant('briefcase.approval'),
    },
    { value: STATUS_BRIEFCASE.BITUCHOI, label: this._translateService.instant('briefcase.deny') },
    {
      value: STATUS_BRIEFCASE.BOSUNG,
      label: this._translateService.instant('briefcase.additional'),
    },
  ];
  contractHasVehicle = [
    {
      value: true,
      label: this._translateService.instant('briefcase.noCar'),
    },
    {
      value: true,
      label: this._translateService.instant('briefcase.haveCar'),
    }
  ];
  constructor(
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private _documentService: DocumentService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService
  ) {
    super(_documentService, RESOURCE.CC_PROFILE, _toastrService, _translateService)
  }

  ngOnInit() {
    this.buildForm();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'order', type: 'order' },
      { i18n: 'briefcase.number_contract', field: 'contractNo' },
      { i18n: 'briefcase.briefcaseStatus', field: 'status', type: 'statusName' },
      { i18n: 'customer.code', field: 'custId' },
      { i18n: 'info.documentNumber', field: 'documentNumber' },
      { i18n: 'contract.signDate', field: 'signDate', type: 'number' },
      { i18n: 'contract.reciever', field: 'createUser' },
      { i18n: 'contract.recieveDate', field: 'createDate', type: 'number' },
      { i18n: 'document.approve_person', field: 'approvedUser' },
      { i18n: 'document.approve_date', field: 'approvedDate', type: 'number' },
      { i18n: 'document.status', field: 'contractProfileStatus', type: 'profileStatusName' },
      { i18n: 'document.view', field: 'view', type: 'customView', class: 'ui-text-center' },
      { i18n: 'document.log-profile', field: 'viewLog', type: 'customViewLog', class: 'ui-text-center' },
    ];
    this.onSearch();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      contractNo: [''],
      plateNumber: [''],
      phoneNumber: [''],
      documentNumber: [''],
      profileStatus: [],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      contractHasVehicle: [null],
      startrecord: [''],
      pagesize: [this.pageSizeList[0]],
    });
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }

  getData() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      const searchObj = Object.assign({}, this.formSearch.value);
      this.setValueToObject(searchObj);
      this._documentService.searchDocument(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.totalRecord = rs.data.count;
          this.dataModel.dataSource = rs.data.listData;
          this.isLoading = false;
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  setValueToObject(searchObj: any) {
    searchObj.contractNo = searchObj.contractNo ? searchObj.contractNo.trim() : '';
    searchObj.plateNumber = searchObj.plateNumber ? searchObj.plateNumber.trim() : '';
    searchObj.phoneNumber = searchObj.phoneNumber ? searchObj.phoneNumber.trim() : '';
    searchObj.documentNumber = searchObj.documentNumber ? searchObj.documentNumber.trim() : '';
    if (searchObj.fromDate) {
      searchObj.fromDate = searchObj.fromDate ? format(searchObj.fromDate, COMMOM_CONFIG.DATE_FORMAT) : '';
    }
    if (searchObj.toDate) {
      searchObj.toDate = searchObj.toDate ? format(searchObj.toDate, COMMOM_CONFIG.DATE_FORMAT) : '';
    }
    searchObj.profileStatus = (searchObj.profileStatus && searchObj.profileStatus.length > 0) ? searchObj.profileStatus.filter(item => item !== -1).map(item => item.value).join(';') : null;
  }

  viewDocument(item) {
    this.matDialog.open(InfoDocumentApproveComponent, {
      data: { ...item, isView: true },
      width: '100%',
      disableClose: true,
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      panelClass: 'full-screen-modal',
    });
  }

  viewLogProfile(item) {
    this.matDialog.open(ViewLogBriefComponent, {
      data: { ...item, isView: true },
      width: '90%',
      disableClose: true,
    });
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }

  onChangeStatusAll() {
    if (this.allStatus.selected) {
      this.formSearch.controls.profileStatus.setValue([...this.statuses, -1]);
    } else {
      this.formSearch.controls.profileStatus.setValue([]);
    }
  }

  onChangeStatusOne() {
    if (this.allStatus.selected) {
      this.allStatus.deselect();
    }
    if (this.formSearch.controls.profileStatus.value.length == this.statuses.length) {
      this.allStatus.select();
    }
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  exportFileExcel() {
    if (this.formSearch.valid) {
      const searchModelExcel = Object.assign({}, this.formSearch.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._documentService.exportExcelDocument(searchModelExcel).subscribe(res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      }, () => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      });
    }
  }

  exportFilePdf() {
    if (this.formSearch.valid) {
      const searchModelExcel = Object.assign({}, this.formSearch.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._documentService.exportPdfDocument(searchModelExcel).subscribe(res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      }, () => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      }
      );
    }
  }
}

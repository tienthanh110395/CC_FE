import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ContractService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DocumentService } from '@app/core/services/document/document.service';
import { HTTP_CODE, STATUS_CONTRACT_PROFILE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { IColumn } from '@shared/models/icolumn';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-info-document-detail',
  templateUrl: './info-document.component.html',
  styleUrls: ['./info-document.component.scss']
})
export class InfoDocumentDetailComponent extends BaseComponent implements OnInit {
  columnsDocumentAttach: IColumn[] = [];
  formSearchDocumentAttach: FormGroup;
  pageIndexDocumentAttach = 0;
  totalRecordDocumentAttach = 0;
  isLoadingDocumentAttach = false;
  statusContractProfile = STATUS_CONTRACT_PROFILE;

  fileData = null;
  fileName = null;
  fullFileData = null;
  fileExtension = null;
  isFullSize = false;

  vehicleGroup = [];
  vehicleType = [];

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _searchInformationCustomerService: SearchInformationCustomerService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _contractService: ContractService,
    private _documentService: DocumentService,
    private _domSanitizationService?: DomSanitizer) {
    super();
  }

  ngOnInit() {
    this.vehicleGroup = AppStorage.get('vehicle-group') || [];
    this.vehicleType = AppStorage.get('vehicle-type') || [];
    this.dataModel.titlePopup = 'Thông tin khách hàng';

    this.columns = [
      { i18n: 'common.orderNumber', field: 'order', type: 'order', width: '60px' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'vehicle.owner', field: 'owner' },
      { i18n: 'vehicle.vehicleType', field: 'vehicleTypeName', type: 'vehicleTypeName' },
      { i18n: 'vehicle.vehicleTypeFee', field: 'vehicleTypeFee', type: 'vehicleTypeFee' },
      { i18n: 'vehicle.seatNumber', field: 'seatNumber', type: 'number' },
      { i18n: 'vehicle.cargoWeight', field: 'cargoWeight', type: 'number' },
      { i18n: 'vehicle.frameNumber', field: 'chassicNumber' },
      { i18n: 'vehicle.machineNumber', field: 'engineNumber' },
      { i18n: 'vehicle.rfid_epc', field: 'rfidSerial' },
    ];

    this.columnsDocumentAttach = [
      { i18n: 'common.orderNumber', field: 'order', type: 'order', width: '60px' },
      { i18n: 'document.type', field: 'documentTypeName' },
      { i18n: 'document.name', field: 'fileName' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'contract.recieveDate', field: 'createDate', type: 'number' },
      { i18n: 'document.cskhStatus', field: 'status', type: 'cskhStatus', class: 'ui-text-center' },
      { i18n: 'document.autoCheckStatus', field: 'ocrStatus', type: 'ocrStatus', class: 'ui-text-center' },
      { i18n: 'document.autoCheckResult', field: 'ocrResult', type: 'ocrResult', class: 'ui-text-center' },
      { i18n: 'common.action', field: 'action', type: 'customView', class: 'ui-text-center' }
    ];

    this.formSearch = this.fb.group({
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });

    this.formSearchDocumentAttach = this.fb.group({
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
    this.getListVehicle();
    this.searchContractProfiles();
    // get detail
    this._documentService.getProfileContract(this.data.contractId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel = Object.assign({}, this.dataModel, res.data || {});
      } else {
        this.toastr.error(this._translateService.instant('common.notify.fail'));
      }
    }, () => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });

  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getListVehicle();
  }

  onPageChangeDocumentAttach(event) {
    this.pageIndexDocumentAttach = event.pageIndex;
    this.formSearchDocumentAttach.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearchDocumentAttach.controls.pagesize.setValue(event.pageSize);
    this.searchContractProfiles();
  }

  getListVehicle() {
    this.isLoading = true;
    const searchObj = Object.assign({}, this.formSearch.value);
    this._searchInformationCustomerService.getListVehicle(this.data.contractId, searchObj).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        this.isLoading = false;
      } else {
        this._toastrService.error(rs.mess.description);
      }
    }, () => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  searchContractProfiles() {
    this.isLoadingDocumentAttach = true;
    const searchObj = Object.assign({}, this.formSearchDocumentAttach.value);
    this._documentService.getAttachementByContractId(this.data.contractId, searchObj).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSourceDocumentAttach = res.data.listData;
        this.totalRecordDocumentAttach = res.data.count;
        this.isLoadingDocumentAttach = false;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
    });
  }

  viewProfile(row) {
    this.isFullSize = false;
    if (row.contractProfileId) {
      this._contractService.downloadProfileByContract(row.contractProfileId).subscribe(rs => {
        this.handleViewProfile(row, rs);
      });
    } else if (row.vehicleProfileId) {
      this._searchInformationCustomerService.downloadFileVehicle(row.vehicleProfileId).subscribe(rs => {
        this.handleViewProfile(row, rs.body);
      });
    }
  }

  handleViewProfile(row, fileData) {
    this.fullFileData = fileData;
    this.fileName = row.fileName;
    const fileExtension = row.fileName.split('.')[1];
    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    reader.onload = (readerEvt: any) => {
      if (fileExtension === 'pdf') {
        row.safeUrl = this._domSanitizationService.bypassSecurityTrustUrl(readerEvt.target.result);
        this.fileData = row.safeUrl.changingThisBreaksApplicationSecurity;
      } else {
        this.fileData = this._domSanitizationService.bypassSecurityTrustUrl(readerEvt.target.result);
      }
      this.fileExtension = fileExtension;
    }
  }

  downloadFile() {
    saveAs(this.fullFileData, this.fileName);
  }

  print() {
    if (this.fileExtension === 'pdf') {
      const file = new Blob([this.fullFileData], { type: 'application/pdf;base64' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } else {
      const file = new Blob([this.fullFileData], { type: 'image/png;base64' });
      const fileURL = URL.createObjectURL(file);
      const popupWin = window.open();
      popupWin.document.open()
      popupWin.document.write('<html><head></head><body onload="window.print()">' + "<img src='" + fileURL + "''>" + '</html>');
      popupWin.document.close();
    }
  }

  setFullSize(bool: boolean) {
    this.isFullSize = bool;
  }

  showVehicleGroupName(id: unknown): string {
    const vehicleGroup = this.vehicleGroup.find(item => item.id + '' === id + '');
    if (vehicleGroup) return vehicleGroup.name;
    return '';
  }

  showVehicleTypeName(id: unknown): string {
    const vehicleType = this.vehicleType.find(item => item.id + '' === id + '');
    if (vehicleType) return vehicleType.name;
    return '';
  }

}

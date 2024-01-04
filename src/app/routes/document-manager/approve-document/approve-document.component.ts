import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { RESOURCE } from '@app/core';
import { DocumentService } from '@app/core/services/document/document.service';
import { ACTION_TYPE, HTTP_CODE, STATUS_BRIEFCASE, STATUS_CONTRACT } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import { ToastrService } from 'ngx-toastr';
import { ViewLogBriefComponent } from '../view-log-brief/view-log-brief.component';
import { DialogExtendDeadlineComponent } from './dialog-extend-deadline/dialog-extend-deadline.component';
import { InfoDocumentApproveComponent } from './info-document/info-document.component';

@Component({
  selector: 'app-approve-document',
  templateUrl: './approve-document.component.html',
  styleUrls: ['./approve-document.component.scss']
})
export class ApproveDocumentComponent extends BaseComponent implements OnInit {
  @ViewChild('allStatus') private allStatus: MatOption;
  @ViewChild('allActType') private allActType: MatOption;
  actTypeList = [];
  statusContract = STATUS_CONTRACT;
  statusProfile = STATUS_BRIEFCASE;
  statusBriefcase = STATUS_BRIEFCASE;
  checkValidateIcon: boolean;
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
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _documentService: DocumentService,
  ) {
    super(_documentService, RESOURCE.CC_PROFILE, _toastrService, _translateService);
  }

  ngOnInit() {
    this.buildForm();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'order', type: 'order', sticky: true },
      { i18n: 'briefcase.number_contract', field: 'contractNo' },
      { i18n: 'briefcase.briefcaseStatus', field: 'status', type: 'statusContractName' },
      { i18n: 'customer.code', field: 'custId' },
      { i18n: 'info.documentNumber', field: 'documentNumber' },
      { i18n: 'contract.signDate', field: 'signDate', type: 'number' },
      { i18n: 'contract.reciever', field: 'createUser' },
      { i18n: 'contract.recieveDate', field: 'createDate', type: 'number' },
      { i18n: 'document.approve_person', field: 'approvedUser' },
      { i18n: 'document.approve_date', field: 'approvedDate', type: 'number' },
      { i18n: 'document.status', field: 'contractProfileStatus', type: 'profileStatusName' },
      { i18n: 'common.action', field: 'view', type: 'customView', class: 'ui-text-center', width: '200px', stickyEnd: true },
    ];
    this.onSearch();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      contractNo: [''],
      plateNumber: [''],
      phoneNumber: [''],
      documentNumber: [''],
      contractHasVehicle: [],
      profileStatus: [],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      briefcaseType: [null],
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

  getStickyWidth(): string {
    const w = window.innerWidth - 100;
    return `${w}px`;
  }

  reject(item) {
    this.checkValidateIcon = true;
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('document.cancel'),
      this._translateService.instant('document.comfirm_message_reject'),
      this._translateService.instant('common.button.confirm')
    );
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const body = {
          contractId: item.contractId,
          status: item.status,
          actTypeIdContract: ACTION_TYPE.REJECT_APPROVE_CONTRACT,
        }
        this._documentService.approvalOrRejectProfile(body).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('common.notify.save.success'));
            this.checkValidateIcon = false;
            this.onSearch();
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, () => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    });
  }

  viewDocument(item) {
    const dialogRef = this.matDialog.open(InfoDocumentApproveComponent, {
      data: item,
      disableClose: true,
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: 'full-screen-modal'
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.getData();
      }
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

  onChangeActTypeAll() {
    if (this.allActType.selected) {
      this.formSearch.controls.actTypeId.setValue([...this.actTypeList, -1]);
    } else {
      this.formSearch.controls.actTypeId.setValue([]);
    }
  }

  onChangeActTypeOne() {
    if (this.allActType.selected) {
      this.allActType.deselect();
    }
    if (this.formSearch.controls.actTypeId.value.length == this.statuses.length) {
      this.allActType.select();
    }
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  showExtend(item) {
    const dialog = this.matDialog.open(
      DialogExtendDeadlineComponent, {
      width: '500px',
      data: item,
    });
    dialog.afterClosed().subscribe(rs => {
      if (rs) {
        this.getData();
      }
    });
  }

  viewLogProfile(item) {
    this.matDialog.open(ViewLogBriefComponent, {
      data: { ...item, isView: true },
      width: '90%',
      disableClose: true,
    });
  }
}

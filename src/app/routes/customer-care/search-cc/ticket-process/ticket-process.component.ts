import { AfterViewInit, Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import {
  ACTION_TYPE,
  CC_PRIORITY,
  CC_TICKET_STATUS,
  CommonCRMService,
  HTTP_CODE,
  SharedDirectoryService,
  TICKET_ASSIGN_STATUS,
} from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { PopupNotifyEmailComponent } from '../../search-information-customer/ticket/process/popup-notify-email/popup-notify-email.component';
import { PopupNotiComponent } from '../../search-information-customer/ticket/process/popup-noti/popup-noti.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-ticket-process',
  templateUrl: './ticket-process.component.html',
  styleUrls: ['./ticket-process.component.scss']
})
export class TicketProcessComponent extends BaseComponent implements OnInit {
  formGroup: FormGroup;
  formGroupDetail: FormGroup;
  formGroupCoordinate: FormGroup;
  formGroupAdjustCharge: FormGroup;
  listFileDetail = new MatTableDataSource<any>();
  listFileAdjustCharge = new MatTableDataSource<any>();
  listFileCoordinate = new MatTableDataSource<any>();
  listFormatFile = ['.jpg', '.png', '.tiff', '.bmp', '.jpeg', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  ticketSiteLv1List = [];
  ticketSiteLv2List = [];
  ticketSiteLv3List = [];
  statusList = this.getStatusList();
  customerTypeList = [];
  priorityList = [
    { value: CC_PRIORITY.NORMAL, label: this._translateService.instant('customer-care.dropdown.priority.normal') },
    { value: CC_PRIORITY.HOT, label: this._translateService.instant('customer-care.dropdown.priority.hot') },
    { value: CC_PRIORITY.VIP, label: this._translateService.instant('customer-care.dropdown.priority.vip') }
  ];
  ticketTypeLv1List = [];
  ticketTypeLv2List = [];
  ticketTypeLv3List = [];
  accountTypeList = [
    { value: 1, label: 'Tài khoản giao thông' },
  ];
  actTypeList = [];
  ticketAssignStatusList = [
    { value: TICKET_ASSIGN_STATUS.NEW, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.new') },
    { value: TICKET_ASSIGN_STATUS.CANCEL, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.cancel') },
    { value: TICKET_ASSIGN_STATUS.REJECT, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.reject') },
    { value: TICKET_ASSIGN_STATUS.RECEIVE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.receive') },
    { value: TICKET_ASSIGN_STATUS.CONCLUDE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.conclude') },
    { value: TICKET_ASSIGN_STATUS.COMPLETE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.complete') },
    { value: TICKET_ASSIGN_STATUS.CLOSE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.close') }
  ];
  currentStatus: number = null;
  minDate = new Date();
  controlProperties: any = {
    destroyReason: {
      visible: false
    },
    processResult: {
      visible: true
    }
  };
  columnsFile = [];
  displayedColumnsFile = [];

  disabledIconDelete: boolean;
  @Input() data: any = {};
  ticketStatus: string = CC_TICKET_STATUS.TAO_MOI + '';

  ticketId: number;
  plateNumber;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(private fb: FormBuilder,
    protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _commonCCService: CommonCCService,
    private _sharedDirectoryService: SharedDirectoryService,
    private _commonCRMService: CommonCRMService,
    private _ticketService: TicketService,
    private ngZone: NgZone,
    private dialog: MtxDialog,
    private actr: ActivatedRoute,
    private _router: Router,
  ) {
    super();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.ticket-history.processTime', field: 'processTime' },
      { i18n: 'customer-care.search-cc.processUnit', field: 'siteName' },
      { i18n: 'customer-care.search-cc.processUser', field: 'staffName' },
      { i18n: 'customer-care.search-cc.processContent', field: 'processContent' },
      { i18n: 'customer-care.search-cc.ticketStatus', field: 'ticketStatus' },
      { i18n: 'customer-care.search-cc.ticketAssignStatus', field: 'assignStatus' }
    ];
    super.mapColumn();
    this.formSearch = this.fb.group({
      ticketId: null,
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
    this.columnsFile = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'customer-care.search-process.fileType', field: 'fileType' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumnsFile = this.columnsFile.map(x => x.field);
    this.actr.queryParams.subscribe(res => {
      this.ticketId = Number(res.ticketId);
      this.dataModel.expireStatus = Number(res.expireStatus);
      this.dataModel.status = Number(res.status);
      this.dataModel.l1TicketTypeId = Number(res.l1TicketTypeId);
      this.dataModel.l2TicketTypeId = Number(res.l2TicketTypeId);
      this.dataModel.ticketErrorCauseIdL1 = res.ticketErrorCauseIdL1;
      this.dataModel.ticketErrorCauseIdL2 = res.ticketErrorCauseIdL2;
      this.dataModel.ticketSiteIdL1 = res.ticketSiteIdL1;
      this.dataModel.ticketSiteIdL2 = res.ticketSiteIdL2;
      this.dataModel.plateNumber = res.plateNumber;
      this.dataModel.contractNo = res.contractNo;
      this.dataModel.siteId = res.siteId;
    })
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit(): void {
    this.getTicketExpireCause();
    this.getListCustomerType();
    this.getListTicketTypeLv1();
    this.getListTicketTypeLv2(this.dataModel.l1TicketTypeId);
    this.getListTicketTypeLv3(this.dataModel.l2TicketTypeId);
    this.getListTicketSiteLv1();
    this.getListTicketSiteLv2(this.dataModel.ticketSiteIdL1);
    this.getListTicketSiteLv3(this.dataModel.ticketSiteIdL2);
    this.buildForm();
    this.buildFormAdjustCharge();
    this.buildFormDetail();
    this.bindDataErrorCauses();
    this.buildFormCoordinate();
  }
  async bindDataErrorCauses() {
    this.dataModel.listTicketErrorCauses = await this.getTicketErrorCause();
    this.dataModel.listTicketErrorCauses2 = await this.getTicketErrorCause(this.dataModel.ticketErrorCauseIdL1);
    this.dataModel.listTicketErrorCauses3 = await this.getTicketErrorCause(this.dataModel.ticketErrorCauseIdL2);
    this.getValueFormGroup();
    this.getValueFormDetail();
    this.getValueFormAdjustCharge();
    this.getValueFormCoordinate();
  }

  getStatusList() {
    return [
      { value: CC_TICKET_STATUS.TAO_MOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.new') },
      { value: CC_TICKET_STATUS.DANG_XU_LY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.process') },
      { value: CC_TICKET_STATUS.XU_LY_XONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.doneProcess') },
      { value: CC_TICKET_STATUS.DONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.close') },
      { value: CC_TICKET_STATUS.HUY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.cancel') },
      { value: CC_TICKET_STATUS.THEO_DOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.follow') }
    ];
  }

  getValueFormCoordinate() {
    this._ticketService.getTicketAssignInfo(this.ticketId).subscribe(res => {
      if (res.data?.ticketStatus != 1 && res.data?.ticketStatus != null) {
        this.formGroupCoordinate.controls.createUser.setValue(res.data.ticketAssignProcessEntitys.find(x => x.status == res.data.ticketStatus)?.staffCode || '');
        this.formGroupCoordinate.controls.contentProgress.setValue(res.data.ticketAssignProcessEntitys.find(x => x.status == res.data.ticketStatus)?.processResult || '');
      } else {
        this.formGroupCoordinate.controls.createUser.setValue('');
        this.formGroupCoordinate.controls.contentProgress.setValue('');
      }
      if (res.data?.toSiteId) {
        this.getListTicketSiteLv2(res.data.toSiteId);
      }

      //ẩn hiện icon delete form xử lý yêu cầu hỗ trợ
      if (res.data?.ticketStatus == 1) {
        this.disabledIconDelete = true;
      } else if (res.data?.ticketStatus != 1) {
        this.disabledIconDelete = false;
      }

      this.formGroupCoordinate.controls.ticketAssignId.setValue(res.data?.ticketAssignId ? res.data?.ticketAssignId : null);
      this.formGroupCoordinate.controls.ticketId.setValue(res.data?.ticketId ? res.data?.ticketId : null);
      this.formGroupCoordinate.controls.fromSiteId.setValue(res.data?.fromSiteId ? res.data?.fromSiteId : null);
      this.formGroupCoordinate.controls.toSiteId.setValue(Number(res.data?.toSiteId) ? Number(res.data?.toSiteId) : null);
      this.formGroupCoordinate.controls.toSiteL2Id.setValue(Number(res.data?.toSiteL2Id) ? Number(res.data?.toSiteL2Id) : null);
      this.formGroupCoordinate.controls.toSiteEmail.setValue(res.data?.toSiteEmail ? res.data?.toSiteEmail : null);
      this.formGroupCoordinate.controls.assignContent.setValue(res.data?.assignContent ? res.data?.assignContent : null);
      this.formGroupCoordinate.controls.slaDate.setValue(res.data?.slaDate ? moment(res.data?.slaDate, COMMOM_CONFIG.DATE_TIME_FORMAT_3).toDate() : null);
      this.formGroupCoordinate.controls.ticketStatus.setValue(Number(res.data?.ticketStatus) ? Number(res.data?.ticketStatus) : CC_TICKET_STATUS.TAO_MOI);
      this.listFileCoordinate.data = res.data?.ticketAttachmentEntityList.map(x => {
        x.fileType = x.type == 4 ? 'Yêu cầu phối hợp' : '' || x.type == 5 ? 'Kết quả xử lý của các đơn vị phối hợp' : '';
        return x;
      });
    })
    this.pathValueFormCoordinate(this.formGroupCoordinate.value);
  }

  pathValueFormCoordinate(formValue) {
    this.formGroupCoordinate.patchValue({
      ticketStatus:
        formValue.ticketStatus ? parseInt(formValue.ticketStatus) : CC_TICKET_STATUS.HUY ||
          formValue.ticketStatus ? parseInt(formValue.ticketStatus) : CC_TICKET_STATUS.DONG ||
            formValue.ticketStatus ? parseInt(formValue.ticketStatus) : CC_TICKET_STATUS.DANG_XU_LY ||
              formValue.ticketStatus ? parseInt(formValue.ticketStatus) : CC_TICKET_STATUS.XU_LY_XONG ||
                formValue.ticketStatus ? parseInt(formValue.ticketStatus) : CC_TICKET_STATUS.THEO_DOI ||
                  formValue.ticketStatus ? parseInt(formValue.ticketStatus) : CC_TICKET_STATUS.KET_LUAN,
    })
  }

  buildFormCoordinate() {
    this.formGroupCoordinate = this.fb.group({
      ticketAssignId: [],
      ticketId: [],
      fromSiteId: [],
      toSiteId: ['', Validators.required],
      toSiteL2Id: [''],
      toSiteEmail: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT)]],
      assignContent: ['', Validators.required],
      slaDate: ['', Validators.required],
      createUser: [''],
      ticketStatus: ['', Validators.required],
      contentProgress: [''],
    });
  }

  getValueFormDetail() {
    this._ticketService.getDetailProcess(this.ticketId).subscribe(res => {
      if (res.mess.code == 1) {
        const infoDetailProcess = res.data.listData[0];
        this.formGroupDetail.controls.priorityId.setValue(infoDetailProcess.priorityId ? infoDetailProcess.priorityId : null);
        this.formGroupDetail.controls.l1TicketTypeId.setValue(infoDetailProcess.l1TicketTypeId ? infoDetailProcess.l1TicketTypeId : null);
        this.formGroupDetail.controls.l2TicketTypeId.setValue(infoDetailProcess.l2TicketTypeId ? infoDetailProcess.l2TicketTypeId : null);
        this.formGroupDetail.controls.l3TicketTypeId.setValue(infoDetailProcess.l3TicketTypeId ? infoDetailProcess.l3TicketTypeId : null);
        this.formGroupDetail.controls.status.setValue(Number(infoDetailProcess.status) ? Number(infoDetailProcess.status) : CC_TICKET_STATUS.TAO_MOI);
        this.formGroupDetail.controls.email.setValue(infoDetailProcess.email ? infoDetailProcess.email : null);
        this.formGroupDetail.controls.destroyReason.setValue(infoDetailProcess.destroyReason ? infoDetailProcess.destroyReason : null);
        this.formGroupDetail.controls.processResult.setValue(infoDetailProcess.processResult ? infoDetailProcess.processResult : null);
        this.formGroupDetail.controls.processTime.setValue(infoDetailProcess.slaDate ? infoDetailProcess.slaDate : null);
        this.formGroupDetail.controls.phoneNumber.setValue(infoDetailProcess.phoneNumber ? infoDetailProcess.phoneNumber : null);
        this.formGroupDetail.controls.ticketErrorCauseIdL1.setValue(infoDetailProcess.ticketErrorCauseIdL1 ? infoDetailProcess.ticketErrorCauseIdL1 : null);
        this.formGroupDetail.controls.ticketErrorCauseIdL2.setValue(infoDetailProcess.ticketErrorCauseIdL2 ? infoDetailProcess.ticketErrorCauseIdL2 : null);
        this.formGroupDetail.controls.ticketErrorCauseIdL3.setValue(infoDetailProcess.ticketErrorCauseIdL3 ? infoDetailProcess.ticketErrorCauseIdL3 : null);
        this.formGroupDetail.controls.ticketSiteIdL1.setValue(infoDetailProcess.ticketSiteIdL1 ? infoDetailProcess.ticketSiteIdL1 : null);
        this.formGroupDetail.controls.ticketSiteIdL2.setValue(infoDetailProcess.ticketSiteIdL2 ? infoDetailProcess.ticketSiteIdL2 : null);
        this.formGroupDetail.controls.ticketSiteIdL3.setValue(infoDetailProcess.ticketSiteIdL3 ? infoDetailProcess.ticketSiteIdL3 : null);
        this.formGroupDetail.controls.ticketExpireCauseIdL1.setValue(infoDetailProcess.ticketExpireCauseIdL1 ? infoDetailProcess.ticketExpireCauseIdL1 : null);
        this.formGroupDetail.controls.ticketExpireCauseIdL2.setValue(infoDetailProcess.ticketExpireCauseIdL2 ? infoDetailProcess.ticketExpireCauseIdL2 : null);
        this.formGroupDetail.controls.ticketExpireCauseIdL3.setValue(infoDetailProcess.ticketExpireCauseIdL3 ? infoDetailProcess.ticketExpireCauseIdL3 : null);
        this.formGroupDetail.controls.ticketExpireSiteId.setValue(infoDetailProcess.ticketExpireSiteId ? infoDetailProcess.ticketExpireSiteId : null);
        this.formGroupDetail.controls.processContent.setValue(infoDetailProcess.processContent ? infoDetailProcess.processContent : null);
        this.formGroupDetail.controls.ticketExpireCauseIdL3.setValue(infoDetailProcess.ticketExpireCauseIdL3 ? infoDetailProcess.ticketExpireCauseIdL3 : null);
        this.listFileDetail.data = infoDetailProcess.listFiles?.map(x => {
          x.fileType = x.type == 1 ? 'Phản ánh' : x.type == 2 ? 'Chi tiết xử lý' : x.type == 3 ? 'Yêu cầu điều chỉnh cước' :
            x.type == 4 ? 'Yêu cầu phối hợp' : x.type == 5 ? 'Kết quả xử lý của các đơn vị phối hợp' : '';
          return x;
        })
      }
    })
  }

  async buildFormDetail() {
    this.formGroupDetail = this.fb.group({
      ticketId: [''],
      ticketProcessId: [''],
      priorityId: [''],
      l1TicketTypeId: ['', Validators.required],
      l2TicketTypeId: ['', Validators.required],
      l3TicketTypeId: ['', Validators.required],
      sourceId: [''],
      status: ['', Validators.required],
      processTime: ['', Validators.required],
      destroyReason: [''],
      processResult: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      ticketErrorCauseIdL1: ['', Validators.required],
      ticketErrorCauseIdL2: [''],
      ticketErrorCauseIdL3: [''],
      processContent: [''],
      createUser: AppStorage.getUserLogin(),
      createDate: new Date(),
      ticketSiteIdL1: [''],
      ticketSiteIdL2: [''],
      ticketSiteIdL3: [''],
      ticketExpireCauseIdL1: [''],
      ticketExpireCauseIdL2: [''],
      ticketExpireCauseIdL3: [''],
      ticketExpireSiteId: [''],
      email: [this.formGroup.controls.email.value || '', Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT)],
    });

    this.currentStatus = this.dataModel.status ? this.dataModel.status : CC_TICKET_STATUS.TAO_MOI;
    // reset status
    this.statusList = this.getStatusList();
    this.filterListStatus(this.currentStatus);
    this.disableFormDetail(this.currentStatus);
    this.formGroupDetail.markAllAsTouched();
  }

  getValueFormGroup() {
    this._ticketService.getTicketById(this.ticketId).subscribe(res => {
      if (res.mess.code == 1) {
        const infoCustomer = res.data;
        this.formGroup.controls.plateNumber.setValue(infoCustomer.plateNumber ? infoCustomer.plateNumber : null);
        this.formGroup.controls.custName.setValue(infoCustomer.custName ? infoCustomer.custName : null);
        this.formGroup.controls.custType.setValue(Number(infoCustomer.custTypeId) ? Number(infoCustomer.custTypeId) : null);
        this.formGroup.controls.contactNumber.setValue(infoCustomer.phoneNumber ? infoCustomer.phoneNumber : null);
        this.formGroup.controls.email.setValue(infoCustomer.email ? infoCustomer.email : null);
        this.formGroup.controls.ticketStatus.setValue(Number(infoCustomer.status) ? Number(infoCustomer.status) : null);
        this.formGroup.controls.receiveSource.setValue(infoCustomer.sourceName ? infoCustomer.sourceName : null);
        this.formGroup.controls.address.setValue(infoCustomer.custAddress ? infoCustomer.custAddress : null);
        this.formGroup.controls.ticketContent.setValue(infoCustomer.contentReceive ? infoCustomer.contentReceive : null);
      }
    })
    this.getListTicketHistory();
  }

  buildForm() {
    this.formGroup = this.fb.group({
      contractId: [''],
      plateNumber: [''],
      custName: [''],
      documentNumber: [''],
      contractNo: [''],
      custType: [''],
      contactNumber: [''],
      email: [''],
      ticketStatus: [''],
      receiveSource: [''],
      address: [''],
      ticketContent: ['']
    });
  }

  getListTicketHistory() {
    const body = {
      ticketId: this.ticketId,
      pagesize: 10,
      startrecord: 0,
    }
    this._ticketService.getHistoryProcess(body).subscribe(res => {
      this.dataModel.dataSource = res.data.listData;
      this.totalRecord = res.data.count;
    })
  }

  getValueFormAdjustCharge() {
    this.formGroupAdjustCharge.controls.ticketId.setValue(this.ticketId);
    this.formGroupAdjustCharge.controls.contractNo.setValue(this.dataModel.contractNo);
    this.formGroupAdjustCharge.controls.plateNumber.setValue(this.dataModel.plateNumber);
    this.formGroupAdjustCharge.controls.siteId.setValue(Number(this.dataModel.siteId));
    this._ticketService.getAdjustChargeInfo(this.ticketId).subscribe(res => {
      if (res.mess.code == 1) {
        this.formGroupAdjustCharge.controls.payType.setValue(res.data.payType ? res.data.payType : null);
        this.formGroupAdjustCharge.controls.adjustAmount.setValue(res.data.adjustAmount ? res.data.adjustAmount : null);
        this.formGroupAdjustCharge.controls.reason.setValue(res.data.reason ? res.data.reason : null);
        this.formGroupAdjustCharge.controls.adjustContent.setValue(res.data.adjustContent ? res.data.adjustContent : null);
        this.listFileAdjustCharge.data = res.data.ticketAttachmentEntityList || null;
      }
    })
  }

  buildFormAdjustCharge() {
    this.formGroupAdjustCharge = this.fb.group({
      ticketAdjustChargeId: [''],
      ticketId: [''],
      contractNo: [''],
      plateNumber: [''],
      accountType: [1],
      payType: ['D', Validators.required],
      adjustAmount: ['', [Validators.required]], //, Validators.pattern('^[+-]?[0-9]*')
      reason: ['', Validators.required],
      adjustContent: ['', Validators.required],
      siteId: ['', Validators.required],
      createUser: AppStorage.getUserLogin(),
      createDate: [''],
      assignDate: ['']
    });
  }

  onChangeTicketSiteLv1(option) {
    this.formGroupCoordinate.controls.toSiteL2Id.setValue(null);
    this.ticketSiteLv2List = [];
    if (option?.value) {
      this.getListTicketSiteLv2(option.value);
      this.getTicketSla(option.value);
    }
  }

  onChangeTicketSiteLv2(option) {
    if (option?.value) {
      this.getTicketSla(option.value);
    }
  }

  getActTypeList() {
    if (AppStorage.get('list-act-type')) {
      this.actTypeList = AppStorage.get('list-act-type').map(val => ({ value: val.actTypeId, label: val.name }));
    } else {
      this._commonCRMService.searchActType().subscribe(res => {
        const data = res.data?.listData || [];
        this.actTypeList = data.map(val => ({ value: val.actTypeId, label: val.name }));
      });
    }
  }

  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.customerTypeList = res.data.map(val => {
        return {
          value: val.cust_type_id,
          label: val.name
        }
      });
    });
  }

  getListTicketSiteLv1() {
    this._commonCCService.getListTicketSite().subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketSiteLv1List = data.map(val => ({ value: Number(val.siteId), label: val.siteName }));
    })
  }

  getListTicketSiteLv2(parendId) {
    this._commonCCService.getListTicketSite(parendId).subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketSiteLv2List = data.map(val => ({ value: Number(val.siteId), label: val.siteName }));
    });
  }

  getListTicketSiteLv3(parendId) {
    this._commonCCService.getListTicketSite(parendId).subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketSiteLv3List = data.map(val => ({ value: Number(val.siteId), label: val.siteName }));
    });
  }

  getListTicketTypeLv1() {
    if (AppStorage.get('list-ticket-type')) {
      this.ticketTypeLv1List = AppStorage.get('list-ticket-type').map(val => ({ value: val.ticketTypeId, label: val.name }));
    } else {
      this._commonCCService.getListTicketType().subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketTypeLv1List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
      });
    }
  }

  getListTicketTypeLv2(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketTypeLv2List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  search(data) {
    this.formSearch.controls.ticketId.setValue(data.ticketId);
    this.isLoading = true;
    const searchObj = Object.assign({}, this.formSearch.value);
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item]
      }
    }
    if (this.formSearch.value.startrecord == 0) {
      searchObj.startrecord = 0;
    }
    this._ticketService.getHistoryProcess(searchObj).subscribe(rs => {
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

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.search(this.formSearch.value);
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
    switch (type) {
      case 'detail':
        listFile = this.listFileDetail.data;
        break;
      case 'adjustCharge':
        listFile = this.listFileAdjustCharge.data;
        break;
      case 'coordinate':
        listFile = this.listFileCoordinate.data;
        break;
      default:
        break;
    }
    const findFile = listFile.findIndex(f => f.fileName === file.fileName);
    if (findFile >= 0) {
      const detail = [...this.listFileDetail.data];
      const adjustCharge = [...this.listFileAdjustCharge.data];
      const coordinate = [...this.listFileCoordinate.data];
      switch (type) {
        case 'detail':

          detail.splice(findFile, 1);
          this.listFileDetail.data = detail;
          // this.listFileDetail.splice(findFile, 1);
          break;
        case 'adjustCharge':

          adjustCharge.splice(findFile, 1);
          this.listFileAdjustCharge.data = adjustCharge;
          // this.listFileAdjustCharge.splice(findFile, 1);
          break;
        case 'coordinate':

          coordinate.splice(findFile, 1);
          this.listFileCoordinate.data = coordinate;
          // this.listFileCoordinate.splice(findFile, 1);
          break;
        default:
          break;
      }
    }
  }

  convertFile(file, type) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    const lastIndexFile = file.name.lastIndexOf('.');
    reader.onload = () => {
      const index = reader.result.toString().indexOf('base64,');
      const base64 = index > 0 ? reader.result.toString().substring(index + 7) : '';
      const fileSelected = {
        fileName: file.name,
        fileType: file.name.substring(lastIndexFile),
        fileSize: file.size,
        fileBase64: base64,
        fullBase64: reader.result.toString(),
        file
      };
      switch (type) {
        case 'detail':
          this.listFileDetail.data = [...this.listFileDetail.data, fileSelected];
          break;
        case 'adjustCharge':
          this.listFileAdjustCharge.data = [...this.listFileAdjustCharge.data, fileSelected];
          break;
        case 'coordinate':
          this.listFileCoordinate.data = [...this.listFileCoordinate.data, fileSelected];
          break;
        default:
          break;
      }
    };
  }
  saveTicketProcess() {
    const object = Object.assign({}, this.formGroupDetail.value);
    const lstFile = this.listFileDetail.data.filter(item => (!item.attachmentId));
    object.attachmentFiles = lstFile.map(f => {
      return {
        fileName: f.fileName,
        base64Data: f.fileBase64,
      };
    });

    object.staffCode = AppStorage.get('user-info')?.staffCode;
    object.staffName = AppStorage.get('user-info')?.staffName;
    object.siteId = AppStorage.get('user-info')?.siteId || null;
    //TODO: tạm thời
    object.reasonLevel1 = object.ticketErrorCauseIdL1;
    object.reasonLevel2 = object.ticketErrorCauseIdL2;
    object.reasonLevel3 = object.ticketErrorCauseIdL3;
    if (this.formGroupDetail.controls.status.value == CC_TICKET_STATUS.DANG_XU_LY) {
      object.actTypeId = ACTION_TYPE.TICKET_PROCESS
    } else if (this.formGroupDetail.controls.status.value == CC_TICKET_STATUS.XU_LY_XONG) {
      object.actTypeId = ACTION_TYPE.TICKET_EVALUTED
    } else if (this.formGroupDetail.controls.status.value == CC_TICKET_STATUS.DONG) {
      object.actTypeId = ACTION_TYPE.TICKET_CLOSE
    } else if (this.formGroupDetail.controls.status.value == CC_TICKET_STATUS.HUY) {
      object.actTypeId = ACTION_TYPE.TICKET_DESTROY
    } else if (this.formGroupDetail.controls.status.value == CC_TICKET_STATUS.THEO_DOI) {
      object.actTypeId = ACTION_TYPE.TICKET_FOLLOW
    }
    object.ticketId = this.ticketId;
    object.sla = null;
    this._ticketService.saveTicketProcess(object).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.disableForm();
        this._toastrService.success(this._translateService.instant('common.notify.save.success'));
        this.currentStatus = this.formGroupDetail.value.status;
      } else {
        this._toastrService.error(res.mess.description);
      }
    }, () => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onSubmitCoordinate() {
    const object = Object.assign({}, this.formGroupCoordinate.value);

    object.attachmentFiles = this.listFileCoordinate.data?.filter(item => (!item.attachmentId)).map(f => {
      return {
        fileName: f.fileName,
        base64Data: f.fileBase64,
      };
    });

    object.siteId = AppStorage.get('user-info')?.siteId;
    object.fromSiteId = AppStorage.get('user-info')?.siteId;
    object.fromUsername = AppStorage.getUserLogin();
    object.toUsername = object.toSiteEmail?.split('@').length > 0 ? object.toSiteEmail.split('@')[0] : null;
    object.staffCode = AppStorage.get('user-info')?.staffCode;
    object.staffName = AppStorage.get('user-info')?.staffName;
    object.slaDate = object.slaDate ? moment(object.slaDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT_3) : null;
    object.actTypeId = ACTION_TYPE.TICKET_CREATE_SR;
    object.ticketId = this.ticketId;
    this._ticketService.requestHandleTicket(object).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('common.notify.save.success'));
        this._ticketService.getTicketAssignInfo(res.data.ticketId).subscribe(res2 => {
          this.getValueFormCoordinate();
        }, () => {
          this.getValueFormCoordinate();
        });
      } else {
        this._toastrService.error(res.mess.description);
      }
    }, () => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onSubmitAdjustCharge() {
    const object = Object.assign({}, this.formGroupAdjustCharge.value);
    for (const attr in object) {
      if (typeof object[attr] === 'string') {
        object[attr] = object[attr] ? object[attr].trim() : null;
      }
    }
    object.requestDate = format(new Date(), COMMOM_CONFIG.DATE_TIME_FORMAT_1);
    object.actTypeId = ACTION_TYPE.TICKET_CREATE_ADJUST;
    object.attachmentFiles = this.listFileAdjustCharge.data.filter(item => (!item.attachmentId)).map(f => {
      return {
        fileName: f.fileName,
        base64Data: f.fileBase64,
      };
    });

    this._ticketService.saveAdjustCharge(object).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('common.notify.save.success'));
        this._ticketService.getAdjustChargeInfo(res.data.ticketId).subscribe(res2 => {
          this.getValueFormAdjustCharge();
        }, () => {
          this.getValueFormAdjustCharge();
        });
      } else {
        this._toastrService.error(res.mess.description);
      }
    }, () => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  showStatusName(value: any): string {
    const statusList = this.getStatusList();
    const status = statusList.find(item => item.value == value);
    if (status) return status.label;
    return '';
  }

  showAssignStatusName(value: any): string {
    const status = this.ticketAssignStatusList.find(item => item.value + '' === value + '');
    if (status) return status.label;
    return '';
  }

  handleSendNotify() {
    // window.open(`tel:${this.formGroupDetail.controls.phoneNumber.value}`, '_self');
    let object: any = {};
    object.ticketId = this.ticketId;
    object.phone = this.formGroup.controls.contactNumber.value;
    object.email = this.formGroup.controls.email.value;
    object.contractId = this.formGroup.controls.contractId.value;
    const dialogRef = this.showPopup();
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        object.content = rs;
        this._ticketService.sendNotify(object).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('customer-care.ticket.notify.sendNotify.success'));
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, () => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    })
  }

  handleSendSms() {
    let object: any = {};
    object.ticketId = this.ticketId;
    object.phone = this.formGroupDetail.controls.phoneNumber.value;
    object.email = this.formGroup.controls.email.value;
    const dialogRef = this.showPopup();
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        object.content = rs;
        this._ticketService.sendSms(object).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('customer-care.ticket.notify.sendSms.success'));
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, () => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    })
  }

  handleSendEmail() {
    if (!this.formGroupDetail.controls.email.value) {
      this._toastrService.warning(this._translateService.instant('customer-care.ticket.notify.sendEmail.invalid-email'));
      return;
    }
    let object: any = {};
    object.ticketId = this.ticketId;
    object.phone = this.formGroup.controls.contactNumber.value;
    object.email = this.formGroupDetail.controls.email.value;
    const dialogRef = this.showPopupEmail();
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        object.content = rs.content;
        object.title = rs.title;
        object.attachmentFiles = rs.attachmentFiles;
        this._ticketService.sendEmail(object).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('customer-care.ticket.notify.sendEmail.success'));
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, () => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    })
  }
  showPopup(): MatDialogRef<any, any> {
    return this.dialog.open({
      width: '40%'
    },
      PopupNotiComponent
    );
  }
  showPopupEmail(): MatDialogRef<any, any> {
    return this.dialog.open({
      width: '60%'
    },
      PopupNotifyEmailComponent
    );
  }
  onDownloadFile(item: any) {
    if (item.filePath) {
      this._ticketService.downloadFileNew(item.attachmentId).subscribe(res => {
        saveAs(res.body, item.fileName);
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    } else if (item.file) {
      saveAs(item.file, item.fileName);
    }
  }

  showActTypeName(value: any): string {
    const actType = this.actTypeList.find(item => item.value + '' === value + '');
    if (actType) return actType.label;
    return value;
  }

  getTicketSla(siteId: any) {
    if (siteId && !this.formGroupCoordinate.controls.slaDate.value) {
      const ticketTypeId = this.formGroupDetail.controls.l3TicketTypeId.value || this.formGroupDetail.controls.l2TicketTypeId.value;
      const sourceId = this.formGroupDetail.controls.sourceId.value;
      const priorityId = this.formGroupDetail.controls.priorityId.value;
      this._commonCCService.getTicketSLA({ siteId, ticketTypeId, sourceId, priorityId }).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          const data = res.data?.listData?.length > 0 ? res.data.listData[0] : null;
          if (data && data.sla) {
            this.formGroupCoordinate.controls.slaDate.setValue(new Date(new Date().getTime() + (data.sla * 24 * 60 * 60 * 1000)));
          }
        } else {
          this._toastrService.error(res.mess.description);
        }
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  filterListStatus(currentStatus) {
    if (CC_TICKET_STATUS.TAO_MOI === currentStatus) {
      this.statusList = this.getStatusList();
    } else {
      this.statusList = this.statusList.filter(item => CC_TICKET_STATUS.TAO_MOI !== item.value);
    }
  }

  get checkDisabledCoordinate() {
    return this.formGroupCoordinate.get('ticketStatus').value !== TICKET_ASSIGN_STATUS.NEW;
  }

  get checkDisabledButton() {
    return [CC_TICKET_STATUS.HUY, CC_TICKET_STATUS.DONG].includes(this.currentStatus);
  }

  onChangeStatus(option) {
    if (option?.value) {
      this.disableFormDetail(option.value);
    }
    this.formGroupDetail.controls.ticketExpireCauseIdL1.reset();
    this.formGroupDetail.controls.ticketExpireCauseIdL2.reset();
    this.formGroupDetail.controls.ticketExpireCauseIdL3.reset();
    this.formGroupDetail.controls.ticketExpireSiteId.reset();
    // nếu quá hạn mà chọn đóng phản ánh
    if (this.dataModel.expireStatus == 2 && option.value == CC_TICKET_STATUS.DONG) {
      this.formGroupDetail.controls.ticketExpireCauseIdL1.setValidators(Validators.required);
      this.formGroupDetail.controls.ticketExpireCauseIdL1.updateValueAndValidity();
      this.formGroupDetail.controls.ticketExpireCauseIdL2.setValidators(Validators.required);
      this.formGroupDetail.controls.ticketExpireCauseIdL2.updateValueAndValidity();
      this.formGroupDetail.controls.ticketExpireCauseIdL3.setValidators(Validators.required);
      this.formGroupDetail.controls.ticketExpireCauseIdL3.updateValueAndValidity();
      this.formGroupDetail.controls.ticketExpireSiteId.setValidators(Validators.required);
      this.formGroupDetail.controls.ticketExpireSiteId.updateValueAndValidity();
    } else {
      this.formGroupDetail.controls.ticketExpireCauseIdL1.clearValidators();
      this.formGroupDetail.controls.ticketExpireCauseIdL1.updateValueAndValidity();
      this.formGroupDetail.controls.ticketExpireCauseIdL2.clearValidators();
      this.formGroupDetail.controls.ticketExpireCauseIdL3.updateValueAndValidity();
      this.formGroupDetail.controls.ticketExpireCauseIdL3.clearValidators();
      this.formGroupDetail.controls.ticketExpireCauseIdL3.updateValueAndValidity();
      this.formGroupDetail.controls.ticketExpireSiteId.clearValidators();
      this.formGroupDetail.controls.ticketExpireSiteId.updateValueAndValidity();
    }
  }

  disableFormDetail(status: number) {
    if (status) {
      this.controlProperties.destroyReason.visible = false;
      // this.controlProperties.processResult.visible = false;
      this.formGroupDetail.controls.destroyReason.clearValidators();
      // this.formGroupDetail.controls.processResult.clearValidators();
      // if ([CC_TICKET_STATUS.CONCLUDE, CC_TICKET_STATUS.COMPLETE].includes(status)) {
      //   this.controlProperties.processResult.visible = true;
      //   this.formGroupDetail.controls.processResult.setValidators([Validators.required]);
      // } else {
      //   if (![CC_TICKET_STATUS.CLOSE].includes(status)) {
      //     this.formGroupDetail.controls.processResult.setValue('');
      //   }
      // }
      if ([CC_TICKET_STATUS.HUY].includes(status)) {
        this.controlProperties.destroyReason.visible = true;
        this.formGroupDetail.controls.destroyReason.setValidators([Validators.required]);
      } else {
        this.formGroupDetail.controls.destroyReason.setValue('');
      }
      this.formGroupDetail.controls.destroyReason.updateValueAndValidity();
      // this.formGroupDetail.controls.processResult.updateValueAndValidity();
    }
  }

  disableForm() {
    // default
    this.formGroupAdjustCharge.controls.adjustAmount.enable();
    this.formGroupAdjustCharge.controls.payType.enable();
    this.formGroupAdjustCharge.controls.reason.enable();
    this.formGroupAdjustCharge.controls.adjustContent.enable();
    this.formGroupAdjustCharge.controls.siteId.enable();

    this.formGroupCoordinate.controls.toSiteId.enable();
    this.formGroupCoordinate.controls.toSiteEmail.enable();
    this.formGroupCoordinate.controls.toSiteL2Id.enable();
    this.formGroupCoordinate.controls.assignContent.enable();
    this.formGroupCoordinate.controls.slaDate.enable();
    if (this.checkDisabledButton) {
      // disable form tao yeu cau dieu chinh cuoc
      this.formGroupAdjustCharge.controls.adjustAmount.disable();
      this.formGroupAdjustCharge.controls.payType.disable();
      this.formGroupAdjustCharge.controls.reason.disable();
      this.formGroupAdjustCharge.controls.adjustContent.disable();
      this.formGroupAdjustCharge.controls.siteId.disable();

      // disable form tao yeu cau phoi hop
      this.formGroupCoordinate.controls.toSiteId.disable();
      this.formGroupCoordinate.controls.toSiteEmail.disable();
      this.formGroupCoordinate.controls.toSiteL2Id.disable();
      this.formGroupCoordinate.controls.assignContent.disable();
      this.formGroupCoordinate.controls.slaDate.disable();
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
        }, () => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    } else {
      this.onDownloadFile(item);
    }
  }

  checkFormatDate(value: string): boolean {
    if (!value) return false;
    if (!(/^\d{2}\/\d{2}\/\d{4}$/.test(value))) return true;
    const parts = value.split("/");
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    return isNaN(day) || isNaN(month) || isNaN(year);
  }

  getListTicketTypeLv3(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data.listData || [];
      this.ticketTypeLv3List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  onChangeTicketTypeLv1(option) {
    this.formGroupDetail.controls.l2TicketTypeId.setValue(null);
    this.formGroupDetail.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv2List = [];
    this.ticketTypeLv3List = [];
    if (option?.value) {
      this.getListTicketTypeLv2(option.value);
    }

  }

  onChangeTicketTypeLv2(option) {
    this.formGroupDetail.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv3List = [];
    if (option?.value) {
      this.getListTicketTypeLv3(option.value);
      this.getSlaForTicket(option.value);
    }
  }
  onChangeTicketTypeLv3(option) {
    if (option?.value) {
      this.getSlaForTicket(option.value);
    } else {
      this.getSlaForTicket(this.formGroupDetail.value.l2TicketTypeId);
    }
  }
  async getTicketErrorCause(parentId?: any) {
    const respond = await this._commonCCService.getTicketErrorCause(parentId ?? '').toPromise();
    if (respond.data) {
      return respond.data
    } else {
      return []
    }
  }

  async onChangeCauseError1() {
    this.dataModel.listTicketErrorCauses3 = [];
    this.dataModel.listTicketErrorCauses2 = [];
    this.formGroupDetail.controls.ticketErrorCauseIdL2.setValue(null);
    this.formGroupDetail.controls.ticketErrorCauseIdL3.setValue(null);
    if (this.formGroupDetail.value.ticketErrorCauseIdL1) {
      this.dataModel.listTicketErrorCauses2 = await this.getTicketErrorCause(this.formGroupDetail.value.ticketErrorCauseIdL1) ?? [];
    }
  }
  async onChangeCauseError2() {
    this.dataModel.listTicketErrorCauses3 = [];
    this.formGroupDetail.controls.ticketErrorCauseIdL3.setValue(null);
    if (this.formGroupDetail.value.ticketErrorCauseIdL2) {
      this.dataModel.listTicketErrorCauses3 = await this.getTicketErrorCause(this.formGroupDetail.value.ticketErrorCauseIdL2) ?? [];
    }
  }
  onChangeTicketSite(option) {
    this.formGroupDetail.controls.ticketSiteIdL2.setValue(null);
    this.formGroupDetail.controls.ticketSiteIdL3.setValue(null);
    this.dataModel.ticketSiteLv2 = [];
    this.dataModel.ticketSiteLv3 = [];
    if (option?.value) {
      this.getListTicketSiteLv2(option.value);
    }
  }
  onChangeTicketSite2(option) {
    this.formGroupDetail.controls.ticketSiteIdL3.setValue(null);
    this.dataModel.ticketSiteLv3 = [];
    if (option?.value) {
      this.getListTicketSiteLv3(option.value);
    }
  }
  getTicketExpireCause(parentId?: any) {
    this._commonCCService.getExpireCause(parentId ?? '').subscribe(rs => {
      if (rs.mess.code == 1) {
        this.dataModel.listTicketExpireCause = rs.data;
      }
    });
  }
  onChangeExpireCause() {
    this.formGroupDetail.controls.ticketExpireCauseIdL2.setValue(null);
    this.formGroupDetail.controls.ticketExpireCauseIdL3.setValue(null);
    this.dataModel.listTicketExpireCause2 = [];
    this.dataModel.listTicketExpireCause3 = [];
    if (this.formGroupDetail.value.ticketExpireCauseIdL1) {
      this._commonCCService.getExpireCause(this.formGroupDetail.value.ticketExpireCauseIdL1).subscribe(rs => {
        if (rs.mess.code == 1) {
          this.dataModel.listTicketExpireCause2 = rs.data ?? [];
        }
      });
    }
  }
  onChangeExpireCause2() {
    this.formGroupDetail.controls.ticketExpireCauseIdL3.setValue(null);
    this.dataModel.listTicketExpireCause3 = [];
    if (this.formGroupDetail.value.ticketExpireCauseIdL2) {
      this._commonCCService.getExpireCause(this.formGroupDetail.value.ticketExpireCauseIdL2).subscribe(rs => {
        if (rs.mess.code == 1) {
          this.dataModel.listTicketExpireCause3 = rs.data ?? [];
        }
      });
    }
  }
  getSlaForTicket(ticketTypeId) {
    let priorityId = this.formGroupDetail.controls.priorityId.value;
    if (priorityId) {
      this._commonCCService.getTicketSLA({ ticketTypeId, priorityId: priorityId }).subscribe(rs => {
        if (rs.mess.code == 1) {
          this.formGroupDetail.controls.processTime.setValue(rs.data.slaDate);
        } else {
          this.formGroupDetail.controls.processTime.setValue(null);
          this.formGroupDetail.controls.processTime.setErrors({ sla: true });
          this.formGroupDetail.controls.processTime.markAsTouched();
        }
      });
    }
  }

  onBack() {
    this._router.navigate(['customer-care', 'search-cc']);
  }
}

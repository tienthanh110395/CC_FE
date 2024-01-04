import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { ACTION_TYPE, CC_PRIORITY, CommonCRMService, HTTP_CODE, TICKET_ASSIGN_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-ticket-assign-info-tab',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class TicketAssignInfoTabComponent extends BaseComponent implements OnInit {
  @Output() onChangeIsEdit: EventEmitter<any> = new EventEmitter();
  @Input() data: any = {};
  isClickUpdateProcess: boolean = false;
  listFile = new MatTableDataSource<any>();
  @ViewChild('paginator2') paginator2: MatPaginator;
  priorityList = [
    { value: CC_PRIORITY.NORMAL, label: this._translateService.instant('customer-care.dropdown.priority.normal') },
    { value: CC_PRIORITY.HOT, label: this._translateService.instant('customer-care.dropdown.priority.hot') },
    { value: CC_PRIORITY.VIP, label: this._translateService.instant('customer-care.dropdown.priority.vip') }
  ];
  ticketStatusList = [
    { value: TICKET_ASSIGN_STATUS.NEW, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.new') },
    { value: TICKET_ASSIGN_STATUS.CANCEL, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.cancel') },
    { value: TICKET_ASSIGN_STATUS.REJECT, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.reject') },
    { value: TICKET_ASSIGN_STATUS.RECEIVE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.receive') },
    { value: TICKET_ASSIGN_STATUS.CONCLUDE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.conclude') },
    { value: TICKET_ASSIGN_STATUS.COMPLETE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.complete') },
    { value: TICKET_ASSIGN_STATUS.CLOSE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.close') }
  ];
  provinceList = [];
  districtList = [];
  communeList = [];
  customerTypeList = [];
  ticketSiteLv1List = [];
  errorTypeList = [
    { value: 1, label: this._translateService.instant('customer-care.dropdown.errorType.incurred') },
    { value: 2, label: this._translateService.instant('customer-care.dropdown.errorType.single') }
  ];
  actTypeList = [];
  controlProperties: any = {};
  selectedIndex: number = 0;
  currentStatus: number;
  statusSave: number;

  processTicketForm: FormGroup;
  listFormatFile = ['.jpg', '.png', '.tiff', '.bmp', '.jpeg', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];

  constructor(private fb: FormBuilder,
    protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _commonCCService: CommonCCService,
    private _ticketService: TicketService,
    private _commonCRMService: CommonCRMService,
    public dialog?: MtxDialog) {
    super();
  }

  ngOnInit(): void {
    this.getActTypeList();
    this.getListTicketSiteLv1();
    this.buildForm(this.data);
    this.initControlProperties();
    this.listFile.data = [];
  }

  buildForm(data: any) {
    this.getTicketSla(data);
    this.processTicketForm = this.fb.group({
      ticketId: [data.ticketId || null],
      ticketAssignId: [data.ticketAssignId || null],
      priorityId: [data.priorityId ? parseInt(data.priorityId) : null],
      sourceName: [data.sourceName || ''],
      groupPA: [data.groupPA || ''],
      subgroupPA: [data.subgroupPA || ''],
      detailPA: [data.detailPA || ''],
      assignContent: [data.assignContent || ''],
      contentReceive: [data.contentReceive || ''],
      siteId: [data.toSiteId ? parseInt(data.toSiteId) : null],
      processResult: ['', Validators.required],
      userName: [''],
      staffCode: [''],
      staffName: [''],
      actTypeId: [],
      status: [data.status ? parseInt(data.status) : null, Validators.required],
      userProcess: [data.userProcess || ''],
      processContent: [data.assignContent || ''],
      createUser: [AppStorage.getUserLogin()],
      createDate: [new Date()],
      // startEndTime: [(data.slaDate && data.createDate) ? (format(new Date(data.createDate), 'dd/MM/yyyy') + ' - ' + format(new Date(data.slaDate), 'dd/MM/yyyy')) : ''],
      startEndTime: [''],
      responseTime: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]],
      toUsername: [data.userProcess || ''],
      ticketStatus: [data.ticketStatus == TICKET_ASSIGN_STATUS.NEW ? "Tạo mới" : TICKET_ASSIGN_STATUS.CANCEL ? "Hủy xử lý" : TICKET_ASSIGN_STATUS.CLOSE ? "Đóng xử lý" :
        TICKET_ASSIGN_STATUS.RECEIVE ? "Đang xử lý" : TICKET_ASSIGN_STATUS.REJECT ? "Từ chối" : TICKET_ASSIGN_STATUS.COMPLETE ? "Hoàn thành xử lý"
          : TICKET_ASSIGN_STATUS.CONCLUDE ? "Kết luận xử lý" : ""],
      contentProgress: [''],
    });
    // set file
    this.showFileQuote();
    this.currentStatus = data.status ? parseInt(data.status) : 0;
    this.statusSave = data.status ? parseInt(data.status) : 0;
    this.filterListStatus(this.currentStatus);
    this.setIndexStepper(this.currentStatus);
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  showFileQuote() {
    const body = {
      ticketId: this.processTicketForm.value.ticketId,
      pagesize: 1000,
      startrecord: this.processTicketForm.value.startrecord == 0,
    }
    this._ticketService.searchTicketAttachment(body).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
      }
    })
  }

  initControlProperties() {
    this.controlProperties = {
      processResult: {
        visible: false, label: ''
      },
      userName: {
        visible: false, label: ''
      },
      file: {
        visible: false, label: ''
      },
      actType: {
        visible: false, label: ''
      }
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

  getListTicketSiteLv1() {
    if (AppStorage.get('list-ticket-site')) {
      this.ticketSiteLv1List = AppStorage.get('list-ticket-site').map(val => ({ value: val.siteId, label: val.siteName }));
    } else {
      this._commonCCService.getListTicketSite().subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketSiteLv1List = data.map(val => ({ value: val.siteId, label: val.siteName }));
      });
    }
  }

  onSubmit(): void {
    const object = Object.assign({}, this.processTicketForm.value);
    for (const attr in object) {
      if (typeof object[attr] === 'string') {
        object[attr] = object[attr] ? object[attr].trim() : null;
      }
    }
    object.attachmentFiles = this.listFile?.data.map(f => {
      return {
        fileName: f.fileName,
        base64Data: f.fileBase64,
      };
    });
    object.processTime = format(new Date(), COMMOM_CONFIG.DATE_TIME_FORMAT_1);
    object.createDate = format(object.createDate, COMMOM_CONFIG.DATE_TIME_FORMAT_1);
    object.status = this.statusSave || object.status;
    if (this.processTicketForm.controls.status.value == TICKET_ASSIGN_STATUS.REJECT) {
      object.actTypeId = ACTION_TYPE.SR_REJECT
    } else if (this.processTicketForm.controls.status.value == TICKET_ASSIGN_STATUS.RECEIVE) {
      object.actTypeId = ACTION_TYPE.SR_RECEIVE
    } else if (this.processTicketForm.controls.status.value == TICKET_ASSIGN_STATUS.CLOSE) {
      object.actTypeId = ACTION_TYPE.SR_CLOSE
    }
    this._ticketService.saveResultProcess(object).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('common.notify.save.success'));
        this.onChangeIsEdit.emit(false);
        this.onSearch();
      } else {
        this._toastrService.error(res.mess.description);
      }
    }, err => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
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

  updateProcess() {
    this.isClickUpdateProcess = false;
    this.controlProperties.file.visible = false;
    this.processTicketForm.controls.processResult.setValue('');
    this.processTicketForm.controls.actTypeId.setValue(null);
    this.processTicketForm.controls.userName.setValue('');
    this.processTicketForm.controls.staffCode.setValue('');
    this.processTicketForm.controls.staffName.setValue('');
    this.listFile.data = [];
    const status = this.processTicketForm.controls.status.value;
    this.statusSave = status;
    if (status !== this.currentStatus) {
      this.setControlProperties(status);
      this.isClickUpdateProcess = true;
      this.processTicketForm.controls.userName.setValue(AppStorage.getUserLogin());
      this.processTicketForm.controls.staffCode.setValue(AppStorage.get('user-info')?.staffCode);
      this.processTicketForm.controls.staffName.setValue(AppStorage.get('user-info')?.staffName);
    }
  }

  setControlProperties(status: number) {
    this.initControlProperties();
    switch (status) {
      case TICKET_ASSIGN_STATUS.CANCEL:
        this.controlProperties.file.visible = true;
        this.controlProperties.processResult.label = 'Lý do hủy yêu cầu hỗ trợ';
        this.controlProperties.userName.label = 'Nhân viên hủy';
        break;
      case TICKET_ASSIGN_STATUS.REJECT:
        this.controlProperties.file.visible = true;
        this.controlProperties.processResult.label = 'Lý do từ chối tiếp nhận yêu cầu';
        this.controlProperties.userName.label = 'Nhân viên từ chối';
        break;
      case TICKET_ASSIGN_STATUS.RECEIVE:
        this.controlProperties.processResult.label = 'Nội dung tiếp nhận';
        this.controlProperties.userName.label = 'Nhân viên tiếp nhận';
        break;
      // case TICKET_ASSIGN_STATUS.CONCLUDE:
      //   this.controlProperties.file.visible = true;
      //   this.controlProperties.processResult.label = 'Nội dung kết luận';
      //   this.controlProperties.userName.label = 'Nhân viên kết luận';
      //   break;
      case TICKET_ASSIGN_STATUS.COMPLETE:
        this.controlProperties.file.visible = true;
        this.controlProperties.actType.visible = true;
        this.controlProperties.processResult.label = 'Kết quả xử lý';
        this.controlProperties.userName.label = 'Nhân viên hoàn thành';
        break;
      case TICKET_ASSIGN_STATUS.CLOSE:
        this.controlProperties.file.visible = true;
        this.controlProperties.processResult.label = 'Nội dung đóng yêu cầu';
        this.controlProperties.userName.label = 'Nhân viên đóng';
        break;
      default:
        break;
    }
  }

  filterListStatus(currentStatus) {
    const currentStatusList = this.ticketStatusList.filter(item => item.value === currentStatus);
    if (this.data.toSiteId == AppStorage.get('user-info')?.siteId) {
      if (currentStatus === TICKET_ASSIGN_STATUS.NEW) {
        currentStatusList.push({ value: TICKET_ASSIGN_STATUS.REJECT, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.reject') });
        currentStatusList.push({ value: TICKET_ASSIGN_STATUS.RECEIVE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.receive') });
      }
      if (currentStatus === TICKET_ASSIGN_STATUS.RECEIVE) {
        currentStatusList.push({ value: TICKET_ASSIGN_STATUS.CLOSE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.close') });
      }
    }
    this.ticketStatusList = [...currentStatusList];
  }

  setIndexStepper(currentStatus) {
    if (currentStatus === TICKET_ASSIGN_STATUS.NEW) {
      this.selectedIndex = 0;
    } else if (currentStatus === TICKET_ASSIGN_STATUS.COMPLETE) {
      this.selectedIndex = 2;
    } else if (currentStatus === TICKET_ASSIGN_STATUS.CLOSE) {
      this.selectedIndex = 3;
    } else {
      this.selectedIndex = 1;
    }
  }

  getTicketSla(data: any) {
    if (data.toSiteId && data.sourceId && (data.l3TicketTypeId || data.l2TicketTypeId)) {
      const ticketTypeId = data.l3TicketTypeId || data.l2TicketTypeId;
      this._commonCCService.getTicketSLA({ siteId: data.toSiteId, ticketTypeId, sourceId: data.sourceId, priorityId: data.priorityId }).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          const data = res.data?.listData?.length > 0 ? res.data.listData[0] : null;
          if (data && data.sla) {
            // this.processTicketForm.controls.responseTime.setValue(data.sla + ' ngày');
          }
        } else {
          this._toastrService.error(res.mess.description);
        }
      }, err => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  get checkDisableUpdate() {
    const status = this.processTicketForm.controls.status.value;
    if ((status && this.currentStatus && status !== this.currentStatus && status !== TICKET_ASSIGN_STATUS.NEW) || (status === this.currentStatus && this.statusSave !== status)) {
      return false;
    }
    return true;
  }

}

import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Inject, Injector, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { ACTION_TYPE, CC_PRIORITY, CC_TICKET_KIND, CC_TICKET_STATUS, HTTP_CODE, SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format, toDate } from 'date-fns';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { take, takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styleUrls: ['./ticket-edit.component.scss']
})
export class TicketEditComponent extends BaseComponent implements OnInit {

  header;
  priorityList = [
    { value: CC_PRIORITY.NORMAL, label: this._translateService.instant('customer-care.dropdown.priority.normal') },
    { value: CC_PRIORITY.HOT, label: this._translateService.instant('customer-care.dropdown.priority.hot') },
    { value: CC_PRIORITY.VIP, label: this._translateService.instant('customer-care.dropdown.priority.vip') }
  ];
  ticketSourceList = [];
  ticketTypeLv1List = [];
  ticketTypeLv2List = [];
  ticketTypeLv3List = [];
  ticketStatusList = [
    { value: CC_TICKET_STATUS.TAO_MOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.new') },
    { value: CC_TICKET_STATUS.DANG_XU_LY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.process') },
    { value: CC_TICKET_STATUS.XU_LY_XONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.doneProcess') },
    { value: CC_TICKET_STATUS.DONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.close') },
    { value: CC_TICKET_STATUS.HUY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.cancel') },
    { value: CC_TICKET_STATUS.THEO_DOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.follow') },
  ];
  provinceList = [];
  districtList = [];
  communeList = [];
  errorTypeList = [
    { value: CC_TICKET_KIND.PHAT_SINH, label: this._translateService.instant('customer-care.dropdown.errorType.incurred') },
    { value: CC_TICKET_KIND.DON_LE, label: this._translateService.instant('customer-care.dropdown.errorType.single') }
  ];
  customerTypeList = [];
  stationList = [];

  processTicketForm: FormGroup;
  listFile = new MatTableDataSource<any>();
  @ViewChild('paginator') paginator: MatPaginator;
  columns = [];
  displayedColumns = [];
  listFormatFile = ['.jpg', '.png', '.tiff', '.bmp', '.jpeg', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  dataReset = {};
  ticketId = '';
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(
    private fb: FormBuilder,
    protected _translateService: TranslateService,
    protected toastr: ToastrService,
    private _sharedDirectoryService: SharedDirectoryService,
    private _commonCCService: CommonCCService,
    private _ticketService: TicketService,
    private ngZone: NgZone,
    _injector: Injector,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<TicketEditComponent>>,
    public dialog?: MtxDialog,
  ) {
    super();
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {
    this.header = this._translateService.instant('ticket-statistic.editTicket');
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
    this.buildForm();
    this.getListProvince();
    this.getListTicketTypeLv1();
    this.getListTicketTypeLv2(Number(this.dataDialog.l1TicketTypeId));
    this.getListTicketTypeLv3(Number(this.dataDialog.l2TicketTypeId));
    this.getListCustomerType();
    this.getListTicketSource();
    this.getListStageAndStation();
    this.processTicketForm.controls.requestDate.valid;
  }

  ngAfterViewInit(): void {
    this.listFile.paginator = this.paginator;
  }

  buildForm() {
    this.processTicketForm = this.fb.group({
      custId: [],
      contractId: [],
      plateTypeCode: [],
      contractNo: [],
      custTypeId: [],
      plateNumber: ['', [Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      phoneContact: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      custName: ['', Validators.required],
      priorityId: [CC_PRIORITY.NORMAL, Validators.required],
      sourceId: ['', Validators.required],
      l1TicketTypeId: ['', Validators.required],
      l2TicketTypeId: ['', Validators.required],
      l3TicketTypeId: ['', Validators.required],
      status: [CC_TICKET_STATUS.TAO_MOI, Validators.required],
      province: ['', Validators.required],
      district: [],
      commune: [],
      requestDate: [null],
      location: [],
      ticketKind: [],
      email: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT)]],
      custAddress: [],
      contentReceive: ['', Validators.required],
      supportInfo: [],
      note: [],
      stationId: [],
      slaDate: ['', Validators.required],
    });
    this.pathValueFormTicketEdit();
  }

  getListStageAndStation() {
    this._sharedDirectoryService.getStageAndStation().subscribe(res => {
      this.stationList = res.data.listData;
    });
  }

  getListTicketSource() {
    if (AppStorage.get('list-ticket-source')) {
      this.ticketSourceList = AppStorage.get('list-ticket-source').map(val => ({ value: val.ticketSourceId, label: val.name }));
    } else {
      this._commonCCService.getListTicketSource().subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketSourceList = data.map(val => {
          return { value: val.ticketSourceId, label: val.name }
        });
      });
    }
  }

  getListCustomerType() {
    if (AppStorage.get('list-cust-type')) {
      this.customerTypeList = AppStorage.get('list-cust-type').map(val => ({ value: val.cust_type_id, label: val.name }));
    } else {
      this._sharedDirectoryService.getListCustomerType().subscribe(res => {
        this.customerTypeList = res.data?.map(val => ({ value: val.cust_type_id, label: val.name }));
      });
    }
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
      const data = res.data.listData || [];
      this.ticketTypeLv2List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
    this.changeValueTicketType();
  }

  getListTicketTypeLv3(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data.listData || [];
      this.ticketTypeLv3List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  onChangeTicketTypeLv1(option) {
    this.processTicketForm.controls.slaDate.setValue('');
    this.processTicketForm.controls.l2TicketTypeId.setValue(null);
    this.processTicketForm.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv2List = [];
    this.ticketTypeLv3List = [];
    if (option?.value) {
      this.getListTicketTypeLv2(option.value);
    }
  }

  onChangeTicketTypeLv2(option) {
    this.processTicketForm.controls.slaDate.setValue('');
    this.processTicketForm.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv3List = [];
    if (option?.value) {
      this._ticketService.getTicketTypes(option.value).subscribe(res => {
        this.processTicketForm.get('contentReceive').setValue(res.data.listData[0]?.ticketTemplate || '');
      })
      this.getListTicketTypeLv3(option.value);
      const sourceId = this.processTicketForm.controls.sourceId.value;
      const priorityId = this.processTicketForm.controls.priorityId.value;
      this.getTicketSla(option.value, sourceId, priorityId);
    }
  }

  onChangeTicketTypeLv3(option) {
    this.processTicketForm.controls.slaDate.setValue('');
    if (option?.value) {
      this._ticketService.getTicketTypes(option.value).subscribe(res => {
        this.processTicketForm.get('contentReceive').setValue(res.data.listData[0]?.ticketTemplate || '');
      })
      const sourceId = this.processTicketForm.controls.sourceId.value;
      const priorityId = this.processTicketForm.controls.priorityId.value;
      this.getTicketSla(option.value, sourceId, priorityId);
    } else {
      const sourceId = this.processTicketForm.controls.sourceId.value;
      const l2TicketTypeId = this.processTicketForm.controls.l2TicketTypeId.value;
      const priorityId = this.processTicketForm.controls.priorityId.value;
      this.getTicketSla(l2TicketTypeId, sourceId, priorityId);
    }
  }

  getListProvince() {
    if (AppStorage.get('list-province')) {
      this.provinceList = AppStorage.get('list-province').map(val => ({ value: val.area_code, label: val.name }));
    } else {
      this._sharedDirectoryService.getListAreas().subscribe(res => {
        this.provinceList = res.data.map(val => ({ value: val.area_code, label: val.name }));
      });
    }
  }

  getListDistrict(province, value?) {
    this._sharedDirectoryService.getListAreas(province).subscribe(res => {
      this.districtList = res.data.map(val => ({ value: val.area_code, label: val.name }));
      if (value) {
        const district = this.districtList.find(item => item.value === value);
        this.processTicketForm.controls.district.setValue(district);
      }
    });
  }

  getListCommune(district, value?) {
    this._sharedDirectoryService.getListAreas(district).subscribe(res => {
      this.communeList = res.data.map(val => ({ value: val.area_code, label: val.name }));
      if (value) {
        const commune = this.communeList.find(item => item.value === value);
        this.processTicketForm.controls.commune.setValue(commune);
      }
    });
  }

  onChangeProvince(option) {
    this.processTicketForm.controls.district.setValue(null);
    this.processTicketForm.controls.commune.setValue(null);
    this.districtList = [];
    this.communeList = [];
    if (option && option.value) {
      this.getListDistrict(option.value);
    }
  }

  onChangeDistrict(option) {
    this.processTicketForm.controls.commune.setValue(null);
    this.communeList = [];
    if (option && option.value) {
      this.getListCommune(option.value);
    }
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
          this.toastr.warning(this._translateService.instant('common.capacityFile') + `${listFile[i].name} ` + this._translateService.instant('common.max5MB'));
        } else {
          this.toastr.warning(`File ${listFile[i].name} ` + this._translateService.instant('common.invalidFormat'));
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
    const reader = new FileReader();
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
  }

  onDownloadFile(item: any) {
    if (item.filePath) {
      this._ticketService.downloadFileNew(item.attachmentId).subscribe(res => {
        saveAs(res.body, item.fileName);
      }, () => {
        this.toastr.error(this._translateService.instant('common.500Error'));
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
            this.toastr.error(this._translateService.instant('common.500Error'));
          }
        }, () => {
          this.toastr.error(this._translateService.instant('common.500Error'));
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

    if (isNaN(day) || isNaN(month) || isNaN(year)) return true;

    return false;
  }

  onChangePriority(option) {
    if (option?.value) {
      const ticketTypeId = this.processTicketForm.controls.l3TicketTypeId.value || this.processTicketForm.controls.l2TicketTypeId.value;
      const sourceId = this.processTicketForm.controls.sourceId.value;
      if (ticketTypeId) {
        this.getTicketSla(ticketTypeId, sourceId, option.value);
      }
    }
  }

  getTicketSla(ticketTypeId, sourceId, priorityId) {
    if (priorityId) {
      this._commonCCService.getTicketSLA({ siteId: AppStorage.get('user-info')?.siteId || null, ticketTypeId, sourceId, priorityId }).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.processTicketForm.get('slaDate').setValue(moment(res.data.slaDate, COMMOM_CONFIG.DATE_FORMAT).toDate());
        } else {
          this.toastr.error(res.mess.description);
        }
      }, () => {
        this.toastr.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  changeValueTicketType() {
    this.processTicketForm.get('l2TicketTypeId').valueChanges.pipe(takeUntil(this.subDestroy$)).subscribe(val => {
      if (val == 24 || val == 25 || val == 31) {
        this.processTicketForm.controls.plateNumber.setValidators([Validators.required, Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]);
        this.processTicketForm.controls.plateNumber.updateValueAndValidity();
        this.processTicketForm.controls.stationId.setValidators(Validators.required);
        this.processTicketForm.controls.stationId.updateValueAndValidity();
      } else {
        this.processTicketForm.controls.plateNumber.clearValidators();
        this.processTicketForm.controls.plateNumber.updateValueAndValidity();
        this.processTicketForm.controls.stationId.clearValidators();
        this.processTicketForm.controls.stationId.updateValueAndValidity();
      }
    })
  }

  pathValueFormTicketEdit() {
    this.processTicketForm.controls.contractNo.setValue(this.dataDialog.contractNo ? this.dataDialog.contractNo : null);//Số hợp đồng
    this.processTicketForm.controls.custTypeId.setValue(Number(this.dataDialog.custTypeId) ? Number(this.dataDialog.custTypeId) : null);//Loại khách hàng
    this.processTicketForm.controls.plateNumber.setValue(this.dataDialog.plateNumber ? this.dataDialog.plateNumber : null);//Biển số xe
    this.processTicketForm.controls.phoneNumber.setValue(this.dataDialog.phoneNumber ? this.dataDialog.phoneNumber : null);//Số điện thoại đăng ký theo HĐ
    this.processTicketForm.controls.custName.setValue(this.dataDialog.custName ? this.dataDialog.custName : null);//Người phản ánh
    this.processTicketForm.controls.email.setValue(this.dataDialog.email ? this.dataDialog.email : null);//Email
    this.processTicketForm.controls.custAddress.setValue(this.dataDialog.custAddress ? this.dataDialog.custAddress : null);//Địa chỉ
    this.processTicketForm.controls.priorityId.setValue(Number(this.dataDialog.priorityId) ? Number(this.dataDialog.priorityId) : null);//Mức độ ưu tiên
    this.processTicketForm.controls.sourceId.setValue(Number(this.dataDialog.sourceId) ? Number(this.dataDialog.sourceId) : null);//Hình thức tiếp nhận
    this.processTicketForm.controls.l1TicketTypeId.setValue(Number(this.dataDialog.l1TicketTypeId) ? Number(this.dataDialog.l1TicketTypeId) : null);//Nhóm phản ánh
    this.processTicketForm.controls.l2TicketTypeId.setValue(Number(this.dataDialog.l2TicketTypeId) ? Number(this.dataDialog.l2TicketTypeId) : null);//Thể loại
    this.processTicketForm.controls.l3TicketTypeId.setValue(Number(this.dataDialog.l3TicketTypeId) ? Number(this.dataDialog.l3TicketTypeId) : null);//Loại phản ánh
    this.processTicketForm.controls.location.setValue(this.dataDialog.custAddress ? this.dataDialog.custAddress : null);//Địa chỉ chi tiết
    this.processTicketForm.controls.province.setValue(this.dataDialog.provinceName ? this.dataDialog.provinceName : null);//Tỉnh/thành phố
    this.processTicketForm.controls.district.setValue(this.dataDialog.districtName ? this.dataDialog.districtName : null);//Quận/huyện
    this.processTicketForm.controls.commune.setValue(this.dataDialog.communeName ? this.dataDialog.communeName : null);//Xã/phường
    if (this.dataDialog.stationId || this.dataDialog.stageId) {
      if (this.dataDialog.stationId) {
        this.processTicketForm.controls.stationId.setValue(this.dataDialog.stationId ? this.dataDialog.stationId : null);//Trạm/đoạn
      }
      if (this.dataDialog.stageId) {
        this.processTicketForm.controls.stationId.setValue(this.dataDialog.stageId ? this.dataDialog.stageId : null);//Trạm/đoạn
      }
    }
    this.processTicketForm.controls.ticketKind.setValue(Number(this.dataDialog.ticketKind) ? Number(this.dataDialog.ticketKind) : null);//Loại lỗi
    if (this.dataDialog.requestDate == null) {
      this.processTicketForm.controls.requestDate.valid;
    } else {
      this.processTicketForm.controls.requestDate.setValue(moment(this.dataDialog.requestDate, COMMOM_CONFIG.DATE_FORMAT).toDate() ? moment(this.dataDialog.requestDate, COMMOM_CONFIG.DATE_FORMAT).toDate() : null);//Ngày hẹn khách hàng
    }
    this.processTicketForm.controls.status.setValue(Number(this.dataDialog.status) ? Number(this.dataDialog.status) : null);//Trạng thái phản ánh
    this.processTicketForm.controls.slaDate.setValue(moment(this.dataDialog.slaDate, COMMOM_CONFIG.DATE_FORMAT).toDate() ? moment(this.dataDialog.slaDate, COMMOM_CONFIG.DATE_FORMAT).toDate() : null);//Hạn xử lý theo KPI
    this.processTicketForm.controls.phoneContact.setValue(this.dataDialog.phoneContact ? this.dataDialog.phoneContact : null);//Số điện thoại liên hệ
    this.processTicketForm.controls.supportInfo.setValue(this.dataDialog.supportInfo ? this.dataDialog.supportInfo : null);//Thông tin bổ sung
    this.processTicketForm.controls.note.setValue(this.dataDialog.note ? this.dataDialog.note : null);//Ghi chú
    this.processTicketForm.controls.contentReceive.setValue(this.dataDialog.contentReceive ? this.dataDialog.contentReceive : null);//Nội dung phản ánh
  }

  onSubmit() {
    const object = Object.assign({}, this.processTicketForm.value ? this.processTicketForm.value : null);
    this.ticketId = this.dataDialog.ticketId;
    object.custTypeId = Number(this.dataDialog.custTypeId) ? Number(this.dataDialog.custTypeId) : null;
    object.priorityId = Number(this.dataDialog.priorityId) ? Number(this.dataDialog.priorityId) : null;
    object.sourceId = Number(this.dataDialog.sourceId) ? Number(this.dataDialog.sourceId) : null;
    object.l1TicketTypeId = Number(this.dataDialog.l1TicketTypeId) ? Number(this.dataDialog.l1TicketTypeId) : null;
    object.l2TicketTypeId = Number(this.dataDialog.l2TicketTypeId) ? Number(this.dataDialog.l2TicketTypeId) : null;
    object.l3TicketTypeId = Number(this.dataDialog.l3TicketTypeId) ? Number(this.dataDialog.l3TicketTypeId) : null;
    object.status = Number(this.dataDialog.status) ? Number(this.dataDialog.status) : null;
    object.ticketKind = Number(this.dataDialog.ticketKind) ? Number(this.dataDialog.ticketKind) : null;
    if (object.stationId == null || object.stageId == null) {
      object.stationId = object.stationId ? object.stageId : null;
    } else {
      if (object.stationId.stationId) {
        object.stationId = object.stationId.stationId ? object.stationId.stationId : null;
        object.stationName = object.stationId.stationName ? object.stationId.stationName : null;
      } else if (object.stationId.stageId) {
        object.stageId = object.stationId.stageId ? object.stationId.stageId : null;
        object.stageName = object.stationId.stageName ? object.stationId.stageName : null;
      }
    }
    object.requestDate = object.requestDate ? format(object.requestDate, COMMOM_CONFIG.DATE_TIME_FORMAT_1) : null;
    object.slaDate = object.slaDate ? format(object.slaDate, COMMOM_CONFIG.DATE_TIME_FORMAT_1) : null;
    object.actTypeId = ACTION_TYPE.TICKET_EDIT,
      object.attachmentFiles = this.listFile?.data.map(f => {
        return {
          fileName: f.fileName,
          base64Data: f.fileBase64,
        };
      });
    this._ticketService.editTicket(this.ticketId, object).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.toastr.success(this._translateService.instant('ticket-statistic.editTicket-success'));
      } else {
        this.toastr.error(res.mess.description);
      }
    }, err => {
      this.toastr.error(this._translateService.instant('common.500Error'));
    })
  }
}

import { AfterViewInit, Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { ACTION_TYPE, CC_PRIORITY, CC_TICKET_STATUS, HTTP_CODE, SharedDirectoryService } from '@app/shared';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { format } from 'date-fns';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { saveAs } from 'file-saver'
@Component({
  selector: 'app-receive-tab',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})

export class ReceiveTicketTabComponent extends BaseComponent implements OnInit, AfterViewInit {

  @Input() data: any = {};
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
    // { value: CC_TICKET_STATUS.DANG_XU_LY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.process') },
    // { value: CC_TICKET_STATUS.XU_LY_XONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.doneProcess') },
    // { value: CC_TICKET_STATUS.DONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.close') },
    // { value: CC_TICKET_STATUS.HUY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.cancel') },
    // { value: CC_TICKET_STATUS.THEO_DOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.follow') },
  ];
  provinceList = [];
  districtList = [];
  communeList = [];
  errorTypeList = [
    { value: '1', label: this._translateService.instant('customer-care.dropdown.errorType.incurred') },
    { value: '2', label: this._translateService.instant('customer-care.dropdown.errorType.single') }
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
  minDate = new Date();
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(private fb: FormBuilder,
    protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _sharedDirectoryService: SharedDirectoryService,
    private _commonCCService: CommonCCService,
    private _ticketService: TicketService,
    private _searchInfoService: SearchInformationCustomerService,
    private ngZone: NgZone,
    public dialog?: MtxDialog,) {
    super();
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit(): void {
    this.buildForm({});
    const data = this.data?.length > 0 ? this.data[0] : {};
    if (data && data.listContract?.length > 0 && data.listContract[0].contractId) {
      this._searchInfoService.getListVehicle(data.listContract[0].contractId).subscribe(res => {
        this.dataReset = Object.assign(res.data.listData?.length > 0 ? res.data.listData[0] : {}, data);
        this.buildForm(this.dataReset);
      }, () => {
        this.buildForm(data);
      });
    }
    this.getListProvince();
    this.getListTicketTypeLv1();
    this.getListCustomerType();
    this.getListTicketSource();
    this.getListStageAndStation();
    this.listFile.data = [];
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  ngAfterViewInit(): void {
    this.listFile.paginator = this.paginator;
  }

  buildForm(data?: any) {
    this.processTicketForm = this.fb.group({
      custId: [data?.custId],
      contractId: [data?.listContract?.length > 0 ? data?.listContract[0].contractId : ''],
      plateTypeCode: [data?.plateTypeCode],
      contractNo: [data?.listContract?.length > 0 ? data?.listContract[0].contractNo : ''],
      custTypeId: [data?.custTypeId || ''],
      plateNumber: [data?.plateNumber || '', [Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]],
      phoneNumber: [data?.phoneNumber || '', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      phoneContact: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      custName: [data?.custName || '', Validators.required],
      priorityId: [CC_PRIORITY.NORMAL, Validators.required],
      sourceId: ['', Validators.required],
      l1TicketTypeId: ['', Validators.required],
      l2TicketTypeId: ['', Validators.required],
      l3TicketTypeId: ['', Validators.required],
      status: [CC_TICKET_STATUS.TAO_MOI, Validators.required],
      province: ['', Validators.required],
      district: [''],
      commune: [''],
      requestDate: [''],
      location: [data?.areaName || ''],
      ticketKind: [''],
      email: [data?.email || '', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT)]],
      custAddress: [data?.areaName || ''],
      contentReceive: ['', Validators.required],
      supportInfo: [''],
      note: [''],
      station: [''],
      sla: ['', Validators.required],
    });
    this.getAreaCode(data?.areaCode);
  }

  getAreaCode(areaCode: string) {
    if (areaCode) {
      this._sharedDirectoryService.getAddressByCode(areaCode).subscribe(res => {
        const data = res.data && res.data.length > 0 ? res.data[0] : null;
        if (data) {
          const province = this.provinceList.find(item => item.value === data.province);
          this.processTicketForm.controls.province.setValue(province);
          if (data.province !== data.district) {
            this.getListDistrict(data.province, data.district);
          }
          if (data.district !== data.precinct) {
            this.getListCommune(data.district, data.precinct);
          }
        }
      });
    }
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
        this.ticketSourceList = data.map(val => ({ value: val.ticketSourceId, label: val.name }));
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
    this.processTicketForm.controls.sla.setValue('');
    this.processTicketForm.controls.l2TicketTypeId.setValue(null);
    this.processTicketForm.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv2List = [];
    this.ticketTypeLv3List = [];
    if (option?.value) {
      this.getListTicketTypeLv2(option.value);
    }
  }

  onChangeTicketTypeLv2(option) {
    this.processTicketForm.controls.sla.setValue('');
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
    this.processTicketForm.controls.sla.setValue('');
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
        }, () => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    } else {
      this.onDownloadFile(item);
    }
  }

  onSubmit() {
    const object = Object.assign({}, this.processTicketForm.value);
    for (const attr in object) {
      if (typeof object[attr] === 'string') {
        object[attr] = object[attr] ? object[attr].trim() : null;
      }
    }
    object.requestDate = object.requestDate ? format(object.requestDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    object.areaCode = object.commune?.value || object.district?.value || object.province?.value;
    object.attachmentFiles = this.listFile?.data.map(f => {
      return {
        fileName: f.fileName,
        base64Data: f.fileBase64,
      };
    });
    object.plateNumber = object.plateNumber ? object.plateNumber.toUpperCase() : null;
    object.provinceName = object.province?.label || null;
    object.districtName = object.district?.label || null;
    object.communeName = object.commune?.label || null;
    object.ticketChannel = 0;
    object.siteId = AppStorage.get('user-info')?.siteId || null;
    object.ticketTimes = 1;
    object.actTypeId = ACTION_TYPE.TICKET_ADD;
    object.sla = null;
    if (object.station) {
      if (object.station.stationId) {
        object.stationId = object.station.stationId;
        object.stationName = object.station.name;
      }
      if (object.station.stageId) {
        object.stageId = object.station.stageId;
        object.stageName = object.station.name;
      }
    }
    delete object.commune;
    delete object.district;
    delete object.province;
    delete object.station;
    this._ticketService.receiveComplain(object).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('common.notify.add.success'));
        // this.buildForm(this.dataReset);
        // this.listFile = [];
        this.ticketId = res.data?.ticketId || '';
      } else {
        this._toastrService.error(res.mess.description);
      }
    }, () => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
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
          this.processTicketForm.get('sla').setValue(res.data.slaDate);
        } else {
          this._toastrService.error(res.mess.description);
        }
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  changeValueTicketType() {
    this.processTicketForm.get('l2TicketTypeId').valueChanges.pipe(takeUntil(this.subDestroy$)).subscribe(val => {
      if (val == 24 || val == 25 || val == 31) {
        this.processTicketForm.controls.plateNumber.setValidators([Validators.required, Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]);
        this.processTicketForm.controls.plateNumber.updateValueAndValidity();
        this.processTicketForm.controls.station.setValidators(Validators.required);
        this.processTicketForm.controls.station.updateValueAndValidity();
      } else {
        this.processTicketForm.controls.plateNumber.clearValidators();
        this.processTicketForm.controls.plateNumber.updateValueAndValidity();
        this.processTicketForm.controls.station.clearValidators();
        this.processTicketForm.controls.station.updateValueAndValidity();
      }
    })
  }
}

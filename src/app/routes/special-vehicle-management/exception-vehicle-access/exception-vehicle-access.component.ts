import {
  NGX_MAT_DATE_FORMATS,
  NgxMatDateAdapter,
  NgxMatDateFormats,
} from '@angular-material-components/datetime-picker';
import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService, RESOURCE } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { VehicleService_V2 } from '@app/core/services/vehicle/vehicle-v2.service';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { HTTP_CODE, SPECIAL_PRIORITY } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CustomDateAdapter } from '../custom-date';
import { format, parse } from 'date-fns';
import { saveAs } from 'file-saver'

const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'l, LTS',
  },
  display: {
    dateInput: 'l, LTS',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-exception-vehicle-access',
  templateUrl: './exception-vehicle-access.component.html',
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter },
  ],
  styleUrls: ['./exception-vehicle-access.component.scss'],
})

export class ExceptionVehicleAccessComponent extends BaseComponent implements OnInit, AfterViewChecked, OnDestroy {

  updateVehicle = false;
  formCreateVehicle: FormGroup;
  formAttachByExcel: FormGroup;
  listOptionExceptionType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionTicketType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGroupVehicle: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGroupVehicleRachmieu: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionPlateTypes: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionPromotions: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleType: SelectOptionModel[] = [] as SelectOptionModel[];

  listStageOrStation = [];
  filteredStageOrStation: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();
  fileExcelVehicle: File = null;
  fileExcelExceptionVehicle: File = null;
  exceptionListId = 0;
  canEdit = true;
  isEdit = true;
  contractId: any;
  approved: number;

  constructor(private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private _vehicleService: VehicleService,
    private _vehicleServicev2: VehicleService_V2,
    private _sharedService: SharedDirectoryService,
    private _contractService: ContractService,
    public dialog?: MtxDialog,
    private cdr?: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    this.dataModel.h = new Date().getHours();
    this.dataModel.m = new Date().getMinutes() + 5;
    this.dataModel.s = new Date().getSeconds();
    this.buildForm();
    this.formCreateVehicle.controls.epc.disable();
    this.initData();
    this.getListOptionPromotions();
    this.onStationOrStageChange();
    this.getListVehicleType();
    this.setDisabled();
    this.filteredStageOrStation.next(this.listStageOrStation.slice());
    this.dataChangeStationOrStageFilter();
    this.route.params.subscribe(params => {
      if (params.id) {
        this.formCreateVehicle.controls.plateType.disable();
        this.formCreateVehicle.controls.plateNumber.disable();
        this.dataModel.popupTitle = this.translateService.instant('special-vehicle.exception-vehicle-update');
        this.dataModel.titleTabInfo = this.translateService.instant('special-vehicle.exception-info');
        this.exceptionListId = params.id;
        this.updateVehicle = true;
        this.getDetailVehicleById(this.exceptionListId);
      } else {
        this.isEdit = false;
        this.dataModel.popupTitle = this.translateService.instant('special-vehicle.addVehicleException');
        this.dataModel.titleTabInfo = this.translateService.instant('special-vehicle.addSingle');
      }
    });
  }

  buildForm() {
    this.formCreateVehicle = this.fb.group({
      exceptionType: ['', Validators.required], // Loại ngoại lệ
      // applyVehicleType: ['', Validators.required], // Loại xe áp dụng
      exemptionType: ['', Validators.required], // Loại miễn giảm áp dụng
      plateNumber: ['', [Validators.required, Validators.maxLength(100)]],
      plateType: ['', Validators.required],
      groupVehicle: [''], // Loại phương tiện thu phí
      vehicleType: '', // Loại phương tiện
      epc: ['', [Validators.maxLength(50)]],
      vehicleOwner: ['', Validators.maxLength(255)], // Chủ phương tiện
      contractNo: '', // Số hợp đồng
      stationOrStage: ['', Validators.required], // Đoạn/ Trạm
      stationOrStageFilter: '',
      effectiveDateFrom: [null, Validators.required], // Ngày hiệu lực: Từ ngày - đến ngày
      effectiveDateTo: [null],
      comment: ['', Validators.maxLength(255)],
      effectiveChangeDate: [null],
    });

    this.formAttachByExcel = this.fb.group({
      fileAttachStation: ['', Validators.required],
    });
  }

  getListVehicleType() {
    if (AppStorage.get('vehicle-type')) {
      this.listOptionVehicleType = AppStorage.get('vehicle-type').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name,
        };
      });
    }
  }

  getDetailVehicleById(exceptionListId) {
    this._vehicleService.getDetailVehicleException(exceptionListId).subscribe(rs => {
      if (rs.data.status == 4) {
        this.approved = 4;
        this.formCreateVehicle.disable();
        this.canEdit = false;
        this.formCreateVehicle.controls.effectiveChangeDate.enable();
        this.formCreateVehicle.controls.effectiveChangeDate.setValidators(Validators.required);
        this.formCreateVehicle.controls.effectiveChangeDate.updateValueAndValidity();
      }

      this.contractId = Number(rs.contractId);
      this.patchValueFormUpdate(rs.data);
    });
  }

  onStationOrStageChange() {
    this.formCreateVehicle.controls.stationOrStage.valueChanges.subscribe(value => {
      this.getListOptionPromotions();
      if (value.length > 0) {
        if (value[0].stationType == 1 && value[0].stationId == 5018) {// trạm rạch miếu
          this.getListOptionGroupVehicle(5018);
        } else {
          this.getListOptionGroupVehicle();
        }
      }
    });
  }

  getListOptionPromotions(item?) {
    const params = Object.assign({});
    params.promotionLevel = 3;
    params.isActive = true;
    let stationIds = [];
    let stageIds = [];
    if (this.updateVehicle) {
      if (item) {
        if (item.stageId) {
          stageIds.push(item.stageId);
        } else {
          stationIds.push(item.stationId);
        }
      }
    } else {
      const stationStage = this.formCreateVehicle.controls.stationOrStage.value;
      for (const element of stationStage) {
        if (element.hasOwnProperty('stageId')) {
          stageIds.push(element.stageId);
        } else {
          stationIds.push(element.stationId);
        }
      }
    }
    if (stationIds.length > 0) {
      this.searchModel.stationIds = stationIds.join(',') ?? null;
    } else
      stationIds = null;
    if (stageIds.length > 0) {
      this.searchModel.stageIds = stageIds.join(',') ?? null;
    } else
      stageIds = null;
    params.stationIds = stationIds;
    params.stageIds = stageIds;

    this._vehicleService.getListPromotions(params).subscribe(res => {
      this.listOptionPromotions = res.data.listData.map(val => {
        return {
          id: val.id,
          value: val.promotionName,
        };
      });
    });
  }

  patchValueFormUpdate(formValue) {
    this.formCreateVehicle.patchValue({
      exceptionType: formValue.exceptionType,
      exemptionType: formValue.promotionId ? formValue.promotionId : null,
      plateNumber: formValue.plateNumber,
      plateType: formValue.licensePlateType ? formValue.licensePlateType.toString() : null,
      groupVehicle: formValue.exceptionVehicleType ? this.listOptionGroupVehicle.find(x => x.id == formValue.exceptionVehicleType)?.code : null,
      epc: formValue.epc,
      vehicleOwner: formValue.customerName,
      contractNo: formValue.contractNo,
      effectiveDateFrom: parse(formValue.effDate, COMMOM_CONFIG.DATE_TIME_FORMAT_3, new Date()),
      effectiveDateTo: formValue.hasOwnProperty('expDate') ? parse(formValue.expDate, COMMOM_CONFIG.DATE_TIME_FORMAT_3, new Date()) : null,
      comment: formValue.hasOwnProperty('description') ? formValue.description : '',
      documentName: formValue.attachmentFiles.length > 0 ? formValue.attachmentFiles[0].documentName : '',
      vehicleType: formValue.registerVehicleType ? formValue.registerVehicleType : null,
      effectiveChangeDate: formValue.hasOwnProperty('expDateEdit') ? parse(formValue.expDateEdit, COMMOM_CONFIG.DATE_TIME_FORMAT_3, new Date()) : null,
    });

    let findIndex = null;
    if (formValue.hasOwnProperty('stageId')) {
      findIndex = this.listStageOrStation.findIndex(x => x?.stageId == formValue?.stageId);
    } else {
      findIndex = this.listStageOrStation.findIndex(x => x?.stationId == formValue?.stationId);
    }
    if (!this.updateVehicle)
      this.formCreateVehicle.get('stationOrStage').setValue([this.listStageOrStation[findIndex]]);
    else {
      this.formCreateVehicle.controls.stationOrStage.setValue(this.listStageOrStation[findIndex].name);
    }
    if (this.formCreateVehicle.controls.stationOrStage.value.id == 5038)
      this.formCreateVehicle.controls.groupVehicle.setValue(formValue.vehicleTypeId ? this.listOptionGroupVehicleRachmieu.find(x => x.id == formValue.vehicleTypeId)?.code : null);
    this.accessAttachFile(formValue.attachmentFiles);
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  accessAttachFile(files: any[]) {
    files.forEach(f => {
      const findIndex = f.documentPath.lastIndexOf('/');
      if (findIndex > 0) {
        const fileName = f.documentPath.substring(findIndex + 38);
        this.formCreateVehicle.patchValue({
          attachFile: fileName,
        });
      }
    });
  }

  setDisabled() {
    this.formCreateVehicle.get('contractNo').disable();
    this.formCreateVehicle.get('vehicleOwner').disable();
    this.formCreateVehicle.get('vehicleType').disable();
  }

  getListOptionGroupVehicle(id?) {
    if (id == 5018) {
      this._sharedService.getListVehicleFeeRachMieu().subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS)
          this.listOptionGroupVehicle = res.data.listData.map(val => {
            return {
              id: val.id,
              code: val.code,
              value: val.name,
            };
          });
        else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
    } else {
      this._sharedService.getListVehicleFee().subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.listOptionGroupVehicle = res.data.listData.map(val => {
            return {
              id: val.id,
              code: val.code,
              value: val.name,
            };
          });
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
    }
  }

  initData() {
    if (AppStorage.get('exception-type-list')) {
      this.listOptionExceptionType = AppStorage.get('exception-type-list');
    }
    if (AppStorage.get('ticket-price-type')) {
      this.listOptionTicketType = AppStorage.get('ticket-price-type');
    }

    if (AppStorage.get('vehicle-group')) {
      this.listOptionGroupVehicle = AppStorage.get('vehicle-group');
    }

    if (AppStorage.get('vehicle-group-rachmieu')) {
      this.listOptionGroupVehicleRachmieu = AppStorage.get('vehicle-group-rachmieu');
    }

    if (AppStorage.get('list-stage-station-vehicle')) {
      this.listStageOrStation = AppStorage.get('list-stage-station-vehicle');
      this.listStageOrStation = this.listStageOrStation.filter(val => val.booCode == 'BOO2');
      this.filterStageOrStation();
    }
    if (AppStorage.get('plate-types')) {
      this.listOptionPlateTypes = AppStorage.get('plate-types').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.val,
        };
      });
    }
  }

  chooseFileChangeExcel(files: FileList) {
    this.fileExcelExceptionVehicle = files[0];
    this.formAttachByExcel.get('fileAttachStation').patchValue(files[0].name);
  }
  dataChangeStationOrStageFilter() {
    this.formCreateVehicle.get('stationOrStageFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterStageOrStation();
    });
  }

  filterStageOrStation() {
    if (!this.listStageOrStation) {
      return;
    }
    // get the search keyword
    let search = this.formCreateVehicle.get('stationOrStageFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredStageOrStation.next(this.listStageOrStation.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredStageOrStation.next(
      this.listStageOrStation.filter(s => s.name.toLowerCase().indexOf(search) > -1),
    );
  }

  chooseFileChangeDoc(files: FileList) {
    this.fileExcelVehicle = files[0];
    this.formCreateVehicle.get('attachFile').patchValue(files[0].name);
  }
  onClickSaveVehicle() {
    this.confirmDialogSaveVehicle();
  }

  downloadTemplateException() {
    this._vehicleService.downloadTemplateExceptionVehicle().subscribe(res => {
      saveAs(res, 'template_ngoaile_uutien_vipham.xlsx');
    });
  }

  confirmDialogSaveVehicle(): void {
    const message = this.translateService.instant('special-vehicle.saveVehicle');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.save'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.saveExceptionVehicle();
      }
    });
  }

  saveExceptionVehicle() {
    const formData = Object.assign({});
    formData.effDate = format(this.formCreateVehicle.get('effectiveDateFrom').value, COMMOM_CONFIG.DATE_TIME_FORMAT_3);
    if (this.formCreateVehicle.get('effectiveDateTo').value)
      formData.expDate = format(this.formCreateVehicle.get('effectiveDateTo').value, COMMOM_CONFIG.DATE_TIME_FORMAT_3);
    if (this.formCreateVehicle.get('effectiveChangeDate').value)
      formData.expDateEdit = format(this.formCreateVehicle.get('effectiveChangeDate').value, COMMOM_CONFIG.DATE_TIME_FORMAT_3);
    formData.module = 'CRM';
    formData.exceptionGroup = '1';
    const stationStage = this.formCreateVehicle.controls.stationOrStage.value;
    const listStages = [];
    if (!this.updateVehicle) {
      for (const item of stationStage) {
        if (item.hasOwnProperty('stageId')) {
          listStages.push({ stagesId: item.stageId, stageName: item.name });
        } else {
          listStages.push({ stationId: item.stationId, stationName: item.name });
          formData.stationId = item.stationId;
          formData.stationName = item.stationName;
        }
      }
    } else {
      const data = this.listStageOrStation.find(x => x.name == stationStage);
      if (data.hasOwnProperty('stageId')) {
        formData.stageId = data.stageId;
        formData.stageName = data.name;
      } else {
        formData.stationId = data.stationId;
        formData.stationName = data.name;
      }
    }
    formData.stationStages = listStages;
    formData.plateNumber = this.formCreateVehicle.get('plateNumber').value;
    formData.exceptionVehicleType = this.formCreateVehicle.get('groupVehicle').value;
    formData.exceptionType = this.formCreateVehicle.get('exceptionType').value;
    formData.epc = this.formCreateVehicle.get('epc').value;
    formData.licensePlateType = Number(this.formCreateVehicle.get('plateType').value);
    formData.plateType = Number(this.formCreateVehicle.get('plateType').value);
    formData.customerName = this.formCreateVehicle.controls.vehicleOwner.value;
    formData.contractNo = this.formCreateVehicle.controls.contractNo.value;
    formData.description = this.formCreateVehicle.get('comment').value;
    formData.promotionId = this.formCreateVehicle.get('exemptionType').value;
    formData.registerVehicleType = this.formCreateVehicle.get('vehicleType').value;
    formData.exceptionListId = this.exceptionListId;

    if (!this.updateVehicle) {
      this._vehicleService.saveVehicleException(formData).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.toastr.success(this.translateService.instant('special-vehicle.addVehicleSuccess'));
          this.router.navigate(['special-vehicle-management', 'exception-vehicle']);
        } else {
          this.toastr.error(res.mess.description);
        }
      });
    } else {
      formData.contractId = this.contractId;
      this._vehicleService.updateVehicleException(formData).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.toastr.success(this.translateService.instant('special-vehicle.updateVehicleSuccess'));
          this.router.navigate(['special-vehicle-management', 'exception-vehicle']);
        } else {
          this.toastr.error(res.mess.description);
        }
      });
    }
  }

  onSearchVehicle() {
    this.getDetailVehicleByPlateNumber();
  }

  getDetailVehicleByPlateNumber() {
    if (this.formCreateVehicle.controls.plateNumber.value && this.formCreateVehicle.controls.plateType.value) {
      this._vehicleServicev2.getVehicleBoo1(this.formCreateVehicle.controls.plateNumber.value, this.formCreateVehicle.controls.plateType.value).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.patchValueForm(res.data);
          if (res.data.contractId)
            this.getContractNo(res.data.contractId);
        }
        // } else {
        //   this.getDetailVehicleByRegisterInfo(); // chi kiem tra ben boo2
        // }
      });
    }
  }

  getContractNo(contractId) {
    this._contractService.searchDetailsContract(null, contractId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.formCreateVehicle.controls.vehicleOwner.setValue(res.data.listData[0].custName);
        this.formCreateVehicle.controls.contractNo.setValue(res.data.listData[0].contractNo);
      }
    });
  }
  patchValueForm(formValue) {
    this.formCreateVehicle.patchValue({
      groupVehicle: formValue.hasOwnProperty('vehicleGroupId') ? formValue.vehicleGroupId.toString() : '',
      epc: formValue.hasOwnProperty('epc') ? formValue.epc : '',
      vehicleOwner: formValue.hasOwnProperty('owner') ? formValue.owner : '',
      contractNo: formValue.hasOwnProperty('contractNo') ? formValue.contractNo : '',
      vehicleType: formValue.hasOwnProperty('vehicleTypeId') ? Number(formValue.vehicleTypeId) : '',
    });
  }

  onClickBackToVehicle() {
    this.router.navigate(['special-vehicle-management', 'exception-vehicle']);
  }

  importVehicleException() {
    this.confirmDialogImportVehicle();
  }

  confirmDialogImportVehicle(): void {
    const message = this.translateService.instant('special-vehicle.saveVehicle');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.save'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.importVehicleExceptionByExcel();
      }
    });
  }

  importVehicleExceptionByExcel() {
    const dataForm = new FormData();
    dataForm.append('file', this.fileExcelExceptionVehicle);
    this._vehicleService.importVehicleException(dataForm).subscribe(res => {
      if (res.body.size < 100) {
        if (res.body.size < 80)
          this.toastr.error(this.translateService.instant('special-vehicle.import-invalid-type'));
        else
          this.toastr.error(this.translateService.instant('special-vehicle.import-invalid-temp'));
      } else {
        const contentDisposition = res.headers.get('content-disposition');
        const failedLines = contentDisposition.split(';')[2].split('=')[1];
        const successLines = contentDisposition.split(';')[3].split('=')[1];
        saveAs(res.body, 'result.xlsx');
        if (contentDisposition.toString().includes('Failed-lines=0'))
          this.toastr.success(this.translateService.instant('special-vehicle.importSuccess'));
        else {
          this.toastr.error('Import thành công: ' + successLines + ' bản ghi;' + ' Import lỗi:' + failedLines + ' bản ghi. Vui lòng xem kết quả chi tiết trong file trả về.');
        }
        this.router.navigate(['special-vehicle-management', 'exception-vehicle']);
      }
    });
  }

  onResetForm() {
    if (this.updateVehicle) {
      this.getDetailVehicleById(this.exceptionListId);
    } else {
      this.formCreateVehicle.reset();
    }
  }

  selectAll(event) {
    this.filteredStageOrStation.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (event) {
          this.formCreateVehicle.controls.stationOrStage.patchValue(val);
        } else {
          this.formCreateVehicle.controls.stationOrStage.patchValue([]);
        }
      });
  }

  changeExceptionType() {
    if (this.formCreateVehicle.controls.exceptionType.value == SPECIAL_PRIORITY.VEHICLE) {
      this.formCreateVehicle.controls.groupVehicle.setValidators(Validators.required);
      this.formCreateVehicle.controls.groupVehicle.updateValueAndValidity();
    } else {
      this.formCreateVehicle.controls.groupVehicle.clearValidators();
      this.formCreateVehicle.controls.groupVehicle.updateValueAndValidity();
      this.formCreateVehicle.controls.groupVehicle.setValue(null);
    }

  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  upper(event) {
    this.formCreateVehicle.controls.plateNumber.setValue(event.target.value.toUpperCase());
  }

  addminute() {
    const time = new Date();
    time.setMinutes(time.getMinutes() + 5);
    this.formCreateVehicle.controls.effectiveChangeDate.setValue(time);
  }

}

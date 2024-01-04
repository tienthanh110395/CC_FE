import {
  NGX_MAT_DATE_FORMATS,
  NgxMatDateAdapter,
  NgxMatDateFormats,
} from '@angular-material-components/datetime-picker';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService, RESOURCE } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { VehicleService_V2 } from '@app/core/services/vehicle/vehicle-v2.service';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { HTTP_CODE, PLATE_TYPE_COLOR, SERVICE_PLAN_TYPE, SPECIAL_PRIORITY } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CustomDateAdapter } from '../custom-date';
import { format, parse } from 'date-fns';

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
  selector: 'app-priority-forbidden-vehicle-access',
  templateUrl: './priority-forbidden-vehicle-access.component.html',
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: NgxMatDateAdapter, useClass: CustomDateAdapter },
  ],
  styleUrls: ['./priority-forbidden-vehicle-access.component.scss'],
})
export class PriorityForbiddenVehicleAccessComponent extends BaseComponent implements OnInit, AfterViewChecked {

  updateVehicle = false;
  formCreateVehicle: FormGroup;
  formAttachByExcel: FormGroup;
  filteredStageOrStation: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  onDestroy = new Subject<void>();
  listStageOrStation = [];
  listOptionPriorityType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionBackListType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionPlateTypes: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGroupVehicles: SelectOptionModel[] = [] as SelectOptionModel[];
  fileExcelVehicle: File = null;
  fileExcelExceptionVehicle: File = null;
  exceptionListId = 0;
  titleTab;
  canEdit = true;
  isEdit = true;
  contractId: any;
  isToanQuoc = false;
  approved: number;

  constructor(private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    private _vehicleService: VehicleService,
    private _vehicleServiceV2: VehicleService_V2,
    private _contractService: ContractService,
    public dialog?: MtxDialog,
    private cdr?: ChangeDetectorRef) {
    super(null, RESOURCE.CC);
  }

  ngOnInit() {
    this.dataModel.h = new Date().getHours();
    this.dataModel.m = new Date().getMinutes() + 5;
    this.dataModel.s = new Date().getSeconds();
    this.buildForm();
    this.formCreateVehicle.controls.epc.disable();
    this.initData();
    this.getListPlateTypes();
    this.getListGroupVehicle();
    this.setDisable();
    this.filteredStageOrStation.next(this.listStageOrStation.slice());
    this.dataChangeStationOrStageFilter();
    this.route.params.subscribe(params => {
      if (params.id) {
        this.formCreateVehicle.controls.plateType.disable();
        this.formCreateVehicle.controls.plateNumber.disable();
        this.exceptionListId = params.id;
        this.updateVehicle = true;
        this.getDetailVehicleById(this.exceptionListId);
        this.titleTab = this.translateService.instant('special-vehicle.editVehiclePriority');
        this.dataModel.titleTabInfo = this.translateService.instant('special-vehicle.exception-forbiden-info');
      } else {
        this.isEdit = false;
        this.titleTab = this.translateService.instant('special-vehicle.addVehiclePriority');
        this.dataModel.titleTabInfo = this.translateService.instant('special-vehicle.addSingle');
      }
    });
    this.changeDataPriorityFobType();
  }

  buildForm() {
    this.formCreateVehicle = this.fb.group({
      priorityFobType: ['3'], // Loại ưu tiên/cấm
      priorityType: ['', [Validators.required]], // Loại ưu tiên
      scopeType: '', // Loại phạm vi
      plateNumber: ['', [Validators.required, Validators.maxLength(100)]],
      plateType: ['', Validators.required],
      epc: ['', [Validators.maxLength(50)]],
      vehicleOwner: ['', Validators.maxLength(255)], // Chủ phương tiện
      contractNo: '', // Số hợp đồng
      stationOrStage: ['', Validators.required], // Đoạn/ Trạm
      stationOrStageFilter: '',
      effectiveDateFrom: [null, Validators.required], // Ngày hiệu lực: Từ ngày - đến ngày
      effectiveDateTo: null,
      effectiveChangeDate: null,
      comment: ['', Validators.maxLength(255)],
    });

    this.formAttachByExcel = this.fb.group({
      fileAttachStation: ['', Validators.required],
    });
  }

  setDisable() {
    this.formCreateVehicle.get('contractNo').disable();
    this.formCreateVehicle.get('scopeType').disable();
    this.formCreateVehicle.get('vehicleOwner').disable();
  }

  changeDataPriorityFobType() {
    this.formCreateVehicle.get('priorityFobType').valueChanges.subscribe(val => {
      if (this.canEdit) {
        if (val == SPECIAL_PRIORITY.PRIORITY) {
          this.formCreateVehicle.get('scopeType').disable();
          this.formCreateVehicle.get('scopeType').reset();
        } else {
          this.formCreateVehicle.get('scopeType').enable();
        }
        if (val == SPECIAL_PRIORITY.FORBIDDEN) {
          this.formCreateVehicle.get('priorityType').disable();
          this.formCreateVehicle.get('priorityType').reset();
        } else {
          this.formCreateVehicle.get('priorityType').enable();
        }
      }
    });
  }

  initData() {
    if (AppStorage.get('list-stage-station-vehicle')) {
      this.listStageOrStation = AppStorage.get('list-stage-station-vehicle');
      this.listStageOrStation = this.listStageOrStation.filter(val => val.booCode == 'BOO2');
      this.filterStageOrStation();
    }

    if (AppStorage.get('white-list-type-vehicle')) {
      this.listOptionPriorityType = AppStorage.get('white-list-type-vehicle');
    }

    if (AppStorage.get('back-list-type-vehicle')) {
      this.listOptionBackListType = AppStorage.get('back-list-type-vehicle');
    }
  }

  getListPlateTypes() {
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

  getListGroupVehicle() {
    if (AppStorage.get('vehicle-group')) {
      this.listOptionGroupVehicles = AppStorage.get('vehicle-group').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name,
        };
      });
    }
  }

  dataChangeStationOrStageFilter() {
    this.formCreateVehicle.get('stationOrStageFilter').valueChanges.pipe(takeUntil(this.subDestroy$)).subscribe(val => {
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

  chooseFileChangeExcel(files: FileList) {
    this.fileExcelExceptionVehicle = files[0];
    this.formAttachByExcel.get('fileAttachStation').patchValue(files[0].name);
  }
  onSearchVehicle() {
    if (this.formCreateVehicle.get('plateNumber').value) {
      this.getDetailVehicleByPlateNumber();
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
      this.contractId = rs.contractId;
      this.patchValueFormUpdate(rs.data);
    });
  }

  patchValueFormUpdate(formValue) {
    this.formCreateVehicle.patchValue({
      priorityFobType: formValue.exceptionType,
      priorityType: formValue.hasOwnProperty('whiteListType') ? formValue?.whiteListType.toString() : '',
      scopeType: formValue.hasOwnProperty('blackListType') ? formValue?.blackListType.toString() : '',
      plateNumber: formValue.plateNumber,
      plateType: formValue.licensePlateType?.toString(),
      epc: formValue.epc,
      vehicleOwner: formValue.customerName,
      contractNo: formValue.contractNo,
      effectiveDateFrom: parse(formValue.effDate, COMMOM_CONFIG.DATE_TIME_FORMAT_3, new Date()),
      effectiveDateTo: formValue.hasOwnProperty('expDate') ? parse(formValue.expDate, COMMOM_CONFIG.DATE_TIME_FORMAT_3, new Date()) : null,
      effectiveChangeDate: formValue.hasOwnProperty('expDateEdit') ? parse(formValue.expDateEdit, COMMOM_CONFIG.DATE_TIME_FORMAT_3, new Date()) : null,
      comment: formValue.hasOwnProperty('description') ? formValue.description : '',
      documentName: formValue.attachmentFiles.length > 0 ? formValue.attachmentFiles[0].documentName : '',
    });

    if (formValue.exceptionType == SPECIAL_PRIORITY.PRIORITY) {
      this.onPriorityVehicleChange(SPECIAL_PRIORITY.PRIORITY);
      if (formValue.whiteListType == SERVICE_PLAN_TYPE.TOANQUOC) {
        this.onChangeServicePlanType(SERVICE_PLAN_TYPE.TOANQUOC);
      }
    } else {
      this.onPriorityVehicleChange(SPECIAL_PRIORITY.FORBIDDEN);
    }

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
    this.accessAttachFile(formValue.attachmentFiles);
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

  /**
   * Lấy thông tin xe từ DB
   */
  getDetailVehicleByPlateNumber() {
    if (this.formCreateVehicle.controls.plateNumber.value && this.formCreateVehicle.controls.plateType.value) {
      this._vehicleServiceV2.getVehicleBoo1(this.formCreateVehicle.controls.plateNumber.value, this.formCreateVehicle.controls.plateType.value).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.patchValueForm(res.data);
          if (res.data.contractId)
            this.getContractNo(res.data.contractId);
        } else {
          this.getDetailVehicleByRegisterInfo();
        }
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

  /**
   * Lấy thông tin xe từ đăng kiểm
   */
  getDetailVehicleByRegisterInfo() {
    let concat = this.formCreateVehicle.controls.plateNumber.value;
    const colorCode = this.formCreateVehicle.controls.plateType.value;
    switch (colorCode) {
      case PLATE_TYPE_COLOR.WHITE: {
        concat = `${concat}T`;
        break;
      }
      case PLATE_TYPE_COLOR.YELLOW: {
        concat = `${concat}V`;
        break;
      }
      case PLATE_TYPE_COLOR.BLUE: {
        concat = `${concat}X`;
        break;
      }
    }
    this._vehicleService.getVehicleRegistry(concat).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS && res.data) {
        this.patchValueForm(res.data);
      } else
        this.patchValueForm({ '': '' });
    });
  }

  patchValueForm(formValue) {
    this.formCreateVehicle.patchValue({
      groupVehicle: formValue.hasOwnProperty('vehicleGroupId') ? formValue.vehicleGroupId : '',
      epc: formValue.hasOwnProperty('epc') ? formValue.epc : '',
      vehicleOwner: formValue.hasOwnProperty('owner') ? formValue.owner : '',
      contractNo: formValue.hasOwnProperty('contractNo') ? formValue.contractNo : '',
    });
  }

  onClickSaveVehicle() {
    this.confirmDialogSaveVehicle();
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
    // const dataForm = new FormData();
    // dataForm.append('files', this.fileExcelVehicle);
    const formData = Object.assign({});
    formData.effDate = format(this.formCreateVehicle.get('effectiveDateFrom').value, COMMOM_CONFIG.DATE_TIME_FORMAT_3);
    formData.expDate = this.formCreateVehicle.controls.effectiveDateTo.value ? format(this.formCreateVehicle.controls.effectiveDateTo.value, COMMOM_CONFIG.DATE_TIME_FORMAT_3) : null;
    formData.expDateEdit = this.formCreateVehicle.controls.effectiveChangeDate.value ? format(this.formCreateVehicle.controls.effectiveChangeDate.value, COMMOM_CONFIG.DATE_TIME_FORMAT_3) : null;
    formData.module = 'CRM';
    formData.exceptionGroup = '2';
    const stationStage = this.formCreateVehicle.controls.stationOrStage.value;
    const listStages = [];
    if (!this.updateVehicle && stationStage) {
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
      if (data) {
        if (data.hasOwnProperty('stageId')) {
          formData.stageId = data.stageId;
          formData.stageName = data.name;
        } else {
          formData.stationId = data.stationId;
          formData.stationName = data.name;
        }
      }
    }
    formData.stationStages = listStages;
    formData.plateNumber = this.formCreateVehicle.get('plateNumber').value;
    formData.exceptionType = this.formCreateVehicle.get('priorityFobType').value;
    formData.epc = this.formCreateVehicle.get('epc').value;
    formData.licensePlateType = Number(this.formCreateVehicle.get('plateType').value);
    formData.plateType = Number(this.formCreateVehicle.get('plateType').value);
    formData.customerName = this.formCreateVehicle.controls.vehicleOwner.value;
    formData.contractNo = this.formCreateVehicle.controls.contractNo.value;
    formData.whiteListType = this.formCreateVehicle.get('priorityType').value ? Number(this.formCreateVehicle.get('priorityType').value) : null;
    formData.blackListType = this.formCreateVehicle.get('scopeType').value ? Number(this.formCreateVehicle.get('scopeType').value) : null;
    formData.description = this.formCreateVehicle.get('comment').value;
    formData.exceptionListId = this.exceptionListId;

    //
    if (formData.exceptionType == SPECIAL_PRIORITY.FORBIDDEN) {
      if (formData.whiteListType) delete formData.whiteListType;
    }
    //
    if (formData.whiteListType == SERVICE_PLAN_TYPE.TOANQUOC) {
      delete formData.stationStages;
      if (formData.hasOwnProperty('stageId')) {
        delete formData.stageId;
        delete formData.stageName;
      } else {
        delete formData.stationId;
        delete formData.stationName;
      }
    }

    if (!this.updateVehicle) {
      this._vehicleService.saveVehicleException(formData).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.toastr.success(this.translateService.instant('special-vehicle.addVehicleSuccess'));
          this.router.navigate(['special-vehicle-management', 'priority-forbidden-vehicle']);
        } else {
          this.toastr.error(res.mess.description);
        }
      });
    } else {
      formData.contractId = this.contractId;
      this._vehicleService.updateVehicleException(formData).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.toastr.success(this.translateService.instant('special-vehicle.updateVehicleSuccess'));
          this.router.navigate(['special-vehicle-management', 'priority-forbidden-vehicle']);
        } else {
          this.toastr.error(res.mess.description);
        }
      });
    }
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
        this.router.navigate(['special-vehicle-management', 'priority-forbidden-vehicle']);
      }
    });
  }

  downloadTemplateException() {
    this._vehicleService.downloadTemplateExceptionVehicle().subscribe(res => {
      saveAs(res, 'template_ngoaile_uutien_vipham.xlsx');
    });
  }

  onClickBackToVehicle() {
    this.router.navigate(['special-vehicle-management', 'priority-forbidden-vehicle']);
  }

  onResetForm() {
    if (this.updateVehicle) {
      this.getDetailVehicleById(this.exceptionListId);
    } else {
      this.formCreateVehicle.reset();
    }
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
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

  upper(event) {
    this.formCreateVehicle.controls.plateNumber.setValue(event.target.value.toUpperCase());
  }

  onChangeServicePlanType(val?) {
    this.formCreateVehicle.controls.stationOrStage.setValue(null);
    if (val == SERVICE_PLAN_TYPE.TOANQUOC) {
      this.isToanQuoc = true;
      this.formCreateVehicle.controls.stationOrStage.clearValidators();
      this.formCreateVehicle.controls.stationOrStage.updateValueAndValidity();
    } else {
      this.isToanQuoc = false;
      this.formCreateVehicle.controls.stationOrStage.setValidators(Validators.required);
      this.formCreateVehicle.controls.stationOrStage.updateValueAndValidity();
    }
  }

  onPriorityVehicleChange(val?) {
    this.formCreateVehicle.controls.stationOrStage.setValue(null);
    if (val == SPECIAL_PRIORITY.PRIORITY) {
      this.formCreateVehicle.controls.scopeType.setValue(null);
    }
    if (val == SPECIAL_PRIORITY.FORBIDDEN) {
      this.isToanQuoc = false;
      this.formCreateVehicle.controls.priorityType.setValue(null);
      this.formCreateVehicle.controls.stationOrStage.setValidators(Validators.required);
      this.formCreateVehicle.controls.stationOrStage.updateValueAndValidity();
      this.formCreateVehicle.controls.priorityType.clearValidators();
      this.formCreateVehicle.controls.priorityType.updateValueAndValidity();
    }
  }
}

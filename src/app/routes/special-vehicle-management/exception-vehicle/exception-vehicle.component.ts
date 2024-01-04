import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { HTTP_CODE, SPECIAL_PRIORITY, STATUS_SPECIAL_VEHICLE } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment.prod';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { Subject } from 'rxjs/internal/Subject';
import { take } from 'rxjs/operators';
import { DenyVehicleComponent } from '../deny-vehicle/deny-vehicle.component';
import { ExceptionVehicleDetailComponent } from '../exception-vehicle-detail/exception-vehicle-detail.component';

@Component({
  selector: 'app-exception-vehicle',
  templateUrl: './exception-vehicle.component.html',
  styleUrls: ['./exception-vehicle.component.scss']
})
export class ExceptionVehicleComponent extends BaseComponent implements OnInit, AfterViewChecked, OnDestroy {
  specialPriority = SPECIAL_PRIORITY;
  formSearch: FormGroup;
  filteredStageOrStation: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  listOptionExceptionType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGroupVehicles: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGroupVehiclesRachMieu: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionTypeVehicles: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionTicketType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionPlateTypes: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionStatus: SelectOptionModel[] = [] as SelectOptionModel[];
  onDestroy = new Subject<void>();
  listStageOrStation = [];
  listDataVehicles = [];
  indexPaginatorVehicles = 0;
  displayedColumnsVehicles = [];
  pageSizeList = [10, 50, 100];
  @ViewChild('paginatorVehicles', { static: true }) paginatorVehicles: MatPaginator;
  @ViewChild('tableVehicleException') tableVehicleException: MatTable<any>;
  countTableVehicles = 0;
  statusVehicleSpecial = STATUS_SPECIAL_VEHICLE;
  selection = new SelectionModel<any>(true, []);
  constructor(
    protected toars: ToastrService,
    protected translateService: TranslateService,
    private _sharedDirectoryService: SharedDirectoryService,
    private fb: FormBuilder,
    private router: Router,
    private vehicleService: VehicleService,
    private _sharedService: SharedDirectoryService,
    public actr: ActivatedRoute,
    public dialog?: MtxDialog,
    private cdr?: ChangeDetectorRef) {
    super(vehicleService, RESOURCE.CC_VEHICLE, toars, translateService);
  }
  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.buildForm();
    this.getListExceptionType();
    this.getListGroupVehicle();
    this.getListTypeVehicle();
    this.getListTicketType();
    this.getListGroupVehicleRachMieu();
    this.getListPlateTypes();
    this.getListStatus();
    this.filteredStageOrStation.next(this.listStageOrStation.slice());
    this.dataChangeStationOrStageFilter();
    this.mapData();
  }

  /**
   * set thành async để get trạm đoạn rồi mới get data
   */
  async mapData() {
    await this.getListStageAndStation();
    await this.getListVehicleException();
  }
  buildForm() {
    this.columns = [
      { i18n: '', field: 'select' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.stt', field: 'orderNumber' },
      { i18n: 'special-vehicle.exceptionType', field: 'exceptionType' },
      { i18n: 'special-vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'special-vehicle.plateType', field: 'plateType' },
      { i18n: 'vehicle.groupTypeVehicleFee', field: 'vehicleTypeId' },
      { i18n: 'EPC', field: 'epc' },
      { i18n: 'special-vehicle.stationOrStage', field: 'stationOrStage' },
      { i18n: 'special-vehicle.content', field: 'content' },
      { i18n: 'special-vehicle.status', field: 'status' },
      { i18n: 'special-vehicle.effectiveDate', field: 'effectiveDate' },
      { i18n: 'special-vehicle.createDate', field: 'createDate' },
      { i18n: 'special-vehicle.createUser', field: 'createUser' },
      { i18n: 'special-vehicle.approvedDate', field: 'approvedDate' },
      { i18n: 'special-vehicle.approvedUser', field: 'approvedUser' },
      { i18n: 'special-vehicle.updateUser', field: 'updateUser' },
      { i18n: 'special-vehicle.updateDate', field: 'updateDate' },
      { i18n: 'special-vehicle.changedDated', field: 'expDateEdit' },
      { i18n: 'special-vehicle.action', field: 'action' }
    ];
    this.displayedColumnsVehicles = this.columns.map(x => x.field);
    this.formSearch = this.fb.group({
      exceptionType: '', // Loại ngoại lệ
      groupVehicle: '', // Loại phương tiện thu phí
      ticketType: '', // Loại giá vé
      plateNumber: '',
      plateType: '',
      epc: '',
      stationOrStage: '', // Đoạn/ Trạm
      stationOrStageFilter: '', // Filter auto complete
      status: '',
      createDateFrom: null, // Ngày tạo: Từ ngày - đến ngày,
      createDateTo: null,
      approvalDateFrom: null, // Ngày duyệt: Từ ngày - đến ngày,
      approvalDateTo: null,
      effectiveDateFrom: null, // Ngày hiệu lực: Từ ngày - đến ngày
      effectiveDateTo: null,
      inEffect: '', // Đang hiệu lực
      expire: '', // Hết hiệu lực,
      startrecord: 0,
      pagesize: this.pageSizeList[0]
    });
  }

  getListExceptionType() {
    this._sharedDirectoryService.getCategories('EXCEPTION_TYPE').subscribe(res => {
      this.listOptionExceptionType = res.data.listData.map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        };
      });
      if (!AppStorage.get('exception-type-list')) {
        AppStorage.set('exception-type-list', this.listOptionExceptionType);
      }
    });
  }

  getListGroupVehicle() {
    if (AppStorage.get('vehicle-group')) {
      this.listOptionGroupVehicles = AppStorage.get('vehicle-group').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.value
        };
      });
    }
  }

  getListGroupVehicleRachMieu() {
    if (AppStorage.get('vehicle-group-rachmieu')) {
      this.listOptionGroupVehicles = AppStorage.get('vehicle-group-rachmieu').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.value
        };
      });
    }
    else {
      this._sharedService.getListVehicleFeeRachMieu().toPromise().then(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.listOptionGroupVehiclesRachMieu = res.data.listData.map(val => {
            return {
              id: val.id,
              code: val.code,
              value: val.name
            };
          });
          AppStorage.set('vehicle-group-rachmieu', this.listOptionGroupVehiclesRachMieu);
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      })
    }
  }

  getListTypeVehicle() {
    if (AppStorage.get('vehicle-type')) {
      this.listOptionTypeVehicles = AppStorage.get('vehicle-type').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        };
      });
    }
    else {
      this._sharedDirectoryService.getListVehicleType().subscribe(res => {
        this.listOptionTypeVehicles.map(val => {
          return {
            id: val.id,
            code: val.code,
            value: val.name
          };
        })
      })
    }
  }

  getListTicketType() {
    this._sharedDirectoryService.getCategories('TICKET_PRICE_TYPE').subscribe(res => {
      this.listOptionTicketType = res.data.listData.map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        };
      });
      if (!AppStorage.get('ticket-price-type')) {
        AppStorage.set('ticket-price-type', this.listOptionTicketType);
      }
    });
  }

  getListPlateTypes() {
    if (AppStorage.get('plate-types')) {
      this.listOptionPlateTypes = AppStorage.get('plate-types').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.val
        };
      });
    }
  }

  async getListStageAndStation() {
    await this._sharedDirectoryService.getStageAndStation().toPromise().then(res => {
      this.listStageOrStation = res.data.listData;
      if (!AppStorage.get('list-stage-station-vehicle')) {
        AppStorage.set('list-stage-station-vehicle', this.listStageOrStation);
      }
      this.filterStageOrStation();
    });
  }

  getListStatus() {
    this._sharedDirectoryService.getCategories('STATUS_PROPRITIZE').subscribe(rs => {
      this.listOptionStatus = rs.data.listData.map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        };
      });
      this.listOptionStatus.push({
        id: 9,
        code: '9',
        value: 'Thay đổi hiệu lực'
      });
    });
  }

  dataChangeStationOrStageFilter() {
    this.formSearch.get('stationOrStageFilter').valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(val => {
      this.filterStageOrStation();
    });
  }

  filterStageOrStation() {
    if (!this.listStageOrStation) {
      return;
    }
    // get the search keyword
    let search = this.formSearch.get('stationOrStageFilter').value;
    if (!search || search.trim() == '' || search.trim().length == 0) {
      this.filteredStageOrStation.next(this.listStageOrStation.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredStageOrStation.next(
      this.listStageOrStation.filter(s => s.name.toLowerCase().indexOf(search) > -1)
    );
  }

  onClickInsertVehicle() {
    this.router.navigate(['special-vehicle-management', 'exception-vehicle-create']);
  }

  onClickUpdateVehicle(vehicle) {
    this.router.navigate(['special-vehicle-management', 'exception-vehicle-update', vehicle.exceptionListId]);
  }

  onClickViewVehicle(vehicle) {
    this.detailVehicleModal(vehicle, ExceptionVehicleDetailComponent);
  }

  detailVehicleModal(vehicle?, componentTemplate?) {
    const dialog = this.dialog.open({
      width: '1200px',
      data: vehicle,
      disableClose: true,
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
    });
  }

  onClickDeleteVehicle(vehicle) {
    this.confirmDialogDeleteVehicle(vehicle);

  }

  confirmDialogDeleteVehicle(vehicle): void {
    const message = this.translateService.instant('special-vehicle.deleteVehicle') + ` : ${vehicle.plateNumber}`;
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.delete'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '700px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.vehicleService.deleteVehicleException(vehicle.exceptionListId).subscribe(rs => {
          if (rs.mess.code == HTTP_CODE.SUCCESS) {
            this.toars.success(this.translateService.instant('special-vehicle.deleteSuccess'));
            this.getListVehicleException();
          } else if (rs.mess.code == HTTP_CODE.VEHICLE_CAN_NOT_DELETE) {
            this.toars.error(this.translateService.instant('special-vehicle.vehicleCanNotDelete'));
          }
        }, err => {
          this.toars.error(this.translateService.instant('common.500Error'));
        });
      }
    });
  }
  convertData(isExport?) {
    this.searchModel = Object.assign({}, this.formSearch.value);
    for (const pros in this.searchModel) {
      if (!this.searchModel[pros]) {
        delete this.searchModel[pros];
      }
    }
    this.searchModel.module = 'CRM';
    this.searchModel.startrecord = this.formSearch.value.startrecord;
    this.searchModel.exceptionGroup = 1;
    this.searchModel.exceptionTypes = '1,2';

    if (this.formSearch.controls.groupVehicle.value) {
      this.searchModel.vehicleTypeId = this.formSearch.controls.groupVehicle.value;
      delete this.searchModel.groupVehicle;
    }
    const plateTypes = [];
    if (this.formSearch.controls.plateType.value) {
      this.searchModel.licensePlateType = Number(this.formSearch.controls.plateType.value);
      plateTypes.push(this.searchModel.licensePlateType);
      delete this.searchModel.plateType;
    }

    const listStage = [];
    const listStation = [];
    if (this.searchModel?.stationOrStage) {
      this.searchModel.stationOrStage.forEach(element => {
        if (element.hasOwnProperty('stageId')) {
          listStage.push(element.stageId);
        }
        if (element.hasOwnProperty('stationId')) {
          listStation.push(element.stationId);
        }
      });
      if (listStation.length > 0) {
        this.searchModel.stationIds = listStation.join(',') ?? null;
      }
      if (listStage.length > 0) {
        this.searchModel.stageIds = listStage.join(',') ?? null;
      }
    }
    if (this.searchModel.createDateFrom) {
      this.searchModel.createDateFrom = format(this.searchModel.createDateFrom, COMMOM_CONFIG.DATE_FORMAT);
    }
    if (this.searchModel.createDateTo) {
      this.searchModel.createDateTo = format(this.searchModel.createDateTo, COMMOM_CONFIG.DATE_FORMAT);
    }
    if (this.searchModel.approvalDateFrom) {
      this.searchModel.approvalDateFrom = format(this.searchModel.approvalDateFrom, COMMOM_CONFIG.DATE_FORMAT);
    }
    if (this.searchModel.approvalDateTo) {
      this.searchModel.approvalDateTo = format(this.searchModel.approvalDateTo, COMMOM_CONFIG.DATE_FORMAT);
    }
    if (this.searchModel.effectiveDateFrom) {
      this.searchModel.effDateFrom = format(this.searchModel.effectiveDateFrom, COMMOM_CONFIG.DATE_FORMAT);
      delete this.searchModel.effectiveDateFrom;
    }
    if (this.searchModel.effectiveDateTo) {
      this.searchModel.effDateTo = format(this.searchModel.effectiveDateTo, COMMOM_CONFIG.DATE_FORMAT);
      delete this.searchModel.effectiveDateTo;
    }
    if (this.searchModel.cancellationDateTo) {
      this.searchModel.cancelDateTo = format(this.searchModel.cancellationDateTo, COMMOM_CONFIG.DATE_FORMAT);
      delete this.searchModel.cancellationDateTo;
    }

    if (this.searchModel.inEffect) {
      this.searchModel.effect = true;
      delete this.searchModel.inEffect;
    }

    if (this.searchModel.expire) {
      this.searchModel.expire = true;
    }

    if (this.formSearch.controls.status.value == '9') {
      this.searchModel.isEdit = 1;
      this.searchModel.status = '4';
    }

    /**
     * đê phòng trường hợp chọn all thì this.searchModel.stationOrStage quá dài
     */
    delete this.searchModel.stationOrStage;
    if (isExport) {
      // let plateTypes = [];
      // if (this.searchModel.licensePlateType) {
      //   plateTypes.push(this.searchModel.licensePlateType);
      //   this.searchModel.plateTypes = plateTypes;
      // }
      // delete this.searchModel.exceptionTypes;
      this.searchModel.exceptionTypes = ['1', '2'];
      delete this.searchModel.pagesize;
      delete this.searchModel.startrecord;
      if (listStation.length > 0) {
        this.searchModel.stationIds = listStation;
      }
      if (listStage.length > 0) {
        this.searchModel.stageIds = listStage;
      }
      // this.searchModel.plateTypes = plateTypes;
    }
    return this.searchModel;
  }
  async getListVehicleException() {
    await this.vehicleService.getListVehicleException(this.convertData()).toPromise().then(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.countTableVehicles = res.data.count;
        this.listDataVehicles = res.data.listData.map(x => {
          x.plateType = this.listOptionPlateTypes.find(p => p.code == x.licensePlateType)?.value;
          x.stationOrStage = x.stationId ? this.listStageOrStation.find(p => p.stationId == x.stationId)?.name : x.stageId ? this.listStageOrStation.find(p => p.stageId == x.stageId)?.name : '';
          x.groupVehicle = this.listOptionGroupVehicles.find(p => p.id == x.vehicleTypeId)?.value;
          x.typeVehicle = this.listOptionTypeVehicles.find(p => p.id == x.registerVehicleType)?.value;
          return x;
        });
        this.selection.clear();
      }
    });
  }

  onClickExportVehicle() {
    this.vehicleService.exportVehicleException(this.convertData(true)).subscribe(res => {
      saveAs(res, this.translateService.instant('special-vehicle.fileName'));
    });
  }

  onDownloadVehicle(vehicle) {
    this.vehicleService.downloadMultiDocumentFile(vehicle.exceptionListId).subscribe(res => {
      const contentDisposition = res.headers.get('content-disposition');
      if (contentDisposition) {
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
        this.toars.success(this.translateService.instant('special-vehicle.downloadDocSuccess'));
      } else {
        this.toars.error(this.translateService.instant('special-vehicle.downloadDocError'));
      }
    });
  }

  onClickApproveVehicle() {
    this.confirmDialogApproveVehicle();
  }

  confirmDialogApproveVehicle(): void {
    const message = this.translateService.instant('special-vehicle.contentApprove');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('special-vehicle.confirm'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const listExceptionId = [];
        this.selection.selected.forEach(element => {
          listExceptionId.push(element.exceptionListId);
        });
        const data = {
          'status': 2,
          'exceptionListIds': listExceptionId
        };
        this.vehicleService.approveVehicleException(data).subscribe(res => {
          this.selection.clear();
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            if (res.data.listSuccess.length > 0) {
              this.toars.success(res.data.messSuccess);
              this.getListVehicleException();
            }
            if (res.data.listWarning.length > 0) {
              this.toars.error(res.data.messWarning);
            }
            if (res.data.listError.length > 0) {
              this.toars.error(res.data.messError);
            }
          } else {
            this.toars.error(res.mess.description);
          }
        }, err => {
          this.toars.error(err.mess.description);
        });
      }
    });
  }

  selectAll(event) {
    this.filteredStageOrStation.pipe((take(1), takeUntil(this.onDestroy)))
      .subscribe(val => {
        if (event) {
          this.formSearch.controls.stationOrStage.patchValue(val);
        } else {
          this.formSearch.controls.stationOrStage.patchValue([]);
        }
      });
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.listDataVehicles.forEach(row => {
        row.selected = false;
      });
    } else {
      this.listDataVehicles.forEach(row => {
        if (row.status === STATUS_SPECIAL_VEHICLE.CREATE_NEW) {
          this.selection.select(row);
          row.selected = true;
        }
      });
    }
  }
  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.listDataVehicles ? this.listDataVehicles.filter(x => x.status == STATUS_SPECIAL_VEHICLE.CREATE_NEW).length : 0;
    return numSelected === numRows;
  }
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  checkChange(row) {
    this.selection.toggle(row);
    row.selected = !this.selection.isSelected(row) ? false : true;
  }
  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getListVehicleException();
  }
  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getListVehicleException();
  }

  onClickDenyVehicle() {
    const message = this.translateService.instant('special-vehicle.contentDeny');
    const dialogData = {
      exceptionListIds: this.selection.selected,
    };
    const dialogRef = this.dialog.originalOpen(DenyVehicleComponent, {
      width: '1200px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      this.selection.clear();
      this.getListVehicleException();
    });
  }
}

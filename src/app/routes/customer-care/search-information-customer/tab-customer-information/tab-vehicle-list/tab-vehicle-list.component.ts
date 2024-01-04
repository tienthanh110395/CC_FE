import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { HTTP_CODE, STATUS_VEHICLE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { AppStorage } from '@core/services/AppStorage';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-tab-vehicle-list',
  templateUrl: './tab-vehicle-list.component.html',
  styleUrls: ['./tab-vehicle-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabVehicleListComponent extends BaseComponent implements OnInit, OnChanges {
  @Input('contractId') contractId;
  startFrom = new FormControl();
  endFrom = new FormControl();
  startRFIDFrom = new FormControl();
  endRFIDFrom = new FormControl();
  startRecordRFID = 0;
  pageSizeRFID = 10;
  indexRFID = 0;
  columnsWithRFID: any[] = [];
  searchModelRFID: any = {};
  isLoadingRFID = false;
  statusVehicle = STATUS_VEHICLE
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    protected _changeDetectorRef?: ChangeDetectorRef
  ) {
    super()
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getData();
    this.getDataVehicleWithRFID();
  }
  ngOnInit(): void {
    this.dataModel.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'vehicle.owner', field: 'owner' },
      { i18n: 'vehicle.vehicleType', field: 'vehicleTypeName' },
      { i18n: 'vehicle.cargoWeight', field: 'netWeight' },
      { i18n: 'vehicle.seatNumber', field: 'seatNumber', type: 'number' },
      { i18n: 'customer-care.search-process.check-result', field: 'status', type: 'customStatus' },
    ];
    this.columnsWithRFID = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'customer-care.search-information-customer.serial', field: 'rfidSerial' },
      { i18n: 'customer-care.search-information-customer.type_of_vehicle', field: 'nameGroup' },
      { i18n: 'customer-care.search-information-customer.user_connector', field: 'createUser' },
      { i18n: 'customer-care.search-information-customer.fee_collection_method', field: 'salesType', type: 'salesType' },
      { i18n: 'customer-care.search-information-customer.deptId', field: 'deptId', type: 'customDeptId' },
      { i18n: 'customer-care.search-information-customer.status_card', field: 'activeStatus', type: 'activeStatus' },
    ];
  }
  getData() {
    if (!this.startFrom.hasError('matDatepickerMax')) {
      this.isLoading = true;
      this.searchModel.startDate = this.startFrom.value
        ? format(this.startFrom.value, COMMOM_CONFIG.DATE_FORMAT)
        : null;
      this.searchModel.endDate = this.endFrom.value
        ? format(this.endFrom.value, COMMOM_CONFIG.DATE_FORMAT)
        : null;
      this.removeNull(this.searchModel);
      this.searchInformationCustomerService
        .searchVehicleNotTagged(this.contractId, this.searchModel)
        .subscribe(rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS) {
            this.dataModel.dataSourceNotRFID = rs.data.listData.map(x => {
              x.nameGroup = this.dataModel.vehicleGroupOpt.find(
                f => f.id === x.vehicleGroupId
              )?.name;
              return x;
            });
            this.totalRecord = rs.data.count;
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
          }
        });
    }
  }
  onPageChangeRFID(event) {
    this.indexRFID = event.pageIndex;
    this.startRecordRFID =
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize;
    this.pageSizeRFID = event.pageSize;
    this.getDataVehicleWithRFID();
  }
  onSearchRFID() {
    this.indexRFID = 0;
    this.searchModelRFID.startrecord = 0;
    this.getDataVehicleWithRFID();
  }
  getDataVehicleWithRFID() {
    if (!this.startRFIDFrom.hasError('matDatepickerMax')) {
      this.isLoadingRFID = true;
      this.searchModelRFID.startDate = this.startRFIDFrom.value
        ? format(this.startRFIDFrom.value, COMMOM_CONFIG.DATE_FORMAT)
        : null;
      this.searchModelRFID.endDate = this.endRFIDFrom.value
        ? format(this.endRFIDFrom.value, COMMOM_CONFIG.DATE_FORMAT)
        : null;
      this.removeNull(this.searchModelRFID);
      this.searchModelRFID.startrecord = this.startRecordRFID;
      this.searchModelRFID.pagesize = this.pageSizeRFID;
      this.searchModelRFID.isAllTypeRFID = true;
      this.searchInformationCustomerService
        .searchTaggedMedia(this.contractId, this.searchModelRFID)
        .subscribe(rs => {
          if (rs.mess.code === 1) {
            this.dataModel.dataSourceWithRFID = rs.data.listData.map(x => {
              x.nameGroup = this.dataModel.vehicleGroupOpt.find(
                f => f.id === x.vehicleGroupId
              )?.name;
              return x;
            });
            this.dataModel.totalRecordRFID = rs.data.count;
            this.isLoadingRFID = false;
            this._changeDetectorRef.markForCheck();
          }
        });
    }
  }
  // detail(item) {
  //   const dialogRef = this.dialog.originalOpen(RfidDetailComponent, {
  //     width: '1200px',
  //     data: item.vehicleId,
  //     disableClose: true
  //   });
  //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     if (dialogResult) {

  //     }
  //   })
  // }
  showListTicket(item) {
    // this._contractService.searchDetailsContract(null, this.contractId).subscribe(rs => {
    //   if (rs.mess.code === HTTP_CODE.SUCCESS) {
    //     this.dialog.originalOpen(RfidDetailComponent, {
    //       width: '80%',
    //       panelClass: 'my-dialog',
    //       data: { data: { item, dataContract: rs.data.listData[0] }, isView: true },
    //     });
    //   }
    // });
  }
}

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ACTION_TYPE, HTTP_CODE, RFID_STATUS } from '@app/shared/constant/common.constant';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tab-info-vehicle',
  templateUrl: './tab-info-vehicle.component.html',
  styleUrls: ['./tab-info-vehicle.component.scss']
})
export class TabInfoVehicleComponent extends BaseComponent implements OnInit, OnChanges {
  @Input('contractId') contractId;
  @Input() data = [];
  isActive = false;
  dataVehicle: any = {};
  listFile = [];
  vehicleGroupOpt = [];
  vehicleTypeOpt = [];
  vehicleMarkOpt = [];
  vehicleColorOpt = [];
  vehicleBrandsOpt = [];
  vehiclePlateTypeOpt = [];
  activeStatus = RFID_STATUS;

  constructor(
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected _vehicleService: VehicleService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }
  ngOnChanges() {
    // if (this.dataModel.infoVehicle?.vehicleId) {
    //   this.getDetail();
    // } else {
    //   this.dataVehicle = {};
    // }
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber', type: 'plateNumber-custom'}
    ];
    this.getData();
    this.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.vehicleTypeOpt = AppStorage.get('vehicle-type');
    this.vehicleMarkOpt = AppStorage.get('vehicle-mark');
    this.vehicleBrandsOpt = AppStorage.get('vehicle-brands');
    this.vehicleColorOpt = AppStorage.get('vehicle-color');
    this.vehiclePlateTypeOpt = AppStorage.get('plate-types');
    this.getDetail();
  }

  onTabVehicle(event) {
    this.dataModel.currentIndex = event.index;
  }

  getData() {
    const body = {
      startrecord: this.searchModel.startrecord,
      pagesize: this.searchModel.pagesize,
      listActiveStatus: [0, 1, 2, 3, 4].join(','),
    }
    this.searchInformationCustomerService.getListVehicle(this.contractId, body).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }

  getDetail() {
    this._vehicleService.searchDetailsVehicle(this.dataVehicle, this.dataModel.infoVehicle?.vehicleId).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data) {
        this.dataVehicle = rs.data.listData[0];
        this.dataVehicle.nameType = this.vehicleTypeOpt.find(f => f.id === this.dataVehicle.vehicleTypeId)?.name;
        this.dataVehicle.nameGroup = this.vehicleGroupOpt.find(f => f.id === this.dataVehicle.vehicleGroupId)?.name;
        this.dataVehicle.mark = this.vehicleMarkOpt.find(f => f.id === this.dataVehicle.vehicleMarkId)?.val;
        this.dataVehicle.brand = this.vehicleBrandsOpt.find(f => f.id === this.dataVehicle.vehicleBrandId)?.val;
        this.dataVehicle.color = this.vehicleColorOpt.find(f => f.id === this.dataVehicle.vehicleColourId)?.val;
      }
    });
  }

  attachFile() {
    this.searchModel.actTypeId = ACTION_TYPE.DANG_KY_PT;
    this.searchInformationCustomerService.searchVehicleProfiles(this.searchModel, this.dataModel.infoVehicle.vehicleId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.listFile = res.data.listData;
      }
    })
  }

  onRowSelected(event) {
    this.dataModel.infoVehicle = event;
    this.isActive = true;
    this.getDetail();
    this.attachFile();
  }

  getHeightTable(source) {
    if (source) {
      if (source.length > 5) {
        return '400px';
      } else {
        return 'fit-content';
      }
    }
  }
}

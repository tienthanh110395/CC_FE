import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { HTTP_CODE, PLATE_TYPE_COLOR, STATUS_VEHICLE, VEHICLE_GROUP } from '@app/shared/constant/common.constant';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tab-vehicle-info',
  templateUrl: './tab-vehicle-info.component.html',
  styleUrls: ['./tab-vehicle-info.component.scss']
})
export class TabVehicleInfoComponent extends BaseComponent implements OnInit, OnChanges {

  @Input('listMedia') listMedia = [];
  @Input('custId') custId;
  @Input('contractId') contractId;
  data;
  dataContract;
  isActive = false;
  listFile = [];
  listImpactHistory = []

  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    private _changeDetectorRef: ChangeDetectorRef,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getData();
  }

  ngOnInit() {
    this.formSearch = this.fb.group({
      owner: [''],
      plateNumber: [''],
      vehicleTypeName: [''],
      cargoWeight: [''],
      netWeight: [''],
      vehicleGroupId: [''],
      grossWeight: [''],
      pullingWeight: [''],
      seatNumber: [''],
      engineNumber: [''],
      chassicNumber: [''],
      vehicleColorId: [''],
      vehicleMarkId: [''],
      vehicleBrandId: [''],
      plateType: [''],
      userConnect: [''],
      rfidSerial: [''],
      status: [''],
    });

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' }
    ];
    this.pathValueForm(this.dataModel)
  }

  onTabVehicle(event) {
    this.dataModel.currentIndex = event.index;
    if (event.index === 1) {
      this.searchInformationCustomerService.getListFileVehicle(this.dataModel.infoVehicle.vehicleId).subscribe(res => {
        if (res.mess.code === 1) {
          this.listFile = res.data.listData
        }
      })
    }
    else if (event.index === 2) {
      this.searchInformationCustomerService.getListVehicle(this.contractId).subscribe(res => {
        if (res.mess.code === 1) {
          this.listMedia = res.data.listData;
        }
      })
    }
  }

  getData() {
    this.searchInformationCustomerService.getListVehicle(this.contractId, this.searchModel).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }

  pathValueForm(formValue) {
    let statusVehicle: string = ''
    if (formValue.status == STATUS_VEHICLE.HOATDONG) {
      statusVehicle = "Hoạt động"
    } else if (formValue.status == STATUS_VEHICLE.KHONGHOATDONG) {
      statusVehicle = "Không hoạt động"
    } else if (formValue.status == STATUS_VEHICLE.IMPORT) {
      statusVehicle = "Import phương tiện từ file"
    } else if (formValue.status == STATUS_VEHICLE.KHOP) {
      statusVehicle = "Khớp với kết quả đăng kiểm"
    } else if (formValue.status == STATUS_VEHICLE.KHONGKHOP) {
      statusVehicle = "Không khớp với kết quả đăng kiểm"
    }

    let plateTypeVehicle: string = ''
    if (formValue.plateTypeCode == PLATE_TYPE_COLOR.WHITE) {
      plateTypeVehicle = "Biển trắng"
    } else if (formValue.plateTypeCode == PLATE_TYPE_COLOR.BLUE) {
      plateTypeVehicle = "Biển xanh"
    } else if (formValue.plateTypeCode == PLATE_TYPE_COLOR.YELLOW) {
      plateTypeVehicle = "Biển vàng"
    } else if (formValue.plateTypeCode == PLATE_TYPE_COLOR.RED) {
      plateTypeVehicle = "Biển đỏ"
    } else if (formValue.plateTypeCode == PLATE_TYPE_COLOR.NUOC_NGOAI) {
      plateTypeVehicle = "Biển nước ngoài"
    } else if (formValue.plateTypeCode == PLATE_TYPE_COLOR.NGOAI_GIAO) {
      plateTypeVehicle = "Biển ngoại giao"
    }

    let vehicleGroup: string = ''
    if (formValue.vehicleGroupId == VEHICLE_GROUP.LOAI1) {
      vehicleGroup = "Loại 1"
    } else if (formValue.vehicleGroupId == VEHICLE_GROUP.LOAI2) {
      vehicleGroup = "Loại 2"
    } else if (formValue.vehicleGroupId == VEHICLE_GROUP.LOAI3) {
      vehicleGroup = "Loại 3"
    } else if (formValue.vehicleGroupId == VEHICLE_GROUP.LOAI4) {
      vehicleGroup = "Loại 4"
    } else if (formValue.vehicleGroupId == VEHICLE_GROUP.LOAI5) {
      vehicleGroup = "Loại 5"
    }

    this.formSearch.patchValue({
      plateNumber: formValue.plateNumber,
      owner: formValue.owner,
      vehicleTypeName: formValue.vehicleTypeName,
      netWeight: formValue.netWeight,
      cargoWeight: formValue.cargoWeight,
      vehicleGroupId: vehicleGroup,
      grossWeight: formValue.grossWeight,
      pullingWeight: formValue.pullingWeight,
      seatNumber: formValue.seatNumber,
      engineNumber: formValue.engineNumber,
      chassicNumber: formValue.chassicNumber,
      vehicleColorId: formValue.vehicleColorId,
      vehicleMarkId: formValue.vehicleMarkId,
      vehicleBrandId: formValue.vehicleBrandId,
      plateType: plateTypeVehicle,
      userConnect: formValue.userConnect,
      rfidSerial: formValue.rfidSerial,
      status: statusVehicle
    })
  }

  attachFile() {
    this.searchInformationCustomerService.getListFileVehicle(this.dataModel.infoVehicle.vehicleId).subscribe(res => {
      if (res.mess.code === 1) {
        this.listFile = res.data.listData
      }
    })
  }

  onRowSelected(event) {
    this.pathValueForm(event);
    this.dataModel.infoVehicle = event;
    this.isActive = true;
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

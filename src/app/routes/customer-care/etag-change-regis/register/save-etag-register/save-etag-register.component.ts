import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ChangeDetectorRef, Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { HTTP_CODE, RFID_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, tap, switchMap, finalize, takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'app-save-etag-register',
  templateUrl: './save-etag-register.component.html',
  styleUrls: ['./save-etag-register.component.scss']
})
export class SaveEtagRegisterComponent extends BaseComponent implements OnInit {
  @Input() data = [];
  dataVehicle: any = {};
  isActive = false;

  vehicleGroupOpt = [];
  vehicleTypeOpt = [];
  vehicleMarkOpt = [];
  vehicleColorOpt = [];
  vehicleBrandsOpt = [];
  vehiclePlateTypeOpt = [];
  activeStatus = RFID_STATUS;

  regisLevel = [
    { value: 3, label: this.translateService.instant('etag-change-regis.normal') },
    { value: 1, label: this.translateService.instant('etag-change-regis.vip') },
    { value: 2, label: this.translateService.instant('etag-change-regis.hot') },
  ];

  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  street = ['', '', '', ''];
  formSearchVehicle: FormGroup;
  listPlateNumber = [];
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected _vehicleService: VehicleService,
    private _changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
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
      epc: [''],
      changeReason: ['', [Validators.required, Validators.maxLength(255)]],
      regisLevel: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
      street: ['', [Validators.required, Validators.maxLength(500)]],
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' }
    ];
    this.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.vehicleTypeOpt = AppStorage.get('vehicle-type');
    this.vehicleMarkOpt = AppStorage.get('vehicle-mark');
    this.vehicleBrandsOpt = AppStorage.get('vehicle-brands');
    this.vehicleColorOpt = AppStorage.get('vehicle-color');
    this.vehiclePlateTypeOpt = AppStorage.get('plate-types');
    this.getData();
    this.getDataVehicle();
    this.getListCity();
    this.dataChangeWard();
    this.formSearchVehicle = this.fb.group({
      vehicle: [],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  checkValue() {
    if (this.formSearchVehicle.value.vehicle != null) {
      this.getDataVehicle()
    } else if (this.formSearchVehicle.value.vehicle == null) {
      this.getData();
    }
  }

  getDataVehicle() {
    if (this.formSearchVehicle?.valid) {
      const param = Object.assign({}, this.formSearchVehicle?.value);
      param.plateNumber = this.formSearchVehicle.value.vehicle;
      param.startrecord = this.searchModel.startrecord;
      param.pagesize = this.searchModel.pagesize;
      delete param.vehicle;
      this._vehicleService.getVehicleTransfersRFID(param, this.data[0].listContract[0].contractId).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = res.data.listData;
          this.totalRecord = res.data.count;
        }
      })
    }
  }

  getData() {
    const param = Object.assign({}, this.formSearchVehicle?.value);
    delete param.vehicle;
    this._vehicleService.getVehicleTransfersRFID(param, this.data[0].listContract[0].contractId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearchVehicle.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearchVehicle.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearchVehicle.controls.startrecord.setValue(0);
    this.getData();
  }

  onRowSelected(event) {
    this._vehicleService.searchDetailsVehicle(this.dataVehicle, event.vehicleId).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data) {
        this.dataVehicle = rs.data.listData[0];
        this.dataVehicle.nameType = this.vehicleTypeOpt.find(f => f.id === this.dataVehicle.vehicleTypeId)?.name;
        this.dataVehicle.nameGroup = this.vehicleGroupOpt.find(f => f.id === this.dataVehicle.vehicleGroupId)?.name;
        this.dataVehicle.mark = this.vehicleMarkOpt.find(f => f.id === this.dataVehicle.vehicleMarkId)?.val;
        this.dataVehicle.brand = this.vehicleBrandsOpt.find(f => f.id === this.dataVehicle.vehicleBrandId)?.val;
        this.dataVehicle.color = this.vehicleColorOpt.find(f => f.id === this.dataVehicle.vehicleColourId)?.val;
        this.dataVehicle.changeReason = this.formSearch.controls.changeReason.setValue(null);
      }
    });
    this.isActive = true;
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

  dataChangeCity() {
    this.formSearch.get('district').patchValue('');
    this.formSearch.get('ward').patchValue('');
    this.getListDistrict(this.formSearch.value.city);
    this.listOptionWard = [];
    this.patchValueAddress();
  }

  dataChangeDistrict() {
    this.formSearch.get('ward').patchValue('');
    this.getListWard(this.formSearch.value.city, this.formSearch.value.district);
    this.patchValueAddress();
  }

  dataChangeWard() {
    this.formSearch.get('ward').valueChanges.subscribe(val => {
      this.patchValueAddress();
    });
  }

  patchValueAddress() {
    const findCity = this.listOptionCity.find(x => x.code == this.formSearch.get('city').value);
    this.street[3] = findCity ? ` - ${findCity.value}` : '';
    const findDictrict = this.listOptionDistrict.find(x => x.code == this.formSearch.get('district').value);
    this.street[2] = findDictrict ? ` - ${findDictrict.value}` : '';
    const findWard = this.listOptionWard.find(x => x.code == this.formSearch.get('ward').value);
    this.street[1] = findWard ? ` - ${findWard.value}` : '';
    this.formSearch.get('street').patchValue(this.street.join(''));
  }

  getListCity() {
    this._vehicleService.getCityProvince().subscribe(res => {
      this.listOptionCity = res.data.map(val => {
        return {
          code: val.province,
          value: val.name
        };
      });
    });
  }

  getListDistrict(province) {
    this._vehicleService.getDistrict(province).subscribe(res => {
      this.listOptionDistrict = res.data.map(val => {
        return {
          code: val.district,
          value: val.name
        };
      });
    });
  }

  getListWard(province, district) {
    this._vehicleService.getWard(province, district).subscribe(res => {
      this.listOptionWard = res.data.map(val => {
        return {
          code: val.areaCode,
          value: val.name
        };
      });
    });
  }

  changeEtag() {
    const body = {
      areaCode: this.listOptionWard.find(x => x.code == this.formSearch.get('ward').value)?.code,
      plateTypeCode: this.vehiclePlateTypeOpt.find(x => x.val === this.formSearch.controls.plateType.value)?.code,
      plateNumber: this.formSearch.controls.plateNumber.value,
      changeReason: this.formSearch.controls.changeReason.value.trim(),
      provinceName: this.listOptionCity.find(x => x.code == this.formSearch.get('city').value)?.value,
      districtName: this.listOptionDistrict.find(x => x.code == this.formSearch.get('district').value)?.value,
      communeName: this.listOptionWard.find(x => x.code == this.formSearch.get('ward').value)?.value,
      street: this.formSearch.controls.street.value.trim(),
      custName: this.formSearch.controls.owner.value,
      phoneNumber: this.data[0].phoneNumber,
      regisLevel: this.formSearch.controls.regisLevel.value,
    }
    this._vehicleService.changeEPC(body).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.toastr.success(this.translateService.instant('etag-change-regis.change-etag-success'));
        this.getData();
        this.isActive = false;
      } else {
        this.toastr.error(res.mess.description);
      }
    }, err => {
      this.toastr.error(this.translateService.instant('common.500Error'));
    })
  }
}

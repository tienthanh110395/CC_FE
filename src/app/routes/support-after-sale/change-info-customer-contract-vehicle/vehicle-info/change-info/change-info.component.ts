import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { ChangeInfoCustomerContractVehicle } from '@app/core/services/support-after-sale/change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.service';
import { CommonCRMService, HTTP_CODE, PLATE_TYPE_COLOR } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-info',
  templateUrl: './change-info.component.html',
  styleUrls: ['./change-info.component.scss']
})
export class ChangeInfoComponent extends BaseComponent implements OnInit {
  formChangeInfo: FormGroup;
  listOptionVehicelType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleTypeFee: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleColours: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehiclePlateTypes: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleLabel: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleBrands: SelectOptionModel[] = [] as SelectOptionModel[];

  constructor(
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    protected _translate: TranslateService,
    private _toastrService: ToastrService,
    private _commonCRMService: CommonCRMService,
    private _changeInfoCustomerContractVehicle: ChangeInfoCustomerContractVehicle,
  ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
    this.getListVehicleType();
    this.getListVehicleFee();
    this.getListVehicleColours();
    this.getListVehiclePlateTypes();
    this.getListVehicleLabel();
    this.getListVehicleBrands();
  }

  buildForm() {
    this.formChangeInfo = this.fb.group({
      plateNumber: ['', [Validators.required, Validators.maxLength(16), ValidationService.cannotWhiteSpace, Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]],
      owner: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      vehicleTypeId: ['', Validators.required],
      netWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      cargoWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      seatNumber: ['', [Validators.required, Validators.max(999), Validators.min(0), Validators.pattern(COMMOM_CONFIG.SEAT_NUMBER_FORMAT)]],
      vehicleGroupId: ['', Validators.required],
      grossWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      pullingWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      engineNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      chassicNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      vehicleColourId: [''],
      vehicleMarkId: [''],
      vehicleBrandId: [''],
      plateType: ['', Validators.required],
      createUser: [AppStorage.getUserLogin(), Validators.required],
      rfidSerial: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9]+$')]],
    })
  }

  getListVehicleBrands() {
    if (AppStorage.get('vehicle-brands')) {
      this.listOptionVehicleBrands = AppStorage.get('vehicle-brands').map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
    }
  }

  getListVehicleLabel() {
    if (AppStorage.get('vehicle-mark')) {
      this.listOptionVehicleLabel = AppStorage.get('vehicle-mark').map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
    }
  }

  getListVehicleType() {
    if (AppStorage.get('vehicle-type')) {
      this.listOptionVehicelType = AppStorage.get('vehicle-type').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        };
      });
    }
  }

  getListVehicleFee() {
    if (AppStorage.get('vehicle-group')) {
      this.listOptionVehicleTypeFee = AppStorage.get('vehicle-group').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        };
      });
    }
  }

  getListVehicleColours() {
    if (AppStorage.get('vehicle-color')) {
      this.listOptionVehicleColours = AppStorage.get('vehicle-color').map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
    }
  }

  getListVehiclePlateTypes() {
    if (AppStorage.get('plate-types')) {
      this.listOptionVehiclePlateTypes = AppStorage.get('plate-types').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.val
        };
      });
      const defaultId = this.listOptionVehiclePlateTypes.find(x => x.code == PLATE_TYPE_COLOR.WHITE)?.id;
      this.formChangeInfo.controls.plateType.setValue(defaultId);
    }
  }

  getVehicleGroupType() {
    const data = {
      vehicleTypeId: this.formChangeInfo.get('vehicleTypeId').value ?? null,
      seatNumber: this.formChangeInfo.get('seatNumber').value ?? null,
      cargoWeight: this.formChangeInfo.get('cargoWeight').value ?? null,
      netWeight: this.formChangeInfo.get('netWeight').value ?? null,
      grossWeight: this.formChangeInfo.get('grossWeight').value ?? null,
      pullingWeight: this.formChangeInfo.get('pullingWeight').value ?? null
    };
    this._changeInfoCustomerContractVehicle.getVehicleGroupType(data).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.formChangeInfo.get('vehicleGroupId').patchValue(res.data.vehicleGroupId);
        this.formChangeInfo.controls.vehicleGroupId.disable();

      } else if (res.mess.code == HTTP_CODE.NOT_EXIT_VEHICLE_GROUP) {
        this.formChangeInfo.controls.vehicleGroupId.reset();
        this.formChangeInfo.controls.vehicleGroupId.enable();
      }
    }, err => {
      this.formChangeInfo.controls.vehicleGroupId.reset();
      this.formChangeInfo.controls.vehicleGroupId.enable();
    });
  }

  onSearchVehicle() {
    let concat = this.formChangeInfo.value.plateNumber;
    const colorCode = this.listOptionVehiclePlateTypes.find(x => x.id === this.formChangeInfo.controls.plateType.value)?.code;
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
    this._changeInfoCustomerContractVehicle.getVehicleRegistry(concat).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS && res.data) {
        this.formChangeInfo.controls.vehicleTypeId.disable();
        this.formChangeInfo.controls.netWeight.disable();
        this.formChangeInfo.controls.cargoWeight.disable();
        this.formChangeInfo.controls.seatNumber.disable();
        this.formChangeInfo.controls.grossWeight.disable();
        this.formChangeInfo.controls.pullingWeight.disable();
        // this.patchValueForm(res?.data);
      } else {
        this.formChangeInfo.controls.vehicleTypeId.enable();
        this.formChangeInfo.controls.netWeight.enable();
        this.formChangeInfo.controls.cargoWeight.enable();
        this.formChangeInfo.controls.seatNumber.enable();
        this.formChangeInfo.controls.grossWeight.enable();
        this.formChangeInfo.controls.pullingWeight.enable();
        // this.patchValueForm({});
      }
    });
  }
}

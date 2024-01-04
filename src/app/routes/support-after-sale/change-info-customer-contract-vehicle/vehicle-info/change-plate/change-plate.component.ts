import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { ChangeInfoCustomerContractVehicle } from '@app/core/services/support-after-sale/change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.service';
import { CommonCRMService, PLATE_TYPE_COLOR } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, tap, switchMap, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-change-plate',
  templateUrl: './change-plate.component.html',
  styleUrls: ['./change-plate.component.scss']
})
export class ChangePlateComponent extends BaseComponent implements OnInit {
  formChangePlate: FormGroup;
  listOptionVehiclePlateTypes: SelectOptionModel[] = [] as SelectOptionModel[];
  isLoadingStaff = false;
  listStaff = [];
  isLoadingProfile: boolean;
  columnProfiles = [];

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
    this.columnProfiles = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.updateProfileTable.documentType', field: 'documentTypeName' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'actions', type: 'custom' },
    ];
    this.buildForm();
    this.getListVehiclePlateTypes();
    this.formChangePlate.get('staff').valueChanges.pipe(debounceTime(1000), tap(x => {
      this.isLoadingStaff = true;
      this.listStaff = [];
    }),
      switchMap(value =>
        iif(() => typeof value !== 'object' && value && value !== '', this._changeInfoCustomerContractVehicle.getMember(value)).pipe(finalize(() => (this.isLoadingStaff = false)))
      ),
      takeUntil(this.subDestroy$)
    ).subscribe(rs => {
      if (rs.mess.code == 1) {
        this.listStaff = [];
        this.listStaff.push(rs.data);
        if (rs.data) {
          this.formChangePlate.controls.staff.setValue(rs.data);
        }
      } else {
        this.formChangePlate.controls.staff.setErrors({ 'required': true });
      }
    });
    if (this.dataModel.isLoginToken) {
      this.formChangePlate.controls.staff.setValue({ username: AppStorage.getUserLogin() });
    }
  }

  buildForm() {
    this.formChangePlate = this.fb.group({
      plateType: ['', Validators.required],
      plateNumber: ['', [Validators.required, Validators.maxLength(16), ValidationService.cannotWhiteSpace, Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]],
      staff: ['', Validators.required],
      dateChange: [format(new Date(), COMMOM_CONFIG.DATE_FORMAT)],
    })
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
      this.formChangePlate.controls.plateType.setValue(defaultId);
    }
  }

  displayFnStaff(s: any) {
    if (s) {
      return s?.username;
    }
  }
}

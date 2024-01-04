import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { AppStorage } from '@app/core/services/AppStorage';
import { DetachContractService } from '@app/core/services/support-after-sale/detach-contract/detach-contract.service';
import { HTTP_CODE, STATUS_RFID_VEHICLE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { PeriodicElement } from '../transfer-own-vehicle/transfer-own-vehicle.component';
import { DetachContractStore } from './detach-contract.store';
import format from 'date-fns/format';
@Component({
  selector: 'app-detach-contract',
  templateUrl: './detach-contract.component.html',
  styleUrls: ['./detach-contract.component.scss']
})
export class DetachContractComponent extends BaseComponent implements OnInit {

  selection = new SelectionModel<any>(true, []);
  public show = false;
  public buttonName: any = 'Show';
  @ViewChild('tableFile') tableFile: MatTable<any>;
  selectContract: any = {};
  states = [];
  value: string;
  filteredStates = this.states;
  listVehicleSplit: any[] = [];
  activeDate;
  endActiveDate;
  activeStatusVehicle = STATUS_RFID_VEHICLE;

  signDate: string;
  effDate: string;
  expDate: string;
  formInformation: FormGroup;
  isLoadingAuto: boolean;

  formatDate = COMMOM_CONFIG.DATE_FORMAT;
  constructor(
    private _toastrService: ToastrService,
    private _detachContractService: DetachContractService,
    private _detachContractStore: DetachContractStore,
    protected _translateService: TranslateService,
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MtxDialog,
  ) {
    super(_detachContractService, RESOURCE.CC, _toastrService, _translateService);
  }

  toggle() {
    this.show = !this.show;

    if (this.show) this.buttonName = 'Hide';
    else this.buttonName = 'Show';
  }

  ngOnInit() {
    this.isLoading = false;

    this.formInformation = this.fb.group({
      searchContract: ['', Validators.required],
    });
    this.dataModel.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.dataModel.vehicleTypeOpt = AppStorage.get('vehicle-type');

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'support-after-sale.detach-contract.license_plates', field: 'plateNumber' },
      { i18n: 'support-after-sale.detach-contract.vehiclesTypeFee', field: 'nameGroup' },
      { i18n: 'support-after-sale.detach-contract.boss-vehicle', field: 'owner' },
      { i18n: 'support-after-sale.detach-contract.type-vehicle', field: 'nameType' },
      { i18n: 'support-after-sale.detach-contract.serial_number', field: 'rfidSerial' },
      { i18n: 'support-after-sale.detach-contract.card_status', field: 'activeStatus' },
      { i18n: 'support-after-sale.detach-contract.card_status', field: 'select' }
    ];
    super.mapColumn();
    this.selection.changed.asObservable().subscribe(select => {
      if (select.added.length > 0) {
        this.listVehicleSplit.push(select.added[0]);
      } else {
        select.removed.forEach(element => {
          const findIndex = this.listVehicleSplit.findIndex(vehicle => vehicle.plateNumber == element.plateNumber);
          this.listVehicleSplit.splice(findIndex, 1);
        });
      }
    });

    this.formInformation.get('searchContract').valueChanges.pipe(debounceTime(1000), tap(() => this.isLoadingAuto = true)).subscribe(value => {
      if (typeof value !== 'object') {
        this._detachContractService.searchContractInfo(value.trim()).subscribe(rs => {
          this.isLoadingAuto = false;
          this.filteredStates = rs.data.listData;
        });
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataModel.dataSource.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  filter() {
    if (this.formInformation.controls.searchContract.value?.trim()) {
      this._detachContractService.searchContractInfo(this.formInformation.controls.searchContract.value?.trim()).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS && rs.data.listData.length > 0) {
          this.selectContract = rs.data.listData[0];
          this.getData();
          this.signDate = this.selectContract.signDate ? this.selectContract.signDate.split(' ')[0] : null;
          this.effDate = this.selectContract.effDate ? this.selectContract.effDate.split(' ')[0] : null;
          this.expDate = this.selectContract.expDate ? this.selectContract.expDate.split(' ')[0] : null;
        }
      }, (err) => {
        this._toastrService.warning(this._translateService.instant(err.mess.description));
      });
    }
  }
  getOptionText(option) {
    if (option) {
      return option.contractNo;
    }
  }

  getData() {
    this.isLoading = true;
    this.searchModel.startDate = this.activeDate ? format(this.activeDate, COMMOM_CONFIG.DATE_FORMAT) : null,
      this.searchModel.endDate = this.endActiveDate ? format(this.endActiveDate, COMMOM_CONFIG.DATE_FORMAT) : null,
      // không dùng moment nữa, dùng date-fns
      this._detachContractService.searchVehiclesAssignRFID(this.searchModel, this.selectContract.contractId).subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this.isLoading = false;
          this.dataModel.dataSource = rs.data.listData.filter(data => (data.activeStatus == STATUS_RFID_VEHICLE.HOATDONG || data.activeStatus == STATUS_RFID_VEHICLE.HUY || data.activeStatus == STATUS_RFID_VEHICLE.DONG || data.activeStatus == STATUS_RFID_VEHICLE.MO));
          this.dataModel.dataSource.map(x => {
            x.nameGroup = this.dataModel.vehicleGroupOpt.find(f => f.id == x.vehicleGroupId)?.name;
            return x;
          });
          this.dataModel.dataSource.map(x => {
            x.nameType = this.dataModel.vehicleTypeOpt.find(f => f.id == x.vehicleTypeId)?.name;
            return x;
          });
          this.totalRecord = rs.data.count;
          this.isLoading = false;
        } else if (rs.mess.code == HTTP_CODE.UNDEFINED) {
          this._toastrService.warning(this._translateService.instant('common.500Error'));
        } else {
          this._toastrService.warning(rs.mess.description);
        }
      });
  }

  onSelectedContract(event) {
    this.selectContract = event.option.value;
    this.getData();
    this.signDate = this.selectContract.signDate ? this.selectContract.signDate.split(' ')[0] : null;
    this.effDate = this.selectContract.effDate ? this.selectContract.effDate.split(' ')[0] : null;
    this.expDate = this.selectContract.expDate ? this.selectContract.expDate.split(' ')[0] : null;
  }

  detachVehicle() {
    const listInfo = {
      listVehicleSplit: this.listVehicleSplit,
      infoContract: this.selectContract
    };
    this._detachContractStore.changeListContractDetach(listInfo);
  }
}

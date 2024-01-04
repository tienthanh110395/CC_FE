import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SelectOptionModel } from '@app/core/models/common.model';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { HTTP_CODE, OptionVehicle } from '@app/shared/constant/common.constant';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
export interface Form {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-vehicle-info',
  templateUrl: './vehicle-info.component.html',
  styleUrls: ['./vehicle-info.component.scss']
})
export class VehicleInfoComponent extends BaseComponent implements OnInit, OnChanges {

  public formVehicle: FormGroup;
  public formList: FormArray;
  public selectedFormName: string;
  @Input('dataVehicle') dataVehicle = [];
  @Input('custId') custId;
  @Input('contractId') contractId;
  dataCust;
  listOptionChangeVehicle: SelectOptionModel[] = OptionVehicle;
  isActive = false;

  constructor(
    private fb: FormBuilder,
    public actr: ActivatedRoute,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    private searchInformationCustomerService: SearchInformationCustomerService,
  ) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getData();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' }
    ];
  }

  getData() {
    this.searchInformationCustomerService.getListVehicle(this.contractId, this.searchModel).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      }
    })
  }

  onRowSelected(event) {
    this.dataModel.infoVehicle = event;
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
}

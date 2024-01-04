import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { PostAuditServiceextends } from '@app/core/services/post-audit/post-audit.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicle-station-history',
  templateUrl: './vehicle-station-history.component.html',
  styleUrls: ['./vehicle-station-history.component.scss']
})
export class VehicleStationHistoryComponent extends BaseComponent implements OnInit {
  @Input('plateNumber') plateNumber;
  data;
  active = true;
  costTypeList = [];
  arrStation = [];
  @Input('listMedia') listMedia = [];
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private _postAuditServiceextends: PostAuditServiceextends,
    private dmdcService: DmdcService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }

  ngOnInit() {
    this.formSearch = this.fb.group({
      sourceTransaction: [''],
      stationType: ['', Validators.required],
      stageId: ['', Validators.required],
      startDate: [''],
      endDate: [''],
    });
    this.getStationType();
    this.getStage();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'customer-care.search-information-customer.code_process', field: 'ticketId' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'customer-care.search-information-customer.stage_station', field: 'stationInName' },
      { i18n: 'Loại vé', field: 'vehicleTypeName' },
      { i18n: 'Số tiền', field: 'ticketTypeName' },
      { i18n: 'Ngày mua', field: 'timeStampIn' },
      { i18n: 'Người mua', field: 'timeStampInTz' },
    ]
  }
  getStationType() {
    this.dmdcService.getStationType().subscribe(res => {
      if (res.mess.code === 1) {
        this.costTypeList = res.data;
        this.formSearch.controls['stationType'].setValue(this.costTypeList[0].code);
      }
    });
  }
  onchangeStationType(stationType) {
    if (stationType === '1') {
      this.active = false;
      this.dmdcService.getStationByStationType().subscribe(res => {
        if (res.mess.code === 1) {
          this.arrStation = res.data.listData;
        }
      });
    } else {
      this.active = true;
      this.getStage();
    }
  }
  getStage() {
    this.dmdcService.getStages().subscribe(res => {
      if (res.mess.code === 1) {
        this.arrStation = res.data.listData;
      }
    });
  }
  searchForm() {
    if (this.formSearch.valid) {
      let body = {};
      if (this.active) {
        body['stationCode'] = this.formSearch.value.stageId
      } else {
        body['stationInId'] = this.formSearch.value.stageId
      }
      body['fromDate'] = this.formSearch.value.startDate ? format(this.formSearch.value.startDate, COMMOM_CONFIG.DATE_FORMAT) : ''
      body['toDate'] = this.formSearch.value.endDate ? format(this.formSearch.value.endDate, COMMOM_CONFIG.DATE_FORMAT) : ''
      body['stationType'] = this.formSearch.value.stationType;
      body['sourceTransaction'] = this.formSearch.value.sourceTransaction;
      body['plateNumber'] = this.plateNumber;
      this._postAuditServiceextends.searchHistoryVehicle(body).subscribe(res => {
        if (res.mess.code === 1) {
          this.dataModel.dataSource = res.data;
        }
      });
    }
  }
}

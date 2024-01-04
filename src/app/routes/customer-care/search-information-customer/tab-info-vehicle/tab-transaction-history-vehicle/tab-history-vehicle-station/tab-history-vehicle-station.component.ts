import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AppStorage } from '@app/core/services/AppStorage';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { BUY_TICKET, CommonSettleService, HTTP_CODE, SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
interface SearchModel {
  code?: any;
  stationType?: number;
  stationInId?: number;
  stationOutId?: number;
  sourceTransaction?: string;
  timestampOutFrom?: string;
  timestampOutTo?: string;
  timestampInFrom?: string;
  timestampInTo?: string;
  pagesize?: number;
  startrecord?: any;
  contractId?: number
}
@Component({
  selector: 'app-tab-history-vehicle-station',
  templateUrl: './tab-history-vehicle-station.component.html',
  styleUrls: ['./tab-history-vehicle-station.component.scss']
})
export class TabHistoryVehicleStationComponent extends BaseComponent implements OnInit {
  @Input() plateNumber;
  @Input() contractId;
  stationIn_Id: number;
  stationOut_Id: number;
  stageStationName: string;
  active = true;
  arrStation = [];
  costTypeList = [];
  dataOptionStationType: any;
  dataOptionStages: any;
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private _commonSettleService: CommonSettleService,
    private _sharedDirectoryService: SharedDirectoryService,
    private dmdcService: DmdcService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr)
  }

  ngOnInit() {
    this.formSearch = this.fb.group({
      sourceTransaction: [''],
      stationType: [''],
      stageId: ['', Validators.required],
      timestampOutFrom: ['', Validators.required],
      timestampOutTo: ['', Validators.required],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]],
    });
    this.getStationType();
    this.getStage();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'customer-care.search-information-customer.code_process', field: 'ticketId' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'customer-care.search-information-customer.stage_station', field: 'stationInName' },
      { i18n: 'Loại vé', field: 'ticketTypeName' },
      { i18n: 'Số tiền', field: 'price' },
      { i18n: 'Ngày mua', field: 'createDate' },
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

  getStage() {
    this.dmdcService.getStages().subscribe(res => {
      if (res.mess.code === 1) {
        this.arrStation = res.data.listData;
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

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex == 0 ? event.pageIndex : event.pageIndex * event.pageSize,
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.searchForm();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.searchForm();
  }

  searchForm() {
    this.isLoading = true;
    const param: SearchModel = {};
    if (this.formSearch.value.stationType == BUY_TICKET.TRAM_KIN) {
      param.stationInId = Number(this.stationIn_Id);
      param.stationOutId = Number(this.stationOut_Id);
      if (this.formSearch.value.timestampOutFrom) {
        param.timestampOutFrom = moment(this.formSearch.value.timestampOutFrom).format(
          COMMOM_CONFIG.DATE_FORMAT_1,
        );
      }
      if (this.formSearch.value.timestampOutTo) {
        param.timestampOutTo = moment(this.formSearch.value.timestampOutTo).format(
          COMMOM_CONFIG.DATE_FORMAT_1,
        );
      }
    } else {
      if (this.formSearch.value.stations) {
        param.stationInId = Number(this.formSearch.value.stations);
        this.stageStationName = this.arrStation.find(x => x.code == this.formSearch.value.stations).name;
      }
      if (this.formSearch.value.timestampOutFrom) {
        param.timestampInFrom = moment(this.formSearch.value.timestampOutFrom).format(
          COMMOM_CONFIG.DATE_FORMAT_1,
        );
      }
      if (this.formSearch.value.timestampOutTo) {
        param.timestampInTo = moment(this.formSearch.value.timestampOutTo).format(
          COMMOM_CONFIG.DATE_FORMAT_1,
        );
      }
    }
    param.sourceTransaction = this.formSearch.controls.sourceTransaction.value;
    param.code = this.plateNumber ? this.plateNumber : '';

    param.stationType = this.formSearch.value.stationType;
    param.pagesize = this.formSearch.controls.pagesize.value;
    param.startrecord = this.formSearch.controls.startrecord.value;
    param.contractId = this.contractId;
    this.removeNull(param);
    this._commonSettleService.searchVehicleTransactions(param).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
        this.isLoading = false;
      }
    });
  }
}

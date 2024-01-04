import {Component, Inject, Injector, Input, OnInit} from '@angular/core';
import {BaseComponent} from "@shared/components/base-component/base-component.component";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-vietmap-details',
  templateUrl: './vietmap-details.component.html',
  styleUrls: ['./vietmap-details.component.scss']
})
export class VietmapDetailsComponent extends BaseComponent implements OnInit {

  constructor(_injector: Injector, @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(_injector);
    this.columns = [
      {i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', sticky: true},
      {i18n: 'customer-care.search-information-customer.type_station', field: 'stationType', type: 'a'},
      {i18n: 'vietMap.stationCode', field: 'stationCode'},
      {i18n: 'vietMap.station-name', field: 'stationName'},
      {i18n: 'special-vehicle.vehicle.type', field: 'vehicleTypeName'},
      {i18n: 'exchangeHistory.type_ticket', field: 'servicePlanTypeName'},
      {i18n: 'vietMap.minimumBalance', field: 'fee', type: 'b'},
      {i18n: 'vietMap.anotherWarning', field: 'warningOther'},
    ];
  }

  ngOnInit(): void {
    this.getTableData();
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex * event.pageSize;
    this.searchModel.pagesize = event.pageSize;
    this.dataModel.dataSource = this.data.dataSource.filter((_, index) => {
      return this.searchModel.startrecord <= index && index < (this.searchModel.startrecord + event.pageSize)
    });
  }

  getTableData() {
    this.dataModel.dataSource = this.data.dataSource.filter((_, index) => {
      return this.searchModel.startrecord <= index && index < (this.searchModel.startrecord + this.searchModel.pagesize)
    });
    this.searchModel.start = this.searchModel.startrecord;
    this.totalRecord = this.data.dataLength;
  }

  getWith(): string {
    if (this.dataModel.dataSource && this.dataModel.dataSource.length > 0) {
      return '1300px';
    }
    return '100%';
  }
}

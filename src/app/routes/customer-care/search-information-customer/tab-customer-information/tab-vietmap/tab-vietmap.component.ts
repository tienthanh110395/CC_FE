import {Component, Injector, Input, OnInit} from '@angular/core';
import {BaseComponent} from "@shared/components/base-component/base-component.component";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {BillingService} from "@core/services/billing/billing.service";
import {ToastrService} from "ngx-toastr";
import {MtxDialog} from "@ng-matero/extensions";
import {COMMOM_CONFIG} from "@env/environment";
import moment from "moment";
import {MatDialog} from "@angular/material/dialog";
import {
  VietmapDetailsComponent
} from "@app/routes/customer-care/search-information-customer/tab-customer-information/tab-vietmap/vietmap-details/vietmap-details.component";
import {SharedDirectoryService} from "@shared";
import {SearchInformationCustomerService} from "@core/services/customer-care/search-information-customer.service";
import {DomSanitizer} from "@angular/platform-browser";
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-tab-vietmap',
  templateUrl: './tab-vietmap.component.html',
  styleUrls: ['./tab-vietmap.component.scss']
})
export class TabVietmapComponent extends BaseComponent implements OnInit {
  @Input('data') data;
  listStation = [];
  fromDate = new FormControl(null, Validators.required);
  today = new Date();
  toDate = new FormControl(null, Validators.required);
  botId;
  loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(_injector: Injector, private fb: FormBuilder,
              protected translateService: TranslateService,
              private _sharedDirectoryService: SharedDirectoryService,
              protected toastr: ToastrService,
              private matDialog: MatDialog,
              private searchInfo: SearchInformationCustomerService,
  ) {
    super(_injector);
    this.formSearch = this.fb.group({
      fromDate: [],
      toDate: [],
      plateNumber: [],
      botId: []
    });
  }

  ngOnInit(): void {
    this.columns = [
      {i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', sticky: true},
      {i18n: 'vietMap.warnDateTime', field: 'warningDate'},
      {i18n: 'vietMap.plateNumber', field: 'plateNumber'},
      {i18n: 'vietMap.tel', field: 'phoneNumber'},
      {i18n: 'vietMap.accountName', field: 'custName'},
      {i18n: 'vietMap.botList', field: 'listStation', type: 'listStation'},
      {i18n: 'vietMap.botNumber', field: 'stationNumber'},
      {i18n: 'vietMap.amountTicketPrice', field: 'totalPrice', type: 'customC'},
      {i18n: 'vietMap.result', field: 'actStatus', type: 'customD'},
      {i18n: 'vietMap.tkgt', field: 'balanceState', type: 'customB'},
      {i18n: 'common.viewDetail', field: 'action', type: 'action'}
    ];
    this.getStation();
  }

  getData() {
    if (this.formSearch.valid) {
      this.loadingSubject.next(true);
      const searchModel = {...this.searchModel, ...this.formSearch.value};
      searchModel.fromDate = this.formSearch.value.fromDate ? moment(this.formSearch.value.fromDate).format(COMMOM_CONFIG.DATE_FORMAT_1) : null;
      searchModel.toDate = this.formSearch.value.toDate ? moment(this.formSearch.value.toDate).format(COMMOM_CONFIG.DATE_FORMAT_1) : null;
      this.searchModel.start = this.searchModel.startrecord;
      searchModel.contractId = this.data.listContract[0].contractId;
      this.searchInfo.warningAuditVietMap(searchModel).pipe(
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(res => {
        console.log('update loading')
        if (res.mess.code == 1) {
          this.totalRecord = res.data.count;
          this.dataModel.dataSource = res.data.listData;
        }
      });
    }
  }

  getStation() {
    return this._sharedDirectoryService.getServiceTypes().subscribe(rs => {
      this.botId = rs.data.listData[3].id;
      return this._sharedDirectoryService.getBotStations(this.botId).subscribe(res => {
        this.listStation = res.data.listData;
      });
    });
  }

  getBotStation() {
    return this._sharedDirectoryService.getServiceTypes().subscribe(rs => {
      this.botId = rs.data.listData[3].id;
    });
  }

  getWith(): string {
    if (this.dataModel.dataSource && this.dataModel.dataSource.length > 0) {
      return '1500px';
    }
    return '100%';
  }

  export() {
    const searchModel = {...this.searchModel, ...this.formSearch.value};
    const data = {
      ...this.searchModel, ...this.formSearch.value,
      contractId: this.data.listContract[0].contractId,
      fromDate: searchModel.fromDate = this.formSearch.value.fromDate ? moment(this.formSearch.value.fromDate).format(COMMOM_CONFIG.DATE_FORMAT_1) : null,
      toDate: searchModel.toDate = this.formSearch.value.toDate ? moment(this.formSearch.value.toDate).format(COMMOM_CONFIG.DATE_FORMAT_1) : null
    };
    this.searchInfo.exportVietMap(data).subscribe(res => {
      const contentDisposition = res.headers.get('content-disposition');
      const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
      saveAs(res.body, filename);
    });
  }

  viewDetail(item) {
    this.searchInfo.vietmapDetails(item.id).subscribe(res => {
      const value = res.data;
      this.matDialog.open(VietmapDetailsComponent, {data: {dataSource: value, targetDetail: item}});
    });
  }
}

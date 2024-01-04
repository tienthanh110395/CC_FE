import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CC_CUST_REACT, HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-ticket-statistics-search',
  templateUrl: './ticket-statistics-search.component.html',
  styleUrls: ['./ticket-statistics-search.component.scss']
})
export class TicketStatisticsSearchComponent extends BaseComponent implements OnInit {
  formTicketStatistic: FormGroup;
  ticketSourceList = [];
  ticketStatisticTypeLv1List = [];
  ticketStatisticTypeLv2List = [];
  ticketStatisticTypeLv3List = [];
  ticketStatisticTypeLv4List = [];
  ticketStatisticTypeLv5List = [];
  check = [];
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    private _commonCCService: CommonCCService,
    private _ticketService: TicketService,
  ) {
    super();
  }

  ngOnInit() {
    this.buildColumns();
    this.buildForm();
    this.getListTicketSource();
    this.getDataTicketStatisticTypeLv1();
    this.getDataTicketStatistic();
  }

  buildColumns() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', width: '30px', sticky: true },
      { i18n: 'contract.recieveDate', field: 'createDate', width: '80px' },
      { i18n: 'ticket-statistic.contract-user', field: 'contractNoUserName', width: '60px' },
      { i18n: 'ticket-statistic.plate', field: 'plateNumber', width: '50px' },
      { i18n: 'ticket-statistic.phone-system', field: 'systemPhoneNumber', width: '60px' },
      { i18n: 'ticket-statistic.phone-call', field: 'callPhoneNumber', width: '60px' },
      { i18n: 'ticket-statistic.receive-chanel', field: 'sourceName', width: '60px' },
      { i18n: 'ticket-statistic.statistic-lv1', field: 'l1StatisticTypeName', width: '150px' },
      { i18n: 'ticket-statistic.statistic-lv2', field: 'l2StatisticTypeName', width: '150px' },
      { i18n: 'ticket-statistic.statistic-lv3', field: 'l3StatisticTypeName', width: '150px' },
      { i18n: 'ticket-statistic.statistic-lv4', field: 'l4StatisticTypeName', width: '150px' },
      { i18n: 'ticket-statistic.statistic-lv5', field: 'l5StatisticTypeName', width: '150px' },
      { i18n: 'ticket-statistic.content-statistic', field: 'statisticContent', width: '150px' },
      { i18n: 'ticket-statistic.react-customer', field: 'custReaction', width: '40px' },
    ];
  }

  buildForm() {
    this.formTicketStatistic = this.fb.group({
      contractNoUserNames: [''],
      plateNumbers: [''],
      systemPhoneNumbers: [''],
      callPhoneNumbers: [''],
      sourceId: [''],
      l1StatisticTypeId: [''],
      l2StatisticTypeId: [''],
      l3StatisticTypeId: [''],
      l4StatisticTypeId: [''],
      l5StatisticTypeId: [''],
      custReaction: [''],
      fromDate: [''],
      toDate: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    })
  }

  getListTicketSource() {
    if (AppStorage.get('list-ticket-source')) {
      this.ticketSourceList = AppStorage.get('list-ticket-source').map(val => ({ value: val.ticketSourceId, label: val.name }));
    } else {
      this._commonCCService.getListTicketSource().subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketSourceList = data.map(val => ({ value: val.ticketSourceId, label: val.name }));
      });
    }
  }

  getDataTicketStatisticTypeLv1() {
    this._ticketService.getTicketStatisticType().subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketStatisticTypeLv1List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
    })
  }

  onChangeTicketStatisticTypeLv1(option) {
    this.formTicketStatistic.controls.l2StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l3StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l4StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l5StatisticTypeId.setValue(null);
    this.ticketStatisticTypeLv2List = [];
    this.ticketStatisticTypeLv3List = [];
    this.ticketStatisticTypeLv4List = [];
    this.ticketStatisticTypeLv5List = [];
    if (option) {
      this._ticketService.getTicketStatisticType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketStatisticTypeLv2List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
      })
    }
  }

  onChangeTicketStatisticTypeLv2(option) {
    this.formTicketStatistic.controls.l3StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l4StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l5StatisticTypeId.setValue(null);
    this.ticketStatisticTypeLv3List = [];
    this.ticketStatisticTypeLv4List = [];
    this.ticketStatisticTypeLv5List = [];
    if (option) {
      this._ticketService.getTicketStatisticType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketStatisticTypeLv3List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
      })
    }
  }

  onChangeTicketStatisticTypeLv3(option) {
    this.formTicketStatistic.controls.l4StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l5StatisticTypeId.setValue(null);
    this.ticketStatisticTypeLv4List = [];
    this.ticketStatisticTypeLv5List = [];
    if (option) {
      this._ticketService.getTicketStatisticType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketStatisticTypeLv4List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
      })
    }
  }

  onChangeTicketStatisticTypeLv4(option) {
    this.formTicketStatistic.controls.l5StatisticTypeId.setValue(null);
    this.ticketStatisticTypeLv5List = [];
    if (option) {
      this._ticketService.getTicketStatisticType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketStatisticTypeLv5List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
      })
    }
  }

  setValueToObject(searchObj: any) {
    searchObj.contractNoUserNames = searchObj.contractNoUserNames ? searchObj.contractNoUserNames.trim() : '';
    searchObj.plateNumbers = searchObj.plateNumbers ? searchObj.plateNumbers.trim() : '';
    searchObj.systemPhoneNumbers = searchObj.systemPhoneNumbers ? searchObj.systemPhoneNumbers.trim() : '';
    searchObj.callPhoneNumbers = searchObj.callPhoneNumbers ? searchObj.callPhoneNumbers.trim() : '';
    searchObj.sourceId = searchObj.sourceId ? searchObj.sourceId : '';
    searchObj.l1StatisticTypeId = searchObj.l1StatisticTypeId ? searchObj.l1StatisticTypeId : '';
    searchObj.l2StatisticTypeId = searchObj.l2StatisticTypeId ? searchObj.l2StatisticTypeId : '';
    searchObj.l3StatisticTypeId = searchObj.l3StatisticTypeId ? searchObj.l3StatisticTypeId : '';
    searchObj.l4StatisticTypeId = searchObj.l4StatisticTypeId ? searchObj.l4StatisticTypeId : '';
    searchObj.l5StatisticTypeId = searchObj.l5StatisticTypeId ? searchObj.l5StatisticTypeId : '';
    this.check = [];
    if (this.dataModel.ok) {
      this.check.push(CC_CUST_REACT.OK);
    }
    if (this.dataModel.nok) {
      this.check.push(CC_CUST_REACT.NOK);
    }
    if (this.dataModel.angry) {
      this.check.push(CC_CUST_REACT.ANGRY);
    }
    searchObj.reactionCustomerType = this.check.join(',');
    searchObj.fromDate = searchObj.fromDate ? format(searchObj.fromDate, COMMOM_CONFIG.DATE_FORMAT) : '';
    searchObj.toDate = searchObj.toDate ? format(searchObj.toDate, COMMOM_CONFIG.DATE_FORMAT) : '';
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item];
      }
    }
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formTicketStatistic.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formTicketStatistic.controls.pagesize.setValue(event.pageSize);
    this.getDataTicketStatistic();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formTicketStatistic.controls.startrecord.setValue(0);
    this.getDataTicketStatistic();
  }

  getDataTicketStatistic() {
    if (this.formTicketStatistic.valid) {
      const searchObj = Object.assign({}, this.formTicketStatistic.value);
      this.setValueToObject(searchObj);
      if (this.formTicketStatistic.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this._ticketService.searchTicketStatistic(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData.map(x => {
            x.custReaction = x.custReaction == 1 ? 'OK' : x.custReaction == 2 ? 'NOK' : x.custReaction == 3 ? 'Gay gắt' : "";
            return x;
          });
          this.totalRecord = rs.data.count;
        } else {
          this.toastr.error(rs.mess.description);
        }
      }, () => {
        this.toastr.error(this.translateService.instant('common.500Error'));
      });
    }
  }

  exportFile() {
    if (this.formTicketStatistic.valid) {
      const searchModelExcel = Object.assign({}, this.formTicketStatistic.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._ticketService.exportExcelTicketStatistic(searchModelExcel).subscribe(
        res => {
          const contentDisposition = res.headers.get('content-disposition');
          const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
          saveAs(res.body, filename);
        },
        () => {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      );
    }
  }
}

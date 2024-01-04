import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { HTTP_CODE } from '@app/shared/constant/common.constant';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-ticket-report-performmance',
  templateUrl: './ticket-report-performmance.component.html',
  styleUrls: ['./ticket-report-performmance.component.scss']
})
export class TicketReportPerformmanceComponent extends BaseComponent implements OnInit {
  formTicketReport: FormGroup;
  @ViewChild('allTicketSource') private allTicketSource: MatOption;
  @ViewChild('allTicketTypeLv1') private allTicketTypeLv1: MatOption;
  @ViewChild('allTicketTypeLv2') private allTicketTypeLv2: MatOption;
  @ViewChild('allTicketTypeLv3') private allTicketTypeLv3: MatOption;
  ticketSourceList = [];
  ticketTypeLv1List = [];
  ticketTypeLv2List = [];
  ticketTypeLv3List = [];
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
    this.buildForm();
    this.buildColumns();
    this.getListTicketSource();
    this.getListTicketTypeLv1();
    this.getDataTicketReportPerformmance();
  }

  checkFormatDate(value: string): boolean {
    if (!value) return false;
    if (!(/^\d{2}\/\d{2}\/\d{4}$/.test(value))) return true;
    const parts = value.split("/");
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return true;

    return false;
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  onChangeTicketSourceOne() {
    if (this.allTicketSource.selected) {
      this.allTicketSource.deselect();
    }
    if (this.formTicketReport.controls.sourceId.value.length == this.ticketSourceList.length) {
      this.allTicketSource.select();
    }
  }

  onChangeTicketSourceAll() {
    if (this.allTicketSource.selected) {
      this.formTicketReport.controls.sourceId.setValue([...this.ticketSourceList, -1]);
    } else {
      this.formTicketReport.controls.sourceId.setValue([]);
    }
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

  onChangeTicketTypeLv1One() {
    if (this.allTicketTypeLv1.selected) {
      this.allTicketTypeLv1.deselect();
    }
    if (this.formTicketReport.controls.l1TicketTypeId.value.length == this.ticketTypeLv1List.length) {
      this.allTicketTypeLv1.select();
    }
    this.handleChangeTicketTypeLv1();
  }

  onChangeTicketTypeLv1All() {
    if (this.allTicketTypeLv1.selected) {
      this.formTicketReport.controls.l1TicketTypeId.setValue([...this.ticketTypeLv1List, -1]);
    } else {
      this.formTicketReport.controls.l1TicketTypeId.setValue([]);
    }
    this.handleChangeTicketTypeLv1();
  }

  handleChangeTicketTypeLv1() {
    this.formTicketReport.controls.l2TicketTypeId.setValue(null);
    this.formTicketReport.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv2List = [];
    this.ticketTypeLv3List = [];
    if (this.formTicketReport.controls.l1TicketTypeId.value?.length > 0) {
      this.getListTicketTypeLv2(this.formTicketReport.controls.l1TicketTypeId.value.filter(item => item !== -1).map(item => item.value).join(','));
    }
  }

  handleChangeTicketTypeLv2() {
    this.formTicketReport.controls.l3TicketTypeId.setValue(null);
    this.ticketTypeLv3List = [];
    if (this.formTicketReport.controls.l2TicketTypeId.value?.length > 0) {
      this.getListTicketTypeLv3(this.formTicketReport.controls.l2TicketTypeId.value.filter(item => item !== -1).map(item => item.value).join(','));
    }
  }

  onChangeTicketTypeLv2One() {
    if (this.allTicketTypeLv2.selected) {
      this.allTicketTypeLv2.deselect();
    }
    if (this.formTicketReport.controls.l2TicketTypeId.value.length == this.ticketTypeLv2List.length) {
      this.allTicketTypeLv2.select();
    }
    this.handleChangeTicketTypeLv2();
  }

  onChangeTicketTypeLv2All() {
    if (this.allTicketTypeLv2.selected) {
      this.formTicketReport.controls.l2TicketTypeId.setValue([...this.ticketTypeLv2List, -1]);
    } else {
      this.formTicketReport.controls.l2TicketTypeId.setValue([]);
    }
    this.handleChangeTicketTypeLv2();
  }

  onChangeTicketTypeLv3One() {
    if (this.allTicketTypeLv3.selected) {
      this.allTicketTypeLv3.deselect();
    }
    if (this.formTicketReport.controls.l3TicketTypeId.value.length == this.ticketTypeLv3List.length) {
      this.allTicketTypeLv3.select();
    }
  }

  onChangeTicketTypeLv3All() {
    if (this.allTicketTypeLv3.selected) {
      this.formTicketReport.controls.l3TicketTypeId.setValue([...this.ticketTypeLv3List, -1]);
    } else {
      this.formTicketReport.controls.l3TicketTypeId.setValue([]);
    }
  }

  getListTicketTypeLv1() {
    if (AppStorage.get('list-ticket-type')) {
      this.ticketTypeLv1List = AppStorage.get('list-ticket-type').map(val => ({ value: val.ticketTypeId, label: val.name }));
    } else {
      this._commonCCService.getListTicketType().subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketTypeLv1List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
      });
    }
  }

  getListTicketTypeLv2(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketTypeLv2List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  getListTicketTypeLv3(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketTypeLv3List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  buildColumns() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', width: '20px', sticky: true },
      { i18n: 'ticket-statistic.resolveDate', field: 'updateDateReport', width: '80px' },
      { i18n: 'customer-care.search-process.userProcess', field: 'updateUser', width: '100px' },
      { i18n: 'customer-care.search-cc.ticketTypeLv1', field: 'l1TicketTypeName', width: '150px' },
      { i18n: 'customer-care.search-cc.ticketTypeLv2', field: 'l2TicketTypeName', width: '150px' },
      { i18n: 'customer-care.search-cc.ticketTypeLv3', field: 'l3TicketTypeName', width: '150px' },
      { i18n: 'customer-care.search-cc.amount-reflection', field: 'closeQuantity', width: '40px' },
      { i18n: 'customer-care.search-cc.amount-reflected-term', field: 'inDueDate', width: '40px' },
      { i18n: 'customer-care.search-cc.overdue-reflections', field: 'outOfDate', width: '40px' },
    ];
  }

  buildForm() {
    this.formTicketReport = this.fb.group({
      processUser: [''],
      sourceId: [''],
      l1TicketTypeId: [''],
      l2TicketTypeId: [''],
      l3TicketTypeId: [''],
      fromDate: [''],
      toDate: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]],
    })
  }

  setValueToObject(searchObj: any) {
    searchObj.processUser = searchObj.processUser ? searchObj.processUser.trim() : '';
    searchObj.sourceId = searchObj.sourceId && Array.isArray(searchObj.sourceId) ? searchObj.sourceId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.l1TicketTypeId = searchObj.l1TicketTypeId && Array.isArray(searchObj.l1TicketTypeId) ? searchObj.l1TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.l2TicketTypeId = searchObj.l2TicketTypeId && Array.isArray(searchObj.l2TicketTypeId) ? searchObj.l2TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
    searchObj.l3TicketTypeId = searchObj.l3TicketTypeId && Array.isArray(searchObj.l3TicketTypeId) ? searchObj.l3TicketTypeId.filter(item => item !== -1).map(item => item.value).join(';') : null;
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
    this.formTicketReport.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formTicketReport.controls.pagesize.setValue(event.pageSize);
    this.getDataTicketReportPerformmance();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formTicketReport.controls.startrecord.setValue(0);
    this.getDataTicketReportPerformmance();
  }

  getDataTicketReportPerformmance() {
    if (this.formTicketReport.valid) {
      const searchObj = Object.assign({}, this.formTicketReport.value);
      this.setValueToObject(searchObj);
      if (this.formTicketReport.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this._ticketService.searchTicketReportPerformmance(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
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
    if (this.formTicketReport.valid) {
      const searchModelExcel = Object.assign({}, this.formTicketReport.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._ticketService.exportExcelTicketReportPerformance(searchModelExcel).subscribe(
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

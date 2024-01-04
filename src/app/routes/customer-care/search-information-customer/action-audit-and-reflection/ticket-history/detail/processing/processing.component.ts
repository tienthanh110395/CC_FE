import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CC_TICKET_STATUS, CommonCRMService, HTTP_CODE, TICKET_ASSIGN_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingTabComponent extends BaseComponent implements OnInit {

  @Input() data: any;
  isFirstTime: boolean = true;
  ticketStatusList = [
    { value: CC_TICKET_STATUS.TAO_MOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.new') },
    { value: CC_TICKET_STATUS.DANG_XU_LY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.process') },
    { value: CC_TICKET_STATUS.XU_LY_XONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.doneProcess') },
    { value: CC_TICKET_STATUS.DONG, label: this._translateService.instant('customer-care.dropdown.ticketStatus.close') },
    { value: CC_TICKET_STATUS.HUY, label: this._translateService.instant('customer-care.dropdown.ticketStatus.cancel') },
    { value: CC_TICKET_STATUS.THEO_DOI, label: this._translateService.instant('customer-care.dropdown.ticketStatus.follow') }
  ];
  actTypeList = [];
  ticketAssignStatusList = [
    { value: TICKET_ASSIGN_STATUS.NEW, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.new') },
    { value: TICKET_ASSIGN_STATUS.CANCEL, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.cancel') },
    { value: TICKET_ASSIGN_STATUS.REJECT, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.reject') },
    { value: TICKET_ASSIGN_STATUS.RECEIVE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.receive') },
    { value: TICKET_ASSIGN_STATUS.CONCLUDE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.conclude') },
    { value: TICKET_ASSIGN_STATUS.COMPLETE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.complete') },
    { value: TICKET_ASSIGN_STATUS.CLOSE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.close') }
  ];

  constructor(private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private _commonCRMService: CommonCRMService) {
    super();
  }

  ngOnInit(): void {
    this.getActTypeList();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.ticket-history.processTime', field: 'processTime' },
      { i18n: 'customer-care.search-cc.processUnit', field: 'siteName' },
      { i18n: 'customer-care.search-cc.processUser', field: 'staffName' },
      // { i18n: 'customer-care.ticket-history.actionType', field: 'actTypeId' },
      { i18n: 'customer-care.search-cc.processContent', field: 'processContent' },
      { i18n: 'customer-care.search-cc.ticketStatus', field: 'ticketStatus' },
      { i18n: 'customer-care.search-cc.ticketAssignStatus', field: 'assignStatus' }
    ];
    super.mapColumn();
    this.formSearch = this.fb.group({
      ticketId: this.data.ticketId,
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
    this.search();
  }

  getActTypeList() {
    if (AppStorage.get('list-act-type')) {
      this.actTypeList = AppStorage.get('list-act-type').map(val => ({ value: val.actTypeId, label: val.name }));
    } else {
      this._commonCRMService.searchActType().subscribe(res => {
        const data = res.data?.listData || [];
        this.actTypeList = data.map(val => ({ value: val.actTypeId, label: val.name }));
      });
    }
  }

  search() {
    this.isLoading = true;
    let searchObj = Object.assign({}, this.formSearch.value);
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item]
      }
    }
    if (this.formSearch.value.startrecord == 0) {
      searchObj.startrecord = 0;
    }
    this._ticketService.getHistoryProcess(searchObj).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData.map(x => {
          x.assignStatus = x.assignStatus == 1 ? 'Tạo mới' : x.assignStatus == 2 ? 'Đang xử lý' : x.assignStatus == 3 ? 'Kết luận xử lý' : x.assignStatus == 4 ? 'Hoàn thành xử lý' :
            x.assignStatus == 5 ? 'Đóng xử lý' : x.assignStatus == 6 ? 'Từ chối' : x.assignStatus == 7 ? 'Hủy' : '';
          return x;
        });
        this.totalRecord = rs.data.count;
        this.isLoading = false;
        this.isFirstTime = false;
      } else {
        this._toastrService.error(rs.mess.description);
      }
    }, error => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.search();
  }

  showStatusName(value: any): string {
    const status = this.ticketStatusList.find(item => item.value + '' === value + '');
    if (status) return status.label;
    return '';
  }

  showAssignStatusName(value: any): string {
    const status = this.ticketAssignStatusList.find(item => item.value + '' === value + '');
    if (status) return status.label;
    return '';
  }

  showActTypeName(value: any): string {
    const actType = this.actTypeList.find(item => item.value + '' === value + '');
    if (actType) return actType.label;
    return value;
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CommonCRMService, HTTP_CODE, TICKET_ASSIGN_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-ticket-history-tab',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class TicketAssignHistoryTabComponent extends BaseComponent implements OnInit {

  statusList = [
    { value: TICKET_ASSIGN_STATUS.NEW, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.new') },
    { value: TICKET_ASSIGN_STATUS.CANCEL, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.cancel') },
    { value: TICKET_ASSIGN_STATUS.REJECT, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.reject') },
    { value: TICKET_ASSIGN_STATUS.RECEIVE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.receive') },
    { value: TICKET_ASSIGN_STATUS.CONCLUDE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.conclude') },
    { value: TICKET_ASSIGN_STATUS.COMPLETE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.complete') },
    { value: TICKET_ASSIGN_STATUS.CLOSE, label: this._translateService.instant('customer-care.dropdown.ticketAssignStatus.close') }
  ];
  @Input() data: any;
  // isFirstTime: boolean = true;

  constructor(private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private _commonCRMService: CommonCRMService) {
    super();
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.userChange', field: 'createUser' },
      { i18n: 'customer-care.search-process.unit', field: 'siteName' },
      { i18n: 'customer-care.search-process.createTime', field: 'createDate' },
      { i18n: 'common.status', field: 'ticketStatus' },
      { i18n: 'customer-care.search-process.content', field: 'processContent' }
    ];
    super.mapColumn();
    this.formSearch = this.fb.group({
      ticketId: this.data.ticketId,
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
    this.search();
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
    this._ticketService.searchTicketAssignHistory(searchObj).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        this.isLoading = false;
        // this.isFirstTime = false;
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
    const status = this.statusList.find(item => item.value + '' === value + '');
    if (status) return status.label;
    return '';
  }
}

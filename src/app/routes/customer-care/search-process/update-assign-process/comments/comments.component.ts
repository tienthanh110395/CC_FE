import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CommonCRMService, HTTP_CODE, TICKET_ASSIGN_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AddNewCommentComponent } from './add-new/add-new.component';

@Component({
  selector: 'app-comments-tab',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsTabComponent extends BaseComponent implements OnInit {

  @Input() data: any;
  // isFirstTime: boolean = true;
  closeStatus: string = TICKET_ASSIGN_STATUS.CLOSE + '';

  constructor(private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private _commonCRMService: CommonCRMService,
    public dialog: MtxDialog) {
    super();
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.contentComment', field: 'logContent' },
      { i18n: 'customer-care.search-process.createUser', field: 'createUser' },
      { i18n: 'customer-care.search-process.unit', field: 'siteName' },
      { i18n: 'customer-care.search-process.createTime', field: 'createDate' },
      { i18n: 'common.action', field: 'action' },
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
    this._ticketService.searchTicketAssignLog(searchObj).subscribe(rs => {
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

  onInsert() {
    const dialogRef = this.dialog.originalOpen(AddNewCommentComponent, {
      width: '60%',
      data: this.data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.search();
      }
    });
  }

  onViewDetail(data) {
    this.dialog.originalOpen(AddNewCommentComponent, {
      width: '60%',
      data,
      disableClose: false
    });
  }

  onDelete(item) {
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      width: '30%',
      data: {
        title: this._translateService.instant('common.confirm.title.delete'),
        message: this._translateService.instant('common.confirm.delete')
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._ticketService.deleteAssignLog(item.ticketAssignLogId).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.search();
            this._toastrService.success(this._translateService.instant('common.notify.delete.success'));
          } else {
            this._toastrService.error(res.mess.description);
          }
        }, err => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    });
  }

}

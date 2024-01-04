import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CC_STATUS_REACT, HTTP_CODE } from '@app/shared/constant/common.constant';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AddEditTicketExpireCauseComponent } from './add-edit-ticket-expire-cause/add-edit-ticket-expire-cause.component';
import { ViewTicketExpireCauseComponent } from './view-ticket-expire-cause/view-ticket-expire-cause.component';

@Component({
  selector: 'app-ticket-expire-cause',
  templateUrl: './ticket-expire-cause.component.html',
  styleUrls: ['./ticket-expire-cause.component.scss']
})
export class TicketExpireCauseComponent extends BaseComponent implements OnInit {
  formTicketExpireCause: FormGroup;
  check = [];
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    private _ticketService: TicketService,
    private matDialog: MatDialog,
    public dialog: MtxDialog,
  ) {
    super();
  }

  ngOnInit() {
    this.buildColumns();
    this.buildForm();
    this.getDataTicketExpireCause();
  }

  buildForm() {
    this.formTicketExpireCause = this.fb.group({
      name: [''],
      code: [''],
      status: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    })
  }

  buildColumns() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', sticky: true, width: '20px' },
      { i18n: 'common.action', field: 'actionCustom', type: 'actionCustom', sticky: true, width: '40px' },
      { i18n: 'ticket-expire-cause.ticketExpireCauseNameLv1', field: 'name', width: '100px' },
      { i18n: 'ticket-expire-cause.ticketExpireCauseIdLv1', field: 'code', width: '20px' },
      { i18n: 'ticket-expire-cause.ticketExpireCauseNameLv2', field: 'name2', width: '100px' },
      { i18n: 'ticket-expire-cause.ticketExpireCauseIdLv2', field: 'code2', width: '20px' },
      { i18n: 'ticket-expire-cause.ticketExpireCauseNameLv3', field: 'name3', width: '100px' },
      { i18n: 'ticket-expire-cause.ticketExpireCauseIdLv3', field: 'code3', width: '20px' },
      { i18n: 'ticket-expire-cause.description', field: 'description', width: '100px' },
      { i18n: 'ticket-expire-cause.status', field: 'statusName', width: '50px' },
    ];
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formTicketExpireCause.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formTicketExpireCause.controls.pagesize.setValue(event.pageSize);
    this.getDataTicketExpireCause();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formTicketExpireCause.controls.startrecord.setValue(0);
    this.getDataTicketExpireCause();
  }

  setValueToObject(searchObj: any) {
    searchObj.name3 = searchObj.name3 ? searchObj.name3.trim() : '';
    searchObj.code3 = searchObj.code3 ? searchObj.code3.trim() : '';
    this.check = [];
    if (this.dataModel.unValidity) {
      this.check.push(CC_STATUS_REACT.EXPIRE);
    }
    if (this.dataModel.validity) {
      this.check.push(CC_STATUS_REACT.EFFECT);
    }
    searchObj.statusType = this.check.join(',');
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item];
      }
    }
  }

  getDataTicketExpireCause() {
    if (this.formTicketExpireCause.valid) {
      const searchObj = Object.assign({}, this.formTicketExpireCause.value);
      this.setValueToObject(searchObj);
      if (this.formTicketExpireCause.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this._ticketService.searchTicketExpireCause(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData.map(x => {
            x.statusName = x.status == 0 ? 'Hết hiệu lực' : x.status == 1 ? 'Hiệu lực' : '';
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

  viewDetail(row) {
    const dialogRef = this.matDialog.open(
      ViewTicketExpireCauseComponent,
      {
        width: '1000px',
        panelClass: 'my-dialog',
        disableClose: true,
        data: row,
      }
    );
    dialogRef.afterClosed().subscribe(rs => {
      if (row) {
        this.onSearch();
      } else {
        this.getDataTicketExpireCause();
      }
    });
  }

  addTicketExpireCause() {
    const dialogRef = this.matDialog.open(
      AddEditTicketExpireCauseComponent,
      {
        width: '1000px',
        panelClass: 'my-dialog',
        disableClose: true,
      }
    );
    dialogRef.afterClosed().subscribe(rs => {
      this.getDataTicketExpireCause();
    });
  }

  editTicketExpireCause(row) {
    const dialogRef = this.matDialog.open(
      AddEditTicketExpireCauseComponent,
      {
        width: '1000px',
        panelClass: 'my-dialog',
        disableClose: true,
        data: row,
      }
    );
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        this.getDataTicketExpireCause();
      }
    });
  }

  deleteTicketExpireCause(row) {
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      width: '30%',
      data: {
        title: this.translateService.instant('common.confirm.title.delete'),
        message: this.translateService.instant('common.confirm.delete')
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._ticketService.deleteTicketExpireCause(row.ticketExpireCauseId).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.getDataTicketExpireCause();
            this.toastr.success(this.translateService.instant('common.notify.delete.success'));
          } else {
            this.toastr.error(res.mess.description);
          }
        }, err => {
          this.toastr.error(this.translateService.instant('common.500Error'));
        });
      }
    });
  }
}

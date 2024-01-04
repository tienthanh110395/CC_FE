import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Inject, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { CC_STATUS_REACT, HTTP_CODE, SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { EditAddTicketTypeComponent } from './edit-add-ticket-type/edit-add-ticket-type.component';
import { ViewTicketTypeComponent } from './view-ticket-type/view-ticket-type.component';

@Component({
  selector: 'app-ticket-type',
  templateUrl: './ticket-type.component.html',
  styleUrls: ['./ticket-type.component.scss']
})
export class TicketTypeComponent extends BaseComponent implements OnInit {
  @ViewChild('allTicketTypeLv1') private allTicketTypeLv1: MatOption;
  @ViewChild('allTicketTypeLv2') private allTicketTypeLv2: MatOption;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  ticketTypeLv1List = [];
  ticketTypeLv2List = [];
  ticketTypeLv3List = [];
  check = [];
  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _sharedDirectoryService: SharedDirectoryService,
    private _commonCCService: CommonCCService,
    private _ticketService: TicketService,
    private ngZone: NgZone,
    private matDialog: MatDialog,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<TicketTypeComponent>>,
  ) {
    super();
    this.formSearch = this.fb.group({
      detailPA: [],
      ticketTypeIdLv3: [],
      l1TicketTypeId: [],
      l2TicketTypeId: [],
      statusReac: [],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {
    this.getListTicketTypeLv1();
    this.buildColumn();
    this.getDataTicketType();
  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', width: '50px', sticky: true }, //STT
      { i18n: 'common.action', field: 'action', width: '120px', sticky: true, type: 'actionCustom' },//Tác động
      { i18n: 'ticket-extend.ticketId', field: 'name', width: '200px' }, //Tên phản ánh cấp 3
      { i18n: 'customer-care.search-cc.ticketCode', field: 'ticketTypeIdLv3', width: '80px' }, //Mã phản ánh cấp 3
      { i18n: 'customer-care.search-cc.ticketTypeLv1', field: 'groupPA', width: '200px' }, //Nhóm phản ánh
      { i18n: 'customer-care.search-cc.ticketTypeLv2', field: 'subgroupPA', width: '200px' }, //Thể loại
      { i18n: 'customer-care.search-cc.ticketTypeLv3', field: 'detailPA', width: '200px' }, //Loại phản ánh
      { i18n: 'ticket-extend.enter-content', field: 'ticketTemplate', width: '600px' }, //Mã nhập nội dung
      { i18n: 'customer-care.search-cc.ticketStatus', field: 'status', width: '60px' }, //Trạng thái phản ánh
    ];
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

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.label).join(', ');
    }
    return '';
  }

  handleChangeTicketTypeLv1() {
    this.formSearch.controls.l2TicketTypeId.setValue(null);
    this.ticketTypeLv2List = [];
    if (this.formSearch.controls.l1TicketTypeId.value?.length > 0) {
      this.getListTicketTypeLv2(this.formSearch.controls.l1TicketTypeId.value.filter(item => item !== -1).map(item => item.value).join(','));
    }
  }

  onChangeTicketTypeLv1One() {
    if (this.allTicketTypeLv1.selected) {
      this.allTicketTypeLv1.deselect();
    }
    if (this.formSearch.controls.l1TicketTypeId.value.length == this.ticketTypeLv1List.length) {
      this.allTicketTypeLv1.select();
    }
    this.handleChangeTicketTypeLv1();
  }

  onChangeTicketTypeLv1All() {
    if (this.allTicketTypeLv1.selected) {
      this.formSearch.controls.l1TicketTypeId.setValue([...this.ticketTypeLv1List, -1]);
    } else {
      this.formSearch.controls.l1TicketTypeId.setValue([]);
    }
    this.handleChangeTicketTypeLv1();
  }

  onChangeTicketTypeLv2One() {
    if (this.allTicketTypeLv2.selected) {
      this.allTicketTypeLv2.deselect();
    }
    if (this.formSearch.controls.l2TicketTypeId.value.length == this.ticketTypeLv2List.length) {
      this.allTicketTypeLv2.select();
    }
  }

  onChangeTicketTypeLv2All() {
    if (this.allTicketTypeLv2.selected) {
      this.formSearch.controls.l2TicketTypeId.setValue([...this.ticketTypeLv2List, -1]);
    } else {
      this.formSearch.controls.l2TicketTypeId.setValue([]);
    }
  }

  setValueToObject(searchObj: any) {
    searchObj.ticketTypeIdLv3 = searchObj.ticketTypeIdLv3 ? searchObj.ticketTypeIdLv3.trim() : null;
    searchObj.detailPA = searchObj.detailPA ? searchObj.detailPA.trim() : null;
    searchObj.l1TicketTypeIds = searchObj.l1TicketTypeId && Array.isArray(searchObj.l1TicketTypeId) ? searchObj.l1TicketTypeId.filter(item => item !== -1).map(item => item.value).join(',') : null;
    searchObj.l2TicketTypeIds = searchObj.l2TicketTypeId && Array.isArray(searchObj.l2TicketTypeId) ? searchObj.l2TicketTypeId.filter(item => item !== -1).map(item => item.value).join(',') : null;
    this.check = [];
    if (this.dataModel.effect) {
      this.check.push(CC_STATUS_REACT.EFFECT);
    }
    if (this.dataModel.expire) {
      this.check.push(CC_STATUS_REACT.EXPIRE);
    }
    searchObj.statusReac = this.check.join(',');
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item];
      }
    }
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getDataTicketType();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getDataTicketType();
  }

  getDataTicketType() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      const searchObj = Object.assign({}, this.formSearch.value);
      this.setValueToObject(searchObj);
      if (this.formSearch.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      delete searchObj.l1TicketTypeId;
      delete searchObj.l2TicketTypeId;
      this._ticketService.searchTicketType(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData.map(x => {
            x.status = x.status == 1 ? 'Đang hiệu lực' : x.status == 2 ? 'Hết hiệu lực' : '';
            return x;
          });
          this.totalRecord = rs.data.count;
          this.isLoading = false;
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, () => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    }
  }

  viewTicket(row) {
    const dialogRef = this.matDialog.open(
      ViewTicketTypeComponent,
      {
        width: '2500px',
        panelClass: 'my-dialog',
        disableClose: true,
        data: row,
      }
    );
    dialogRef.afterClosed().subscribe(rs => {
      if (row) {
        this.onSearch();
      } else {
        this.getDataTicketType();
      }
    });
  }

  performAddTicketType() {
    const dialogRef = this.matDialog.open(
      EditAddTicketTypeComponent,
      {
        width: '2500px',
        panelClass: 'my-dialog',
        disableClose: true,
      }
    );
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        this.onSearch();
      } else {
        this.getDataTicketType();
      }
    });
  }

  performEditTicketType(row) {
    const dialogRef = this.matDialog.open(
      EditAddTicketTypeComponent,
      {
        width: '2500px',
        panelClass: 'my-dialog',
        disableClose: true,
        data: row
      }
    );
    dialogRef.afterClosed().subscribe(rs => {
      if (row) {
        this.onSearch();
      } else {
        this.getDataTicketType();
      }
    });
  }

  deleteTicketType(row) {
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
        this._ticketService.deleteTicketType(row.ticketTypeId).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.getDataTicketType();
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

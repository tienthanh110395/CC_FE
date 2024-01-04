import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ACTION_TYPE, HTTP_CODE, STATUS_APPROVE } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { RejectTicketStatusComponent } from './reject-ticket-status/reject-ticket-status.component';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-approve-ticket',
  templateUrl: './approve-ticket.component.html',
  styleUrls: ['./approve-ticket.component.scss']
})
export class ApproveTicketComponent extends BaseComponent implements OnInit {
  approveExtentProcessForm: FormGroup;
  approveUserNameList = [];
  managerUserNameList = [];
  selection = new SelectionModel<any>(true, []);
  statusExtentList = [
    { value: STATUS_APPROVE.REJECT, label: this._translateService.instant('ticket-extend.refuse') },
    { value: STATUS_APPROVE.NOT_APPROVE, label: this._translateService.instant('ticket-extend.not-approve') },
    { value: STATUS_APPROVE.APPROVE, label: this._translateService.instant('ticket-extend.approve') },
  ];
  constructor(
    private fb: FormBuilder,
    private _ticketService: TicketService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private matDialog: MatDialog,
  ) {
    super();
  }

  ngOnInit() {
    this.buildExtentProcessForm();
    this.buildColumn();
    this.getDataApproveExtent();
    this.getApproveUserName();
    this.getManagerUserName();
  }

  getApproveUserName() {
    this._ticketService.getTicketSiteUser().subscribe(res => {
      this.approveUserNameList = res.data.listData.map(val => ({ label: val.staffName, value: val.userName }))
    })
  }

  getManagerUserName() {
    this._ticketService.getTicketSiteUser().subscribe(res => {
      this.managerUserNameList = res.data.listData.map(val => ({ label: val.staffName, value: val.userName }))
    })
  }

  buildExtentProcessForm() {
    this.approveExtentProcessForm = this.fb.group({
      startExtentDate: [],
      endExtentDate: [],
      ticketSearchList: [],
      status: [],
      approveUserName: [],
      managerUserName: [],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    })
  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', width: '30px', sticky: true }, //STT
      { i18n: 'common.action', field: 'action', type: 'actionCustom', width: '30px', sticky: true },
      { i18n: 'customer-care.search-cc.ticketCode', field: 'ticketId', width: '40px' }, //Mã phản ánh
      { i18n: 'contract.number', field: 'contractNo', width: '60px' }, //Số hợp đồng
      { i18n: 'customer-care.search-cc.ticketTypeLv1', field: 'groupPA', width: '200px' }, //Nhóm phản ánh
      { i18n: 'customer-care.search-cc.ticketTypeLv2', field: 'subgroupPA', width: '200px' }, //Thể loại
      { i18n: 'customer-care.search-cc.ticketTypeLv3', field: 'detailPA', width: '200px' }, //Loại phản ánh
      { i18n: 'customer-care.search-cc.slaDate', field: 'deadlineProcess', width: '100px' }, //Ngày hết hạn
      { i18n: 'ticket-extend.staff-extent', field: 'managerUserName', width: '60px' }, //Nhân viên xin gia hạn
      { i18n: 'customer-care.search-cc.assignUnit', field: 'siteName', width: '40px' }, //Đơn vị phối hợp
      { i18n: 'ticket-extend.extent-date', field: 'extentDate', width: '100px' }, //Ngày xin gia hạn
      { i18n: 'ticket-extend.request-extent-date', field: 'requestExtentDate', width: '100px' }, //Gia hạn đến ngày giờ
      { i18n: 'customer-care.search-cc.ticketContent', field: 'contentReceive', width: '400px' }, //Nội dung phản ánh
      { i18n: 'ticket-extend.extent-status', field: 'statusName', width: '60px' }, //Trạng thái phê duyệt gia hạn
      { i18n: 'ticket-extend.approve-reason', field: 'approveReason', width: '400px' }, //lý do từ chối
    ];
  }

  checkFormatDate(value: string): boolean {
    if (!value) return false;
    if (!(/^\d{2}\/\d{2}\/\d{4}$/.test(value))) return true;
    let parts = value.split("/");
    let day = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    let year = parseInt(parts[2]);
    if (day === NaN || month === NaN || year === NaN) return true;
    return false;
  }

  setValueToObject(searchObj: any) {
    searchObj.startExtentDate = searchObj.startExtentDate ? format(searchObj.startExtentDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.endExtentDate = searchObj.endExtentDate ? format(searchObj.endExtentDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    searchObj.ticketSearchList = searchObj.ticketSearchList ? searchObj.ticketSearchList.trim() : null;
    searchObj.status = searchObj.status ? searchObj.status : '';
    searchObj.approveUserName = this.approveExtentProcessForm.controls.approveUserName.value;
    searchObj.managerUserName = this.approveExtentProcessForm.controls.managerUserName.value;
    for (const item in searchObj) {
      if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
        delete searchObj[item];
      }
    }
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.approveExtentProcessForm.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.approveExtentProcessForm.controls.pagesize.setValue(event.pageSize);
    this.getDataApproveExtent();
  }

  onSearch() {
    this.pageIndex = 0;
    this.approveExtentProcessForm.controls.startrecord.setValue(0);
    this.getDataApproveExtent();
  }

  getDataApproveExtent() {
    if (this.approveExtentProcessForm.valid) {
      this.isLoading = true;
      const searchObj = Object.assign({}, this.approveExtentProcessForm.value);
      this.setValueToObject(searchObj);
      if (this.approveExtentProcessForm.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this._ticketService.searchTicketApprove(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData.map(x => {
            x.statusName = x.status == 0 ? 'Từ chối' : x.status == 1 ? 'Chưa duyệt' : x.status == 2 ? 'Phê duyệt' : '';
            return x
          });
          this.selection.clear();
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

  exportFile() {
    if (this.approveExtentProcessForm.valid) {
      const searchModelExcel = Object.assign({}, this.approveExtentProcessForm.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      this.setValueToObject(searchModelExcel);
      this._ticketService.exportExcelTicketExtent(searchModelExcel).subscribe(
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

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataModel.dataSource.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
    return numSelected === numRows;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  checkChange(row) {
    this.selection.toggle(row);
    row.selected = this.selection.isSelected(row);
  }

  approveTicket() {
    const body = {
      ticketIds: this.selection.selected.map(x => x.ticketId),
      actTypeId: ACTION_TYPE.TICKET_APPROVE_EXTENT_REQUEST,
      slaDate: this.selection.selected[0].requestExtentDate ? this.selection.selected[0].requestExtentDate : null,
    }
    this._ticketService.approveTicketStatus(body).subscribe(res => {
      if (res.mess.code == 1) {
        this._toastrService.success(this._translateService.instant('ticket-extend.approve-ticket-success'));
        this.getDataApproveExtent();
        this.selection.clear();
      } else {
        this._toastrService.error(res.mess.description);
      }
    })
  }

  rejectTicket(row) {
    const dialogRef = this.matDialog.open(
      RejectTicketStatusComponent,
      {
        width: '1000px',
        panelClass: 'my-dialog',
        disableClose: true,
        data: row,
      }
    );
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        this.getDataApproveExtent();
      }
    });
  }
}

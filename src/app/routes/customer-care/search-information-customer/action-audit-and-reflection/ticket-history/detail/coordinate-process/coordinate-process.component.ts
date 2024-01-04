import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { HTTP_CODE, TICKET_ASSIGN_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-coordinate-process',
  templateUrl: './coordinate-process.component.html',
  styleUrls: ['./coordinate-process.component.scss']
})
export class CoordinateProcessTabComponent extends BaseComponent implements OnInit {

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  formGroup: FormGroup;
  @Input() data: any;
  isFirstTime = true;
  ticketSiteLv1List = [];
  ticketSiteLv2List = [];
  listFile = [];

  constructor(private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private _commonCCService: CommonCCService,
    private ngZone: NgZone,
    public dialog?: MtxDialog) {
    super();
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit(): void {
    this.buildForm({});
    this.getListTicketSiteLv1();
    this.getTicketAssignInfo();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'customer-care.search-process.fileType', field: 'fileType' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
    this.formGroup.controls.ticketStatus.setValue('Tạo mới')
  }

  getListTicketSiteLv1() {
    if (AppStorage.get('list-ticket-site')) {
      this.ticketSiteLv1List = AppStorage.get('list-ticket-site').map(val => ({ value: val.siteId, label: val.siteName }));
    } else {
      this._commonCCService.getListTicketSite().subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketSiteLv1List = data.map(val => ({ value: val.siteId, label: val.siteName }));
      });
    }
  }

  getListTicketSiteLv2(parendId) {
    this._commonCCService.getListTicketSite(parendId).subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketSiteLv2List = data.map(val => ({ value: val.siteId, label: val.siteName }));
    });
  }

  getTicketAssignInfo() {
    this._ticketService.getTicketAssignInfo(this.data.ticketId).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        const data = rs.data || {};
        this.isFirstTime = false;
        this.buildForm(data);
      }
    })
  }

  showDataFormGroup(data: any) {
    if (data.ticketStatus == null) {
      this.formGroup.controls.toUsername.setValue('');
      this.formGroup.controls.contentProgress.setValue('');
    } else if (data.ticketStatus == 1) {
      this.formGroup.controls.toUsername.setValue(data.ticketAssignProcessEntitys.find(x => x.status == data.ticketStatus)?.staffName || '');
      this.formGroup.controls.contentProgress.setValue(data.ticketAssignProcessEntitys.find(x => x.status == data.ticketStatus)?.processResult || '');
    } else if (data.ticketStatus != 1) {
      this.formGroup.controls.toUsername.setValue(data.ticketAssignProcessEntitys.find(x => x.status == data.ticketStatus)?.staffName || '');
      this.formGroup.controls.contentProgress.setValue(data.ticketAssignProcessEntitys.find(x => x.status == data.ticketStatus)?.processResult || '');
    }
  }

  buildForm(data: any) {
    if (data.ticketAttachmentEntityList?.length > 0) {
      this.dataModel.dataSource = data.ticketAttachmentEntityList.filter(x => {
        x.fileType = x.type == 4 ? 'Yêu cầu phối hợp' : '' || x.type == 5 ? 'Kết quả xử lý của các đơn vị phối hợp' : '';
        return x;
      });
    }
    if (data.toSiteId) {
      this.getListTicketSiteLv2(data.toSiteId);
    }
    this.formGroup = this.fb.group({
      toSiteId: [data.toSiteId ? parseInt(data.toSiteId) : null],
      toSiteL2Id: [data.toSiteL2Id ? parseInt(data.toSiteL2Id) : null],
      slaDate: [data.slaDate],
      receiveUserName: [data.userProcess || ''],
      assignContent: [data.assignContent || ''],
      toUsername: [],
      ticketStatus: [data.ticketStatus == TICKET_ASSIGN_STATUS.NEW ? "Tạo mới" : data.ticketStatus == TICKET_ASSIGN_STATUS.CANCEL ? "Hủy xử lý" : data.ticketStatus == TICKET_ASSIGN_STATUS.CLOSE ? "Đóng xử lý" :
        data.ticketStatus == TICKET_ASSIGN_STATUS.RECEIVE ? "Đang xử lý" : data.ticketStatus == TICKET_ASSIGN_STATUS.REJECT ? "Từ chối" : data.ticketStatus == TICKET_ASSIGN_STATUS.COMPLETE ? "Hoàn thành xử lý"
          : data.ticketStatus == TICKET_ASSIGN_STATUS.CONCLUDE ? "Kết luận xử lý" : ""],
      contentProgress: [],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]],
    });
    this.showDataFormGroup(data);
  }

  onDownloadFile(item: any) {
    this._ticketService.downloadFileNew(item.attachmentId).subscribe(res => {
      saveAs(res.body, item.fileName);
    }, err => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

  onViewFile(item: any) {
    const extension = item.fileName.split('.').pop().toLowerCase();
    if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp', 'pdf'].includes(extension)) {
      this._ticketService.viewFileNew(item.attachmentId).subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          const fullBase64 = 'data:image/png;base64,' + res.data;
          if (extension === 'pdf') {
            this.dialog.originalOpen(ViewFilePdfComponent, {
              data: { fullBase64, documentName: item.fileName }
            });
          }
          if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp'].includes(extension)) {
            this.dialog.originalOpen(ViewFileImageComponent, {
              data: { fullBase64, documentName: item.fileName }
            });
          }
        } else {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        }
      }, err => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    } else {
      this.onDownloadFile(item);
    }
  }

}

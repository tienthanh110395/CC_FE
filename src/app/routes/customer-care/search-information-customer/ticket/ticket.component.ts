import { Component, Inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { StatisticComponent } from '../statistic/statistic.component';
import { ProcessTicketTabComponent } from './process/process.component';
import { ReceiveTicketTabComponent } from './receive/receive.component';
import { SearchTicketTabComponent } from './search/search.component';


@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent extends BaseComponent {

  tabIndex = 0;
  disabledTab = true;
  @Input() data: any = {};
  @ViewChild('receiveTab') receiveTab: ReceiveTicketTabComponent;
  @ViewChild('processTab') processTab: ProcessTicketTabComponent;
  @ViewChild('searchTab') searchTab: SearchTicketTabComponent;
  @ViewChild('statisticTab') statisticTab: StatisticComponent;

  constructor(protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,) {
    super();
  }

  onTabChange(event: any) {
    if (event.index === 2) {
      this.searchTab.onInit();
    }
  }

  handleChangeTabTicketProcess(data: any) {
    this.processTab.buildForm({});
    this.processTab.buildFormAdjustCharge({ ticketId: data.ticketId });
    this.processTab.buildFormDetail({ ticketId: data.ticketId });
    forkJoin([this._ticketService.getDetailProcess(data.ticketId),
    this._ticketService.getTicketAssignInfo(data.ticketId),
    this._ticketService.getAdjustChargeInfo(data.ticketId)]).subscribe(([detailProcess, assignInfo, chargeInfo]) => {
      this.processTab.buildForm(data);
      this.processTab.search(data);
      if (detailProcess.mess.code === HTTP_CODE.SUCCESS) {
        const dataDetailProcess = detailProcess.data.listData?.length > 0 ? detailProcess.data?.listData[0] : {};
        dataDetailProcess.phoneContact = data?.phoneContact;
        dataDetailProcess.deadlineProcess = data?.deadlineProcess;
        this.processTab.buildFormDetail(dataDetailProcess);
      } else {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      }
      this.processTab.buildFormCoordinate(Object.assign({}, data, assignInfo.data || { ticketAttachmentEntityList: [] }));
      this.processTab.buildFormAdjustCharge(Object.assign({}, data, chargeInfo.data || { ticketAttachmentEntityList: [] }));
      this.processTab.disableForm();
      this.tabIndex = 3;
      this.disabledTab = false;
    })
  }

}

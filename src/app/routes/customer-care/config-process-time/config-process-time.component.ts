import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ConfigProcessTimeService } from '@app/core/services/customer-care/config-process-time.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CC_PROCESS_TYPE, CC_TIME_TYPE } from '@app/shared/constant/common.constant';
import { IColumn } from '@app/shared/models/icolumn';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { concatMap, pluck, tap } from 'rxjs/operators';

@Component({
  selector: 'app-config-process-time',
  templateUrl: './config-process-time.component.html',
  styleUrls: ['./config-process-time.component.scss']
})
export class ConfigProcessTimeComponent extends BaseComponent implements OnInit, OnChanges {
  selectedNode: any = {};
  indexTab;
  dataSourceTree$ = new Observable();
  columns: IColumn[] = [];
  displayed = [];
  processTypeList = [
    { value: CC_PROCESS_TYPE.NO_TIME_DIE, label: this._translateService.instant('sla_config.noTimeDie') },
    { value: CC_PROCESS_TYPE.ROUNDING_24H, label: this._translateService.instant('sla_config.rounding24H') },
    { value: CC_PROCESS_TYPE.MINUS_TIME, label: this._translateService.instant('sla_config.minusTime') },
    { value: CC_PROCESS_TYPE.DIFFERENCE, label: this._translateService.instant('sla_config.difference') },
  ];
  timeTypeList = [
    { value: CC_TIME_TYPE.DAY, label: this._translateService.instant('sla_config.day') },
    { value: CC_TIME_TYPE.HOUR, label: this._translateService.instant('sla_config.hour') },
  ];
  checkDisable: boolean;
  hiddenIcon: boolean;
  disabledIcon = false;
  constructor(
    protected _translateService: TranslateService,
    private _configProcessTime: ConfigProcessTimeService,
  ) {
    super();
  }
  ngOnChanges(changes: SimpleChanges) {
    this.showDataSave();
  }

  ngOnInit() {
    this.getTicketSLA();

    this.columns = [
      { i18n: 'customer-care.search-cc.priority', field: 'priorityId', width: '100%' },
      { i18n: 'customer-care.search-cc.processTime', field: 'processTime' },
      { i18n: 'sla_config.comBineTimeL1', field: 'combineTimeL1' },
      { i18n: 'sla_config.comBineTimeL2', field: 'combineTimeL2' },
      { i18n: 'sla_config.manTimeSLA', field: 'manTimeSla' },
      { i18n: 'sla_config.addTimeSLA', field: 'isAddCombine', width: '100%' },
      { i18n: 'sla_config.processType', field: 'processType' },
      { i18n: 'common.action', field: 'action', width: '100%' },
    ];
    this.displayed = this.columns.map(x => x.field);
    super.mapColumn();
    this.showDataSave();
  }

  selectNode(event) {
    this.indexTab = event?.type;
    this.selectedNode = event;
    this.getDataTicketSla();
  }

  getTicketSLA() {
    this.dataSourceTree$ = this._configProcessTime.getTreeTicketData().pipe(pluck('data', 'listData'));
  }

  showDataSave() {
    this.checkDisable = true;
  }

  checkData() {
    this.checkDisable = false;
    this.disabledIcon = true
  }

  checkIcon() {
    this.disabledIcon = false;
    this.checkDisable = true;
  }

  getDataTicketSla() {
    this._configProcessTime.getDetailTicketSla(this.selectedNode?.ticketTypeId).subscribe(res => {
      this.dataModel.dataSource = res.data.listData.map(x => {
        x.priorityName = x.priorityId == 1 ? 'Bình thường' : x.priorityId == 2 ? 'HOT' : x.priorityId == 3 ? 'VIP' : '';
        return x;
      });
    })
  }
}

import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Inject, Input, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { TransferVehicleService } from '@app/core/services/support-after-sale/transfer-own-vehicle/transfer-vehicle.service';
import { HTTP_CODE, STATUS_RFID_VEHICLE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent extends BaseComponent implements OnInit {
  header;
  formTicketStatistic: FormGroup;
  ticketSourceList = [];
  ticketStatisticTypeLv1List = [];
  ticketStatisticTypeLv2List = [];
  ticketStatisticTypeLv3List = [];
  ticketStatisticTypeLv4List = [];
  ticketStatisticTypeLv5List = [];
  @Input() data: any = {};
  activeButtonPopup: boolean;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  states = [];
  filteredStates = this.states;
  selectedContract: any = {};
  isLoadingAuto: boolean;
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    private _commonCCService: CommonCCService,
    private _ticketService: TicketService,
    private _searchInfoService: SearchInformationCustomerService,
    private _transferVehicle: TransferVehicleService,
    private ngZone: NgZone,
    private actr: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<StatisticComponent>>,
  ) {
    super();
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {
    if (this.data[0]?.custId) {
      this.activeButtonPopup = false;
    } else {
      this.header = this.translateService.instant('reset-agency.enter_statistic');
      this.activeButtonPopup = true;
    }
    this.buildForm();
    this.getListTicketSource();
    this.getDataTicketStatisticTypeLv1();
    this.formTicketStatistic.controls.custReaction.valueChanges.subscribe(res => {
      this.formTicketStatistic.controls.custReactionRequired.setValue(res);
    })
    this.checkValidate();

    if (this.data[0]) {
      this.formTicketStatistic.get('contractNoUserName').valueChanges.pipe(debounceTime(1000), tap(() => { this.isLoadingAuto = true; this.filteredStates = []; })).subscribe(value => {
        if (typeof value !== 'object') {
          this._transferVehicle.searchContractInfo(value.trim()).subscribe(rs => {
            this.isLoadingAuto = false;
            this.filteredStates = rs.data.listData;
          });
        }
      });
    }
    this.actr.queryParams.subscribe(params => {
      this.formTicketStatistic.patchValue({
        callPhoneNumber: params.phone_number,
        sourceId: Number(params.ticket_source_id),
        contractNoUserName: params.contract_no_user_name,
      });
    });
  }

  buildForm() {
    this.formTicketStatistic = this.fb.group({
      contractNoUserName: [''],
      plateNumber: ['', [Validators.maxLength(16), Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]],
      systemPhoneNumber: [''],
      callPhoneNumber: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      sourceId: ['', Validators.required],
      l1StatisticTypeId: ['', Validators.required],
      l2StatisticTypeId: ['', Validators.required],
      l3StatisticTypeId: ['', Validators.required],
      l4StatisticTypeId: ['', Validators.required],
      l5StatisticTypeId: [''],
      statisticContent: ['', Validators.required],
      custReactionRequired: ['', Validators.required],
      custReaction: [''],
    })
  }

  checkValidate() {
    if (this.data[0]) {
      this.formTicketStatistic.controls.contractNoUserName.setValidators([Validators.required]);
      this.formTicketStatistic.controls.contractNoUserName.updateValueAndValidity();
      this.formTicketStatistic.controls.systemPhoneNumber.setValidators([Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]);
      this.formTicketStatistic.controls.systemPhoneNumber.updateValueAndValidity();
    } else {
      this.formTicketStatistic.controls.contractNoUserName.clearValidators();
      this.formTicketStatistic.controls.contractNoUserName.updateValueAndValidity();
      this.formTicketStatistic.controls.systemPhoneNumber.clearValidators();
      this.formTicketStatistic.controls.systemPhoneNumber.updateValueAndValidity();
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

  getDataTicketStatisticTypeLv1() {
    this._ticketService.getTicketStatisticType().subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketStatisticTypeLv1List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
    })
  }

  onChangeTicketStatisticTypeLv1(option) {
    this.formTicketStatistic.controls.l2StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l3StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l4StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l5StatisticTypeId.setValue(null);
    this.ticketStatisticTypeLv2List = [];
    this.ticketStatisticTypeLv3List = [];
    this.ticketStatisticTypeLv4List = [];
    this.ticketStatisticTypeLv5List = [];
    if (option) {
      this._ticketService.getTicketStatisticType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketStatisticTypeLv2List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
      })
    }
  }

  onChangeTicketStatisticTypeLv2(option) {
    this.formTicketStatistic.controls.l3StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l4StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l5StatisticTypeId.setValue(null);
    this.ticketStatisticTypeLv3List = [];
    this.ticketStatisticTypeLv4List = [];
    this.ticketStatisticTypeLv5List = [];
    if (option) {
      this._ticketService.getTicketStatisticType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketStatisticTypeLv3List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
      })
    }
  }

  onChangeTicketStatisticTypeLv3(option) {
    this.formTicketStatistic.controls.l4StatisticTypeId.setValue(null);
    this.formTicketStatistic.controls.l5StatisticTypeId.setValue(null);
    this.ticketStatisticTypeLv4List = [];
    this.ticketStatisticTypeLv5List = [];
    if (option) {
      this._ticketService.getTicketStatisticType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketStatisticTypeLv4List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
      })
    }
  }

  onChangeTicketStatisticTypeLv4(option) {
    this.formTicketStatistic.controls.l5StatisticTypeId.setValue(null);
    this.ticketStatisticTypeLv5List = [];
    if (option) {
      this._ticketService.getTicketStatisticType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketStatisticTypeLv5List = data.map(val => ({ label: val.name, status: val.status, value: val.statisticTypeId }));
      })
    }
  }

  addTicketStatistic() {
    const object = Object.assign({}, this.formTicketStatistic.value);
    object.contractNoUserName = this.formTicketStatistic.value.contractNoUserName ? this.formTicketStatistic.value.contractNoUserName.trim() : '';
    object.plateNumber = this.formTicketStatistic.value.plateNumber ? this.formTicketStatistic.value.plateNumber.trim() : '';
    object.systemPhoneNumber = this.formTicketStatistic.value.systemPhoneNumber ? this.formTicketStatistic.value.systemPhoneNumber.trim() : '';
    object.callPhoneNumber = this.formTicketStatistic.value.callPhoneNumber ? this.formTicketStatistic.value.callPhoneNumber.trim() : '';
    object.statisticContent = this.formTicketStatistic.value.statisticContent ? this.formTicketStatistic.value.statisticContent.trim() : '';
    object.custReaction = this.dataModel.custReaction;
    object.createUser = AppStorage.getUserLogin();
    this._ticketService.insertTicketStatistic(object).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.toastr.success(this.translateService.instant('common.notify.add.success'));
        this.formTicketStatistic.reset();
      } else {
        this.toastr.error(res.mess.description);
      }
    }, () => {
      this.toastr.error(this.translateService.instant('common.500Error'));
    });
  }

  onSelectedContract(event) {
    this.selectedContract = event.option.value;
    this.formTicketStatistic.controls.plateNumber.setValue(event.option.value.plateNumber);
    this.formTicketStatistic.controls.systemPhoneNumber.setValue(event.option.value.phoneNumber);
  }

  async filter(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filteredStates = [];
    const data = (await this._transferVehicle.searchContractInfo(value.trim()).toPromise()).data;
    if (data.listData.length > 0) {
      this.filteredStates = data.listData;
    }
    return this.filteredStates;
  }

  getOptionText(option) {
    if (option) {
      return option.contractNo;
    }
  }
}

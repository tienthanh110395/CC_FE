import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {AppStorage} from '@app/core/services/AppStorage';
import {
  ChangeInfoCustomerContractVehicle
} from '@app/core/services/support-after-sale/change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.service';
import {HTTP_CODE, STATUS_CONTRACT} from '@app/shared/constant/common.constant';
import {MtxDialog} from '@ng-matero/extensions';
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {FormlyFieldConfig} from "@ngx-formly/core";

@Component({
  selector: 'app-tab-contract-information',
  templateUrl: './tab-contract-information.component.html',
  styleUrls: ['./tab-contract-information.component.scss']
})
export class TabContractInformationComponent implements OnInit {
  createDateVm;
  custNameVm;
  phoneNumberVm;
  fieldVietMap: FormlyFieldConfig[] = [
    {
      type: 'flex-layout',
      fieldGroup: [
        {
          type: 'v-input',
          key: 'phoneNumber',
          templateOptions: {
            label: this._translate.instant('vietMap.vietMapTel'),
            flexOption: '33.33',
            disabled: true,
          },
        },
        {
          type: 'v-input',
          key: 'custName',
          templateOptions: {
            label: this._translate.instant('vietMap.vietMapCusName'),
            flexOption: '33.33',
            disabled: true,
          },
        },
        {
          type: 'v-input',
          key: 'createDate',
          templateOptions: {
            label: this._translate.instant('vietMap.dateTimeLink'),
            flexOption: '33.33',
            disabled: true,
          },
        },
      ],
    },
  ];
  vietMapConnect = 1;
  activeContract = true;
  @Input('contract') contract;
  @Input('resultSearch') resultSearch;
  @Input('balance') balance;
  @Output() profileStatusEvent = new EventEmitter<any>();
  formInfo: FormGroup;


  constructor(
    protected _translate: TranslateService,
    private _changeInfoCustomerContractVehicleService: ChangeInfoCustomerContractVehicle,
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.bindData();
    this.getVietMapDetails()
  }

  getVietMapDetails() {
    this._changeInfoCustomerContractVehicleService.getVietMapDetails(this.resultSearch[0].listContract[0].contractId).subscribe(res => {
      this.custNameVm = null;
      this.phoneNumberVm = null;
      this.createDateVm = null;
      this.vietMapConnect = 0;
      if(res.data && res.data.status) {
        if (res.data.status === 1) {
          this.vietMapConnect = res.data.status
          this.custNameVm = res.data.custName;
          this.phoneNumberVm = res.data.phoneNumber;
          this.createDateVm = res.data.createDate;
        }
      }
    });
  }

  buildForm() {
    this.formInfo = this.fb.group({
      contractNo: [''],
      status: [''],
      effDate: [''],
      expDate: [''],
      rankCustomer: [''],
      signName: [''],
      signDate: [''],
      documentNumber: [''],
      dateRange: [''],
      address: [''],
      noticeName: [''],
      noticePhoneNumber: [''],
      noticeEmail: [''],
      // accountType: [''],
      // bankName: [''],
      // accountNumber: [''],
      // accountOwner: [''],
      // balance: [''],
      // availableBalances: [''],

      methodRecharge: [''],
      accountBank: [''],
      accountNumber: [''],
      accountOwner: [''],
      isAuthorAccount: [''],
      accountBalance: [''],
      availableBalances: [''],

      goicuoc: [''],
      chuky: [''],
      receiveEmail: [''],
      receiveNotify: [''],
      receiveSMS: [''],
      smsRenew: [''],
      phoneNumber: [''],
      custName: [''],
      createDate: [''],
    })
  }

  bindData() {
    this.getDetail();
    this.getContractPayMent();
    this.getBalance();
  }

  async getDetail() {
    const res = (await this._changeInfoCustomerContractVehicleService.findOne(this.resultSearch[0].listContract[0].contractId, '/customers/contracts').toPromise());
    this.formInfo.patchValue({
      goicuoc: res.data.payCharge,
      chuky: res.data.billCycle,
    });
    if (res.mess.code == HTTP_CODE.SUCCESS) {
      this.resultSearch = res.data.listData[0];
      switch (this.resultSearch.status) {
        case STATUS_CONTRACT.CHUAHOATDONG:
          this.resultSearch.status = this._translate.instant('common.deadActive');
          break;
        case STATUS_CONTRACT.HOATDONG:
          this.resultSearch.status = this._translate.instant('common.active');
          break;
        case STATUS_CONTRACT.HUY:
          this.resultSearch.status = this._translate.instant('common.cancel');
          break;
        case STATUS_CONTRACT.CHAMDUT:
          this.resultSearch.status = this._translate.instant('common.deadActive')
          break;
        default:
          this.resultSearch.status = ''
          break;
      }
      this.formInfo.controls.chuky.setValue(this.resultSearch.billCycle);
      this.formInfo.controls.goicuoc.setValue(this.resultSearch.payCharge);
      this.formInfo.controls.receiveEmail.setValue(this.resultSearch.emailNotification == 1 ? true : false);
      this.formInfo.controls.receiveNotify.setValue(this.resultSearch.pushNotification == 1 ? true : false);
      this.formInfo.controls.receiveSMS.setValue(this.resultSearch.smsNotification == 1 ? true : false);
      this.formInfo.controls.smsRenew.setValue(this.resultSearch.smsRenew == 1 ? true : false);
    } else {
      this.toastr.error(this._translate.instant(res.mess.description));
    }
  }

  getContractPayMent() {
    this._changeInfoCustomerContractVehicleService.connectExistsViettelPay(this.resultSearch[0].listContract[0].contractId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        const dataContractPayment = res.data;
        this.resultSearch = Object.assign(this.resultSearch, dataContractPayment);
        this.resultSearch.methodRecharge = AppStorage.get('method-recharges').listData ? AppStorage.get('method-recharges').listData.find(x => x.id == this.resultSearch.methodRechargeId)?.name : '';
        this.resultSearch.accountBank = AppStorage.get('e-wallet').listData ? AppStorage.get('e-wallet').listData.find(x => x.id == this.resultSearch.accountBankId)?.name : '';
      }
    })
  }

  async getBalance() {
    const data = await this._changeInfoCustomerContractVehicleService.getBalance(this.resultSearch[0].listContract[0].custId, this.resultSearch[0].listContract[0].contractId).toPromise();
    if (data.mess.code == HTTP_CODE.SUCCESS) {
      this.resultSearch.balance = data.data.balance;
      this.profileStatusEvent.emit(data.data.profileStatus);
    }
  }
}

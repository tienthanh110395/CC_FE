import { Component, Input, OnInit } from '@angular/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { ChangeInfoCustomerContractVehicle } from '@app/core/services/support-after-sale/change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.service';
import { gender, HTTP_CODE } from '@app/shared/constant/common.constant';
import { BaseComponent } from '../base-component/base-component.component';

@Component({
  selector: 'info-contract-shared',
  templateUrl: './info-contract.component.html',
  styleUrls: ['./info-contract.component.scss']
})
export class InfoContractSharedComponent extends BaseComponent implements OnInit {
  @Input() data: any;

  constructor(
    private _searchInformationCustomerService: SearchInformationCustomerService,
    private _changeInfoCustomerContractVehicleService: ChangeInfoCustomerContractVehicle
  ) {
    super()
  }

  ngOnInit() {
    if (this.data) {
      this._searchInformationCustomerService.detailCustomer(this.data).subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel = res.data.listData[0]?.listContract[0] || {};
          this.dataModel.gender = this.dataModel.gender ? gender.find(x => x.code + '' === this.dataModel.gender + '')?.value : '';
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
    }
    this.bindData();
  }

  bindData() {
    this.getContractPayMent();
    this.getBalance();
  }

  getContractPayMent() {
    this._changeInfoCustomerContractVehicleService.connectExistsViettelPay(this.data.contractId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        const dataContractPayment = res.data;
        this.data = Object.assign(this.data, dataContractPayment);
        this.data.methodRecharge = AppStorage.get('method-recharges').listData ? AppStorage.get('method-recharges').listData.find(x => x.id == this.data.methodRechargeId)?.name : '';
        this.data.accountBank = AppStorage.get('e-wallet').listData ? AppStorage.get('e-wallet').listData.find(x => x.id == this.data.accountBankId)?.name : '';
      }
    })
  }

  async getBalance() {
    const data = await this._changeInfoCustomerContractVehicleService.getBalance(this.data.custId, this.data.contractId).toPromise();
    if (data.mess.code == HTTP_CODE.SUCCESS) {
      this.data.balance = data.data.balance;
    }
  }

}

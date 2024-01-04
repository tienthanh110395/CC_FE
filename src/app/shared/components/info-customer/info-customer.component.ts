import { Component, Input, OnInit } from '@angular/core';
import { BriefCaseService } from '@app/core/services/briefcase/brief-case.service';
import { gender, HTTP_CODE } from '@app/shared/constant/common.constant';
import { BaseComponent } from '../base-component/base-component.component';

@Component({
  selector: 'info-customer-shared',
  templateUrl: './info-customer.component.html',
  styleUrls: ['./info-customer.component.scss']
})
export class InfoCustomerSharedComponent extends BaseComponent implements OnInit {
  @Input() custId: number;
  constructor(private _briefCaseService: BriefCaseService) {
    super();
  }

  ngOnInit() {
    if (this.custId) {
      this._briefCaseService.findOne(this.custId, '/customers').subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel = res.data.listData[0] || {};
          this.dataModel.gender = this.dataModel.gender ? gender.find(x => x.code + '' === this.dataModel.gender + '')?.value : '';
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
    }
  }
}

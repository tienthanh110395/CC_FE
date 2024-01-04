import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent extends BaseComponent implements OnInit {
  @Input('vehicleId') vehicleId;
  @Input('contractId') contractId;
  @Input('plateNumber') plateNumber;
  @Input('listMedia') listMedia = [];

  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(translateService, dialog, toastr);
  }

  ngOnInit() {
    this.formSearch = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
  }

  onTabHistory(event) {
    this.dataModel.currentIndex = event.index;
    if (event.index === 1) {
      this.searchInformationCustomerService.getListVehicle(this.contractId).subscribe(res => {
        if (res.mess.code === 1) {
          this.listMedia = res.data.listData;
        }
      })
    }
  }
}

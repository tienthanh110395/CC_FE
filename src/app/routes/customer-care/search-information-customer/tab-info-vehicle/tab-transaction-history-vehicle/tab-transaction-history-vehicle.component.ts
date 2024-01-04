import { Component, Input, OnInit } from '@angular/core';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';

@Component({
  selector: 'app-tab-transaction-history-vehicle',
  templateUrl: './tab-transaction-history-vehicle.component.html',
  styleUrls: ['./tab-transaction-history-vehicle.component.scss']
})
export class TabTransactionHistoryVehicleComponent extends BaseComponent implements OnInit {
  @Input() vehicleId;
  @Input() contractId;
  @Input() plateNumber;
  @Input() listMedia = [];
  constructor(
    private searchInformationCustomerService: SearchInformationCustomerService,
  ) {
    super(searchInformationCustomerService);
  }

  ngOnInit() {
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

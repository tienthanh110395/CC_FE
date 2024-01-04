import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { ComponentType } from 'ngx-toastr';

@Component({
  selector: 'app-choose-contract',
  templateUrl: './choose-contract.component.html',
  styleUrls: ['./choose-contract.component.scss']
})
export class ChooseContractComponent extends BaseComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ComponentType<ChooseContractComponent> | TemplateRef<any>>,
    private searchInformationCustomerService: SearchInformationCustomerService,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any
  ) {
    super();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'contract.number', field: 'contractNo' },
      { i18n: 'contract.signDate', field: 'signDate' },
      { i18n: 'customer-care.search-information-customer.user_sign', field: 'signName' },
      { i18n: 'customer-care.search-information-customer.action', field: 'actionListContract', type: 'actionListContract' },
    ]
    this.searchInfo();
  }
  closePopup() {
    this.dialogRef.close(false);
  }
  choose(item) {
    this.dialogRef.close(item);
  }
  searchInfo() {
    this.searchInformationCustomerService.searchInfoCustomer(this.dataDialog).subscribe(res => {
      if (res.mess.code === 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count
      }
    })
  }
  getData() {
    this.dataDialog.startrecord = this.searchModel.startrecord;
    this.dataDialog.pagesize = this.searchModel.pagesize;
    this.searchInfo();
  }
}

import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { ComponentType } from 'ngx-toastr';
@Component({
  selector: 'app-choose-customer',
  templateUrl: './choose-customer.component.html',
  styleUrls: ['./choose-customer.component.scss']
})
export class ChooseCustomerComponent extends BaseComponent implements OnInit {
  constructor(
    private searchInformationCustomerService: SearchInformationCustomerService,
    public dialogRef: MatDialogRef<ComponentType<ChooseCustomerComponent> | TemplateRef<any>>,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any
  ) {
    super();
  }
  ngOnInit(): void {
    this.searchModel.startrecord = 0;
    if(this.dataDialog.body.phoneNumber || this.dataDialog.body.contractNo) {
      this.columns = [
        { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
        { i18n: 'support-after-sale.transfer-own-vehicle.customer-name', field: 'custName' },
        { i18n: 'contract.number', field: 'contractNo' },
        { i18n: 'support-after-sale.transfer-own-vehicle.phone', field: 'phoneNumber' },
        { i18n: 'contract.signDate', field: 'signDate' },
        { i18n: 'customer-care.search-information-customer.user_sign', field: 'signName' },
        { i18n: 'briefcase.briefcaseStatus', field: 'status' },
        { i18n: 'customer-care.search-information-customer.action', field: 'actionListContract', type: 'actionListContract', class: 'ui-text-center', width: '80px' }
      ];
    } else if (this.dataDialog.body.plateNumber) {
      this.columns = [
        { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
        { i18n: 'support-after-sale.transfer-own-vehicle.customer-name', field: 'custName' },
        { i18n: 'contract.number', field: 'contractNo' },
        { i18n: 'support-after-sale.transfer-own-vehicle.phone', field: 'phoneNumber' },
        { i18n: 'contract.signDate', field: 'signDate' },
        { i18n: 'customer-care.search-information-customer.user_sign', field: 'signName' },
        { i18n: 'briefcase.briefcaseStatus', field: 'status' },
        { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
        { i18n: 'customer-care.search-information-customer.vehicle_type', field: 'plateTypeCode' },
        { i18n: 'special-vehicle.activeStatus', field: 'activeStatus' },
        { i18n: 'customer-care.search-information-customer.action', field: 'actionListContract', type: 'actionListContract', class: 'ui-text-center', width: '80px' }
      ];
    }
    this.dataModel.dataSource = this.dataDialog.listData;
    this.totalRecord = this.dataDialog.count;
    this.getData();
  }

  getData() {
    this.dataDialog.body.startrecord = this.searchModel.startrecord;
    this.dataDialog.body.pagesize = this.searchModel.pagesize;
    this.searchModel = this.dataDialog.body;
    this.searchInformationCustomerService.searchInfoCustomer(this.searchModel).subscribe(res => {
      if (res.mess.code === 1) {
        this.dataModel.dataSource = res.data.listData.map(x => {
          x.status = x.status == 1 ? 'Chưa hoạt động' : x.status == 2 ? 'Hoạt động' : x.status == 3 ? 'Hủy' : x.status == 4 ? 'Chấm dứt' : '';
          x.activeStatus = x.activeStatus == 0 ? 'Chưa kích hoạt' : x.activeStatus == 1 ? 'Hoạt động' : x.activeStatus == 2 ? 'Hủy' :
          x.activeStatus == 3 ? 'Đóng' : x.activeStatus == 4 ? 'Mở' : x.activeStatus == 5 ? 'Đã chuyển nhượng' : '';
          x.plateTypeCode = x.plateTypeCode == 1 ? 'Biển trắng' : x.plateTypeCode == 2 ? 'Biển xanh' : x.plateTypeCode == 3 ? 'Biển đỏ' :
          x.plateTypeCode == 4 ? 'Biển ngoại giao' : x.plateTypeCode == 5 ? 'Biển nước ngoài' : x.plateTypeCode == 6 ? 'Biển vàng' : '';
          return x;
        });
        this.totalRecord = res.data.count;
      }
    });
  }
  closePopup() {
    this.dialogRef.close(false);
  }
  choose(item) {
    this.dialogRef.close(item);
  }
  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord =
      event.pageIndex == 0 ? event.pageIndex : event.pageIndex * event.pageSize;
    this.searchModel.pagesize = event.pageSize;
    this.getData();
  }
  getHeightTable(source) {
    if (source) {
      if (source.length > 10) {
        return '537px';
      } else {
        return 'fit-content';
      }
    }
  }

}

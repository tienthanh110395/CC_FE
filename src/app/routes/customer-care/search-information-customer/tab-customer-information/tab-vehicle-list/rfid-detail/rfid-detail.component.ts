import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { DmdcService } from '@app/core/services/dmdc/dmdc.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ComponentType, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-rfid-detail',
  templateUrl: './rfid-detail.component.html',
  styleUrls: ['./rfid-detail.component.scss']
})
export class RfidDetailComponent extends BaseComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ComponentType<RfidDetailComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private dmdcService: DmdcService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any
  ) {
    super()
  }
  costTypeList = [];
  arrStation = [];
  arrTicketType = [];
  ngOnInit(): void {
    this.formSearch = this.fb.group({
      stationType: ['', Validators.required],
      stageId: ['', Validators.required],
      servicePlanTypeId: ['', Validators.required],

    });
    this.getStationType();
    this.getStage();
    this.getTicketType();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'orderNumber' },
      { i18n: 'customer-care.search-information-customer.code_process', field: 'saleTransCode' },
      { i18n: 'vehicle.plateNumber', field: 'plateNumber' },
      { i18n: 'customer-care.search-information-customer.stage_station', field: 'station' },
      { i18n: 'Loại vé', field: 'servicePlanTypeName' },
      { i18n: 'Số tiền', field: 'price' },
      { i18n: 'Ngày mua', field: 'saleTransDate' },
      { i18n: 'Người mua', field: 'accountOwner' },
      { i18n: 'Từ ngày', field: 'effDate' },
      { i18n: 'Đến ngày', field: 'expDate' },
      { i18n: 'GHTD', field: 'efficiency' },
      { i18n: 'Hiệu lực', field: 'status' },

    ]
  }
  closePopup() {
    this.dialogRef.close(false);
  }
  choose(item) {
    console.log(item)
    this.dialogRef.close(item);
  }
  getStationType() {
    this.dmdcService.getStationType().subscribe(res => {
      if (res.mess.code === 1) {
        this.costTypeList = res.data;
        this.formSearch.controls['stationType'].setValue(this.costTypeList[0].code);
      }
    });
  }
  onchangeStationType(stationType) {
    if (stationType === '1') {

      this.dmdcService.getStationByStationType().subscribe(res => {
        if (res.mess.code === 1) {
          this.arrStation = res.data.listData;
        }
      });
    } else {
      this.getStage();
    }

  }
  getStage() {
    this.dmdcService.getStages().subscribe(res => {
      if (res.mess.code === 1) {
        this.arrStation = res.data.listData;
      }
    });
  }
  getTicketType() {
    this.dmdcService.getTicketType().subscribe(res => {
      if (res.mess.code === 1) {
        this.arrTicketType = res.data;
      }
    });
  }
  searchForm() {
    if (this.formSearch.valid) {
      let body = {};
      if (this.formSearch.value.stationType === '0') {
        body['stageId'] = this.formSearch.value.stageId
      } else {
        body['stationId'] = this.formSearch.value.stageId
        body['servicePlanTypeId'] = this.formSearch.value.servicePlanTypeId;
      }
      this.searchInformationCustomerService.searchTicketPurchaseHistoris(this.dataDialog, body).subscribe(res => {
        if (res.mess.code === 1) {
          this.dataModel.dataSource = res.data.listData;
          this.totalRecord = res.data.count;
        }
      });
    }
  }
}

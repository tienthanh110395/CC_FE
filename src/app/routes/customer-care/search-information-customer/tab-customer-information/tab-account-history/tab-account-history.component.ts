import { Component, OnInit,Input } from '@angular/core';
import { MtxDialog, MtxGridRowSelectionFormatter } from '@ng-matero/extensions';
import { FormBuilder } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
@Component({
  selector: 'app-tab-account-history',
  templateUrl: './tab-account-history.component.html',
  styleUrls: ['./tab-account-history.component.scss']
})
export class TabAccountHistoryComponent  extends BaseComponent implements OnInit {
  formSearchAccountHistory
  columns4
  constructor(
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) { 
    super(translateService, dialog,toastr)
  }

  ngOnInit(): void {
    this.formSearchAccountHistory = this.fb.group({
      startDate: [''],
      endDate: [''],
      typeAccount: ['']

    });
    this.columns4= [];
  }

}

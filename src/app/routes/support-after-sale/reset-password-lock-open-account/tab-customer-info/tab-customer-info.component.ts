import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { SearchInformationCustomerService } from '@app/core/services/customer-care/search-information-customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { gender, STATUS_CONTRACT } from '@app/shared/constant/common.constant';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LockAccComponent } from './lock-acc/lock-acc.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';

@Component({
  selector: 'app-tab-customer-info',
  templateUrl: './tab-customer-info.component.html',
  styleUrls: ['./tab-customer-info.component.scss']
})
export class TabCustomerInfoComponent extends BaseComponent implements OnInit {
  @Input('dataContract') resultSearch = [];
  @Input('balance') balance;
  username = AppStorage.getAccessToken().preferred_username;

  activeContract = true;
  @Input('contract') contract;
  inforForm: FormGroup;
  listOptionGender: SelectOptionModel[] = gender;
  @Input() dataContract: any;
  accountUserId;

  constructor(
    private fb: FormBuilder,
    public actr: ActivatedRoute,
    protected translateService: TranslateService,
    private searchInformationCustomerService: SearchInformationCustomerService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,

  ) {
    super(translateService, dialog, toastr);
  }

  listFileAttach = [];

  ngOnInit(): void {
    this.buildForm();
    this.pathValueForm(this.dataContract[0]);
  }

  buildForm() {
    this.inforForm = this.fb.group({
      customerType: [''],
      customerCode: [''],
      username: [''],
      fullName: [''],
      dateOfBirth: [null],
      gender: [''],
      contractNo: [''],
      status: [''],
      effDate: [''],
      expDate: [''],
      signName: [''],
      signDate: [''],
      classify: [''],
      documentNumber: [''],
      dateRange: [''],
      placeOfIssue: [''],
      address: [''],
      numberPhone: [''],
      email: [''],
    });
  }

  pathValueForm(formValue) {
    let statusContract: string = ''
    if (formValue.status == STATUS_CONTRACT.HOATDONG) {
      statusContract = "Hoạt động"
    } else if (formValue.status == STATUS_CONTRACT.CHUAHOATDONG) {
      statusContract = "Chưa hoạt động"
    } else if (formValue.status == STATUS_CONTRACT.CHAMDUT) {
      statusContract = "Chấm dứt"
    } else if (formValue.status == STATUS_CONTRACT.HUY) {
      statusContract = "Hủy"
    }
    this.inforForm.patchValue({
      customerType: formValue.custTypeName,
      customerCode: formValue.custId,
      username: formValue.listContract[0].createUser,
      fullName: formValue.custName,
      gender: formValue.gender ? 'Nam' : 'Nữ',
      dateOfBirth: formValue.birthDate,
      documentNumber: formValue.documentNumber,
      dateRange: formValue.dateOfIssue,
      placeOfIssue: formValue.placeOfIssue,
      address: formValue.areaName,
      numberPhone: formValue.phoneNumber,
      email: formValue.email,
      contractNo: formValue.listContract[0].contractNo,
      status: statusContract,
      effDate: formValue.listContract[0].effDate,
      expDate: formValue.listContract[0].expDate,
      classify: formValue.listContract[0].classify,
      signName: formValue.listContract[0].signName,
      signDate: formValue.listContract[0].signDate,
      accountUserId: formValue.listContract[0].accountUserId,
    })
  }

  resetPass() {
    const dialogRef = this.dialog.open(
      {
        width: '50%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: this.dataContract[0].listContract[0].accountUserId,
      },
      ResetPassComponent
    );
    dialogRef.afterClosed().subscribe(rs => {

    });
  }

  lockAcc() {
    const dialogRef = this.dialog.open(
      {
        width: '50%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: this.dataContract[0].listContract[0].accountUserId,
      },
      LockAccComponent
    );
    dialogRef.afterClosed().subscribe(rs => {

    });
  }

  onTabChanged(event) {
    if (event.index === 2) {
      this.searchInformationCustomerService.attachedFile('', null).subscribe(res => {
        if (res.mess.code === 1) {
          this.listFileAttach = res.data.listData;
        }
      })
    }
  }
}

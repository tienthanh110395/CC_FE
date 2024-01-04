import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { ResetPassLockOpenAgencyService } from '@app/core/services/support-after-sale/reset-password-lock-open-agency/reset-password-lock-open-agency.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LockAccountComponent } from './lock-account/lock-account.component';
import { ResetAccountComponent } from './reset-account/reset-account.component';
import { UnlockAccountComponent } from './unlock-account/unlock-account.component';

@Component({
  selector: 'app-reset-password-lock-open-agency',
  templateUrl: './reset-password-lock-open-agency.component.html',
  styleUrls: ['./reset-password-lock-open-agency.component.scss']
})
export class ResetPasswordLockOpenAgencyComponent extends BaseComponent implements OnInit {

  dataSource: MatTableDataSource<any>;
  keyword: String;
  isLock: false;

  constructor(
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private _resetPassLockOpenAgencyService: ResetPassLockOpenAgencyService,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
  ) {
    super(_resetPassLockOpenAgencyService, RESOURCE.CC, _toastrService, _translateService);
    this.searchModel.pageIndex = 1;
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer.fullName', field: 'fullName', type: 'fullName', class: 'ui-text-left' },
      { i18n: 'reset-agency.account', field: 'username' },
      { i18n: 'info.phoneNumber', field: 'phone_number_ctv', type: 'customPhoneCTV' },
      { i18n: 'search-bot.email', field: 'email' },
      { i18n: 'reset-agency.number-agency', field: 'shop_id', type: 'customShopId' },
      {
        i18n: 'common.action',
        field: 'actions',
        type: 'actions', class: 'ui-text-center'
      },
    ];
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this._resetPassLockOpenAgencyService.getListUser(this.searchModel.keyword, this.searchModel.pageIndex, this.searchModel.pagesize).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.isLoading = false;
        this.totalRecord = res.data.count;
        this.dataModel.dataSource = res.data.listData;
      }
    })
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.pageIndex = event.pageIndex + 1;
    this.searchModel.startrecord =
      event.pageIndex == 0 ? event.pageIndex : event.pageIndex * event.pageSize;
    this.searchModel.pagesize = event.pageSize;
    this.getData();
  }

  lockAccount(record) {
    const dialogRef = this.dialog.open(
      {
        width: '50%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: record
      },
      LockAccountComponent
    );
    dialogRef.afterClosed().subscribe(rs => {
      this.getData();
    });
  }

  unlockAccount(record) {
    const dialogRef = this.dialog.open(
      {
        width: '50%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: record
      },
      UnlockAccountComponent
    );
    dialogRef.afterClosed().subscribe(rs => {
      this.getData();
    });
  }

  resetAccount(record) {
    const dialogRef = this.dialog.open(
      {
        width: '50%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: record
      },
      ResetAccountComponent
    );
    dialogRef.afterClosed().subscribe(rs => {
      this.getData();
    });
  }
}

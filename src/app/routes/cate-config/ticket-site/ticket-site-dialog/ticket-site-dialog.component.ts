import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RESOURCE } from '@core';
import { TicketSiteService } from '@core/services/cate-config/ticket-site-service';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { HTTP_CODE } from '@shared';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import { CrmTableComponent } from '@shared/components/table-component/table-component.component';
import { ComponentType, ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-site-dialog',
  templateUrl: './ticket-site-dialog.component.html',
  styleUrls: ['./ticket-site-dialog.component.scss'],
})
export class TicketSiteDialogComponent extends BaseComponent implements OnInit {
  @ViewChild('userHandle') userHandle: CrmTableComponent;
  filteredUserName: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  form!: FormGroup;
  userForm!: FormGroup;
  title!: String;
  siteLv!: number;
  ticketSiteId!: number;
  isEdit = false;
  checkAll: any = false;
  dataSource: any = [];
  selectedUser: any = {};
  lstUser: any = [];
  displayedColumnsUser: string[] = ['orderNumber', 'action', 'userName', 'name', 'phone', 'mail'];
  selectedRow: any;
  onDestroy = new Subject<void>();
  lstUserHandle = [];
  status: number = 1;
  states = [];
  filterUserHandle = this.states;
  isLoadingAuto: boolean;
  isExits: boolean;
  saveTimeout: any;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<TicketSiteDialogComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    private ticketSiteService: TicketSiteService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
    protected toars?: ToastrService,
    protected translateService?: TranslateService,
  ) {
    super(ticketSiteService, RESOURCE.CC_SITE, toars, translateService);
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', width: '10px' },//STT
      { i18n: 'common.action', field: 'action', width: '5px' },//Tác động
      { i18n: 'cateConfig.ticketSite.userName', field: 'userName', width: '80px' },//Tên user
      { i18n: 'cateConfig.ticketSite.fullName', field: 'name', width: '80px' },//Họ và tên
      { i18n: 'cateConfig.ticketSite.phoneNumber', field: 'phone', width: '80px' },//Số điện thoại
      { i18n: 'cateConfig.ticketSite.mail', field: 'mail', width: '150px' },//Mail
    ];
    this.displayedColumnsUser = this.columns.map(x => x.field);
    this.buildForm();
    this.buildFormUser();
    this.title = this.dataInput.data['title'];
    this.ticketSiteId = this.dataInput['data']['data'] && this.dataInput['data']['data']['ticketSiteId'] ? this.dataInput['data']['data']['ticketSiteId'] : null;
    this.isEdit = true;

    if (this.ticketSiteId) {
      this.isEdit = false;
      this.getDataDetail(this.dataInput.data['data']['ticketSiteId']);
    }


    this.getAllUserOfGroupCC();

    this.userForm.get('keySearch').valueChanges.pipe(debounceTime(1000), tap(() => {
      this.isLoadingAuto = true;
      this.filterUserHandle = [];
    })).subscribe(value => {
      if (typeof value !== 'object') {
        this.filterUserName(value);
      }
    });
  }

  getAllUserOfGroupCC() {
    this.ticketSiteService.getAllUserByClientId().subscribe(rs => {
      this.isLoadingAuto = false;
      if (rs) {
        const data = JSON.parse(rs.data) ? JSON.parse(rs.data) : [];
        this.lstUser = data ? data.map(val => ({
          value: val.id,
          userName: val.username,
          mail: val.email ? val.email : null,
          name: (val.firstName ? val.firstName : null) + " " + (val.lastName ? val.lastName : null),
          phone: ((val.attributes || {}).phone_number_ctv || [])[0] || null,
        })) : null;

        this.filterUserName("");
      }
    });
  }

  buildForm() {
    this.form = this.fb.group({
      ticketSiteName: [null, [Validators.required, Validators.maxLength(255)]],//Tên đơn vị chịu trách nhiệm
      ticketSiteLv: [null, [Validators.required]],//Cấp đơn vị chịu trách nhiệm
      ticketSitePhoneNumber: [null, [Validators.required, Validators.maxLength(11), Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],//Số điện thoại đơn vị
      ticketSiteEmail: [null, [Validators.required, Validators.maxLength(50), Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT)]],//Email đơn vị
    });
  }

  buildFormUser() {
    this.userForm = this.fb.group({
      keySearch: [''],
    });
  }

  doClose() {
    this.dialogRef.close();
  }

  defaultDataDetail(ticketSite: any) {
    this.form['controls']['ticketSiteLv'].setValue(ticketSite.levelSite);
    this.form['controls']['ticketSiteName'].setValue(ticketSite.ticketSiteName);
    this.form['controls']['ticketSitePhoneNumber'].setValue(ticketSite.ticketSitePhoneNumber);
    this.form['controls']['ticketSiteEmail'].setValue(ticketSite.ticketSiteEmail);
    this.lstUserHandle = ticketSite.lstUserHandle;

    this.form['controls']['ticketSiteLv'].disable();
    this.form['controls']['ticketSiteName'].disable();
  }

  getDataDetail(ticketSiteId) {
    this.isLoading = true;
    this.ticketSiteService.getDataDetail(ticketSiteId).subscribe(rs => {
      this.isLoading = false;
      this.defaultDataDetail(rs['data']);
    });
  }

  doSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toars.warning(this.translateService.instant('cateConfig.ticketType.saveWarning'));
      return;
    }

    let params = this.form.getRawValue();
    params['ticketSiteId'] = this.ticketSiteId ? this.ticketSiteId : null;
    params['status'] = this.status;
    params['lstUserHandle'] = this.lstUserHandle;

    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.ticketSiteService.saveOrUpdate(params).subscribe(rs => {
        this.isLoading = false;
        if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
          params['ticketSiteId'] ? this.toars.success(this.translateService.instant('cateConfig.ticketSite.updateSuccess'))
            : this.toars.success(this.translateService.instant('cateConfig.ticketSite.createSuccess'));
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.doClose();
        } else if (rs.data === 1) {
          this.toars.warning(this.translateService.instant('cateConfig.ticketSite.createDuplicate'));
        } else {
          this.toars.warning(this.translateService.instant('cateConfig.ticketSite.createError'));
        }
      }, () => {
        this.isLoading = false;
        this.toars.error(this.translateService.instant('common.500Error'));
      });
      this.saveTimeout = null;
    }, 1000); // Delay of 1000 milliseconds
  }

  onSelectedUser(event) {
    this.selectedUser = event.option.value;
    this.isExits = false;
    this.ticketSiteService.getAllSiteUser().subscribe(rs => {
      this.isLoading = false;
      let allSiteUser = rs['data'];
      allSiteUser.forEach(item => {
        if (item.toLowerCase() === this.selectedUser['userName'].toLowerCase()) {
          this.toars.warning(this.translateService.instant('User đã được phân vào đơn vị khác'));
          this.isExits = true;
          return;
        }
      });
      if (this.isExits == false) {
        let userName = this.selectedUser;
        if (!this.lstUserHandle.filter(x => x.userName == this.selectedUser.userName).length) {
          this.lstUserHandle.push(userName);
        }
        this.userHandle.renderTable();
      }
    });
  }

  deleteUser(item: any) {
    this.lstUserHandle.splice(item, 1);
    this.userHandle.renderTable();
  }

  getLabelInList(list: any[]): string {
    if (list?.length > 0) {
      return list.filter(item => item !== -1).map(item => item.userName).join(', ');
    }
    return '';
  }

  filterUserName(value: any) {
    if (!this.lstUser) {
      return;
    }
    this.isLoadingAuto = false;
    // let search = this.userForm.get('keySearch').value;
    if (!value || value.trim() == '' || value.trim().length == 0) {
      this.filterUserHandle = this.lstUser;
      return;
    } else {
      value = value.toLowerCase();
    }
    this.filterUserHandle = this.lstUser.filter(s => s.userName.toLowerCase().indexOf(value) > -1);
  }

  getOptionText(option) {
    if (option) {
      return option.userName;
    }
  }

}






import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PreloaderService } from '@core';
import { TranslateService } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter, map } from 'rxjs/operators';
import { AppStorage } from './core/services/AppStorage';
import { IdleUserCheckService } from './core/services/idle-user-check.service';
import { CommonCRMService, SharedDirectoryService } from './shared';
import { CommonCCService } from './shared/services/common-cc.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(
    private preloader: PreloaderService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService,
    private _sharedDirectoryService: SharedDirectoryService,
    private _commonCrm: CommonCRMService,
    private _idleUserCheckService: IdleUserCheckService,
    private _oauthService: OAuthService,
    private _commonCCService: CommonCCService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child) {
          if (child.firstChild) {
            child = child.firstChild;
          } else if (child.snapshot.data && child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          } else {
            return null;
          }
        }
        return null;
      })
    ).subscribe((data: any) => {
      if (data) {
        this.titleService.setTitle(this.translateService.instant(data));
      }
    });
    this.matIconRegistry.addSvgIcon('ic_arrow_select', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_arrow_select.svg'));
    this.matIconRegistry.addSvgIcon('ic_Calendar', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_Calendar.svg'));
    this.matIconRegistry.addSvgIcon('ic_CapNhatTrangThaiThe', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_CapNhatTrangThaiThe.svg'));
    this.matIconRegistry.addSvgIcon('ic_Change', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_Change.svg'));
    this.matIconRegistry.addSvgIcon('ic_checkbox', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_checkbox.svg'));
    this.matIconRegistry.addSvgIcon('ic_Delete', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_Delete.svg'));
    this.matIconRegistry.addSvgIcon('ic_download', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_download.svg'));
    this.matIconRegistry.addSvgIcon('ic_dropdown', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_dropdown.svg'));
    this.matIconRegistry.addSvgIcon('ic_Duyet', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_Duyet.svg'));
    this.matIconRegistry.addSvgIcon('ic_edit', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_edit.svg'));
    this.matIconRegistry.addSvgIcon('ic_Lock', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_Lock.svg'));
    this.matIconRegistry.addSvgIcon('ic_menu', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_menu.svg'));
    this.matIconRegistry.addSvgIcon('ic_minus', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_minus.svg'));
    this.matIconRegistry.addSvgIcon('ic_next', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_next.svg'));
    this.matIconRegistry.addSvgIcon('ic_plus', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_plus.svg'));
    this.matIconRegistry.addSvgIcon('ic_QlyChinhSachGia', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_QlyChinhSachGia.svg'));
    this.matIconRegistry.addSvgIcon('ic_QlyDanhMuc', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_QlyDanhMuc.svg'));
    this.matIconRegistry.addSvgIcon('ic_QlyHopDong', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_QlyHopDong.svg'));
    this.matIconRegistry.addSvgIcon('ic_QlyHoSo', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_QlyHoSo.svg'));
    this.matIconRegistry.addSvgIcon('ic_QlyKhachHang', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_QlyKhachHang.svg'));
    this.matIconRegistry.addSvgIcon('ic_QlyPhuongTienDacBiet', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_QlyPhuongTienDacBiet.svg'));
    this.matIconRegistry.addSvgIcon('ic_radiobutton', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_radiobutton.svg'));
    this.matIconRegistry.addSvgIcon('ic_radiobutton_Select', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_radiobutton_Select.svg'));
    this.matIconRegistry.addSvgIcon('ic_settings', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_settings.svg'));
    this.matIconRegistry.addSvgIcon('ic_themphuluc', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_themphuluc.svg'));
    this.matIconRegistry.addSvgIcon('ic_uncheck', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_uncheck.svg'));
    this.matIconRegistry.addSvgIcon('ic_unlink', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_unlink.svg'));
    this.matIconRegistry.addSvgIcon('ic_user', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_user.svg'));
    this.matIconRegistry.addSvgIcon('ic_xem', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_xem.svg'));
    this.matIconRegistry.addSvgIcon('ic_link', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_link.svg'));
    this.matIconRegistry.addSvgIcon('ic_file', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_file.svg'));
    this.matIconRegistry.addSvgIcon('ic_unLock', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_unLock.svg'));
    this.matIconRegistry.addSvgIcon('ic_TiengAnh', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_TiengAnh.svg'));
    this.matIconRegistry.addSvgIcon('ic_TiengViet', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_TiengViet.svg'));
    this.matIconRegistry.addSvgIcon('ic_QuanlyPhuongTienDB', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_QuanlyPhuongTienDB.svg'));
    this.matIconRegistry.addSvgIcon('ic_quanlyDanhMuc', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_quanlyDanhMuc.svg'));
    this.matIconRegistry.addSvgIcon('ic_ChinhSach-GiaGoi', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_ChinhSach-GiaGoi.svg'));
    this.matIconRegistry.addSvgIcon('ic_TracuuThongTin', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_TracuuThongTin.svg'));
    this.matIconRegistry.addSvgIcon('ic_DangKyDichVu', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ic_DangKyDichVu.svg'));
    this.matIconRegistry.addSvgIcon('next_step', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/next_step.svg'));

  }

  ngOnInit() {
    this.getUserInfo();
    this.getListCustomerType();
    this.getListProvince();
    this.getListTicketTypeLv1();
    this.getListTicketSource();
    this.getListTicketSiteLv1();
    this.getActTypeList();
    this.getVehicleGroup();
    this.getVehicleType();
    this.getStations();
    this.getStagesCRM();
    this.getTicketType();
    this.getAllMethodCharges();
    this.getVehicleType();
    this.getPlateType();
    this.getVehicleColor();
    this.getListVehicleLabel();
    this.getListVehicleBrands();
    this.getMethodRecharges();
    this.getEwallet();
    this.getListCity();
    /**
     * Bắt đầu tính thời gian
     */
    this.initTimer();
  }
  initTimer() {
    // thời gian rảnh: 60 phút
    this._idleUserCheckService.USER_IDLE_TIMER_VALUE_IN_MIN = 60;
    this._idleUserCheckService.initilizeSessionTimeout();
    this._idleUserCheckService.userIdlenessChecker.subscribe((status: string) => {
      this.initiateFirstTimer(status);
    });
  }
  initiateFirstTimer = (status: string) => {
    switch (status) {
      case 'INITIATE_TIMER':
        break;
      case 'RESET_TIMER':
        break;
      case 'STOPPED_TIMER':
        IdleUserCheckService.runTimer = false;
        this._oauthService.logOut();
        break;

      default:
        break;
    }
  }
  ngAfterViewInit() {
    this.preloader.hide();
  }

  getStations() {
    if (!AppStorage.get('stations')) {
      this._sharedDirectoryService.getStationsOpens().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('stations', rs.data.listData);
        }
      })
    }
  }

  getStagesCRM() {
    if (!AppStorage.get('stages')) {
      this._sharedDirectoryService.getStagesCRM().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('stages', rs.data.listData);
        }
      })
    }
  }

  getTicketType() {
    if (!AppStorage.get('ticket')) {
      this._commonCrm.getTicketPriceTypes().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('ticket', rs.data.listData);
        }
      })
    }
  }

  getAllMethodCharges() {
    if (!AppStorage.get('methodCharge')) {
      this._sharedDirectoryService.getAllMethodCharges().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('methodCharge', rs.data);
        }
      })
    }
  }

  getMethodRecharges() {
    if (!AppStorage.get('method-recharges')) {
      this._sharedDirectoryService.getCategories('METHOD_RECHARGE').subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('method-recharges', rs.data);
        }
      });
    }
  }

  getEwallet() {
    if (!AppStorage.get('e-wallet')) {
      this._sharedDirectoryService.getCategories('E_WALLET').subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('e-wallet', rs.data);
        }
      });
    }
  }

  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      if (res.mess.code === 1) {
        AppStorage.set('list-cust-type', res.data);
      }
    });
  }

  getListProvince() {
    this._sharedDirectoryService.getListAreas().subscribe(res => {
      if (res.mess.code === 1) {
        AppStorage.set('list-province', res.data);
      }
    });
  }

  getListTicketTypeLv1() {
    this._commonCCService.getListTicketType().subscribe(res => {
      if (res.mess.code === 1) {
        AppStorage.set('list-ticket-type', res.data?.listData);
      }
    });
  }

  getListTicketSource() {
    this._commonCCService.getListTicketSource().subscribe(res => {
      if (res.mess.code === 1) {
        AppStorage.set('list-ticket-source', res.data?.listData);
      }
    });
  }

  getListTicketSiteLv1() {
    this._commonCCService.getListTicketSite().subscribe(res => {
      if (res.mess.code === 1) {
        AppStorage.set('list-ticket-site', res.data?.listData || []);
      }
    });
  }

  getActTypeList() {
    this._commonCrm.searchActType().subscribe(res => {
      if (res.mess.code === 1) {
        AppStorage.set('list-act-type', res.data?.listData || []);
      }
    });
  }

  getUserInfo() {
    this._commonCCService.getUserInfo({ userName: AppStorage.getUserLogin() }).subscribe(res => {
      if (res.mess.code === 1) {
        AppStorage.set('user-info', res.data || {});
      }
    });
  }

  getVehicleGroup() {
    if (!AppStorage.get('vehicle-group')) {
      this._sharedDirectoryService.getListVehicleFee().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('vehicle-group', rs.data?.listData);
        }
      })
    }
  }

  getPlateType() {
    if (!AppStorage.get('plate-types')) {
      this._sharedDirectoryService.getListVehiclePlateTypes().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('plate-types', rs.data);
        }
      })
    }
  }

  getVehicleType() {
    if (!AppStorage.get('vehicle-type')) {
      this._sharedDirectoryService.getListVehicleType().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('vehicle-type', rs.data?.listData);
        }
      })
    }
  }

  getVehicleColor() {
    if (!AppStorage.get('vehicle-color')) {
      this._sharedDirectoryService.getListVehicleColours().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('vehicle-color', rs.data);
        }
      })
    }
  }

  getListVehicleLabel() {
    if (!AppStorage.get('vehicle-mark')) {
      this._sharedDirectoryService.getListVehicleLabel().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('vehicle-mark', rs.data);
        }
      })
    }
  }
  getListVehicleBrands() {
    if (!AppStorage.get('vehicle-brands')) {
      this._sharedDirectoryService.getListVehicleBrands().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('vehicle-brands', rs.data);
        }
      })
    }
  }
  getListCity() {
    if (!AppStorage.get('list-city')) {
      this._sharedDirectoryService.getListAreas().subscribe(rs => {
        if (rs.mess.code == 1) {
          AppStorage.set('list-city', rs.data);
        }
      });
    }
  }
}

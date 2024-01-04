import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonIMService } from '@app/shared/services/common-im.service';
import { LocationAgencyComponent } from './location-agency/location-agency.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-search-agency',
  templateUrl: './search-agency.component.html',
  styleUrls: ['./search-agency.component.scss']
})
export class SearchAgencyComponent extends BaseComponent implements OnInit {

  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  searchModelExcel: any = {};

  constructor(
    public actr: ActivatedRoute,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    private _sharedDirectoryService?: SharedDirectoryService,
    protected _commonIMService?: CommonIMService
  ) {
    super(_commonIMService, RESOURCE.CC_CUSTOMER, toastr, translateService);
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'search-agency.agencyName', field: 'name' },
      { i18n: 'search-agency.address', field: 'address' },
      { i18n: 'search-agency.numberPhone', field: 'tel' },
      { i18n: 'search-agency.location', field: 'location' }
    ];
    super.mapColumn();
    this.getListCity();
    this.searchAgency();
  }
  getListCity() {
    this._sharedDirectoryService.getListAreas().subscribe(res => {
      this.listOptionCity = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        }
      })
    })
  }
  getListDistrict() {
    if (this.searchModel.province) {
      this._sharedDirectoryService.getListAreas(this.searchModel.province).subscribe(res => {
        this.listOptionDistrict = res.data.map(val => {
          return {
            code: val.districtShop,
            value: val.name
          }
        })
      })
    }
  }
  onCityChange() {
    if (this.searchModel.province) {
      this.getListDistrict();
    } else {
      this.listOptionDistrict = [] as SelectOptionModel[];
      delete this.searchModel.district;
    }
  }

  searchAgency(isViewPage?: boolean) {
    if (!isViewPage) {
      this.searchModel.startrecord = 0;
      this.pageIndex = 0;
    }
    this.isLoading = true;
    this.handleSearchModelTrim();
    this._commonIMService.getListShops(this.searchModel).subscribe(res => {
      if (res.mess.code == 1) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
      this.isLoading = false;
    })
  }
  exportFile() {
    this.handleSearchModelTrim();
    this.searchModelExcel = Object.assign({}, this.searchModel);
    delete this.searchModelExcel.startrecord;
    delete this.searchModelExcel.pagesize;
    this._commonIMService.exportListShops(this.searchModelExcel).subscribe(
      res => {
        if (res) {
          const contentDisposition = res.headers.get('content-disposition');
          const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
          saveAs(res.body, filename);
        }
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }

  viewLocation(record?) {
    this.dialog.open({
      width: '1000px',
      data: { record },
    }, LocationAgencyComponent);
  }

  onPageChangeSearchAgent(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.searchAgency(true);
  }

  handleSearchModelTrim() {

    if (!this.searchModel.province) {
      delete this.searchModel.province;
    }

    if (!this.searchModel.district) {
      delete this.searchModel.district;
    }

    if (!this.searchModel.name) {
      delete this.searchModel.name;
    } else {
      this.searchModel.name = this.searchModel.name.trim();
    }
  }
}


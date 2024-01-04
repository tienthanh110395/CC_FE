import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { HTTP_CODE, SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonIMService } from '@app/shared/services/common-im.service';
import { SearchBotService } from '../../../core/services/customer-care/search-bot.service';
import { saveAs } from 'file-saver';
import { PriceListComponent } from './price-list/price-list.component';

@Component({
  selector: 'app-search-bot',
  templateUrl: './search-bot.component.html',
  styleUrls: ['./search-bot.component.scss']
})
export class SearchBotComponent extends BaseComponent implements OnInit {

  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listBot = [];
  listStation = [];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  searchModelExcel: any = {};

  constructor(
    public actr: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    public dialog?: MtxDialog,
    private _sharedDirectoryService?: SharedDirectoryService,
    protected _commonIMService?: CommonIMService,
    private _searchBotService?: SearchBotService
  ) {
    super(_commonIMService, RESOURCE.CC_CUSTOMER, _toastrService, _translateService);
  }

  ngOnInit() {
    this.getListBot();
    this.getListStation();
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'search-bot.city', field: 'city' },
      { i18n: 'search-bot.district', field: 'district' },
      { i18n: 'search-bot.stationName', field: 'name' },
      { i18n: 'search-bot.stationCode', field: 'code' },
      { i18n: 'search-bot.address', field: 'address_detail' },
      { i18n: 'search-bot.headStationName', field: 'stationHeadName' },
      { i18n: 'search-bot.phoneNumber', field: 'stationHeadPhone' },
      { i18n: 'search-bot.email', field: 'stationHeadEmail' },
      { i18n: 'search-bot.priceTable', field: 'price' },
      { i18n: 'search-bot.note', field: 'description' },
    ];
    super.mapColumn();
    this.searchBot();
  }

  getListBot() {
    this._sharedDirectoryService.getListBots().subscribe(res => {
      if (res.mess.code == 1) {
        this.listBot = res.data?.listData.map(item => ({ value: item.id, label: item.name })) || [];
      }
    });
  }

  getListStation() {
    this._sharedDirectoryService.getStationsActive().subscribe(res => {
      if (res.mess.code == 1) {
        this.listStation = res.data?.listData.map(item => ({ value: item.code, label: item.name })) || [];
      }
    });
  }

  searchBot(isViewPage?: boolean) {
    if (!isViewPage) {
      this.searchModel.startrecord = 0;
      this.pageIndex = 0;
    }
    this.isLoading = true;
    this._sharedDirectoryService.getStationsActive(this.searchModel).subscribe(res => {
      if (res.mess.code == 1) {
        this.totalRecord = res.data.count;
        this.dataModel.dataSource = res.data.listData;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
      this.isLoading = false;
    });
  }

  exportFile() {
    this.searchModelExcel = Object.assign({}, this.searchModel);
    delete this.searchModelExcel.startrecord;
    delete this.searchModelExcel.pagesize;
    this._sharedDirectoryService.exportListBots(this.searchModelExcel).subscribe(
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

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.searchBot(true);
  }

  viewPrice(item) {
    this._searchBotService.getPriceList({ stationId: item.id }).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        const dialogRef = this.dialog.originalOpen(PriceListComponent, {
          width: '80%',
          data: res.data,
          disableClose: true
        });
      }
    }, err => {
      this._toastrService.error(this._translateService.instant('common.500Error'));
    });
  }

}


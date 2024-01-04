import { Component, OnInit } from '@angular/core';
import { NotifyConfigService } from '@app/core/services/notify-config/notify-config.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notify-config',
  templateUrl: './notify-config.component.html',
  styleUrls: ['./notify-config.component.scss']
})
export class NotifyConfigComponent extends BaseComponent implements OnInit {

  isLoading: boolean = false;


  notifiType: any = [{ name: "Cảnh báo tiến độ phối hợp ", value: 1 }, { name: "Cảnh báo Yêu cầu điều chỉnh cước ", value: 2 }]
  lstData: any = [];
  displayedColumns: any = [];
  configType: number = 1;

  constructor(
    private notifyConfigService: NotifyConfigService,
    protected toars?: ToastrService,
    protected translateService?: TranslateService,
  ) { super(null, null); }

  ngOnInit(): void {
    this.buildColumn();
    this.onTypeChange(this.configType);
  }

  buildColumn() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'stt' },
      { i18n: 'notify-config.name', field: 'name' },
      { i18n: 'notify-config.email', field: 'isMail' },
      { i18n: 'notify-config.sms', field: 'isSms' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  onTypeChange(data: any) {
    this.notifyConfigService.getNotificationConfigByType(data).subscribe(rs => {
      console.log("DATA_CONFIG", rs);
      this.lstData = rs["data"];
    })
  }

  doChangeRow(item: any, itemValue: number, type: number) {
    if (type == 1) {
      //email
      item["isMail"] = itemValue;
    } else {
      //sms
      item["isSms"] = itemValue;
    }
  }

  doSave() {
    this.isLoading = true;
    this.notifyConfigService.saveNotifyConfig(this.lstData).subscribe(rs => {
      this.isLoading = false;

      if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data !== false) {
        this.toars.success(this.translateService.instant('notify-config.updateSuccess'));
      } else {
        this.toars.error(this.translateService.instant('notify-config.updateError'));
      }
    },
      () => {
        this.isLoading = false;
        this.toars.error(this.translateService.instant('common.500Error'));
      },
    );

  }

}

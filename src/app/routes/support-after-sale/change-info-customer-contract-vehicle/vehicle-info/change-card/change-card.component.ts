import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AppStorage } from '@app/core/services/AppStorage';
import { ChangeInfoCustomerContractVehicle } from '@app/core/services/support-after-sale/change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { ACTION_TYPE, HTTP_CODE } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-change-card',
  templateUrl: './change-card.component.html',
  styleUrls: ['./change-card.component.scss']
})
export class ChangeCardComponent extends BaseComponent implements OnInit {

  formChangeCard: FormGroup;
  isLoadingStaff = false;
  listStaff = [];
  listDocument = [];
  @ViewChild('tableFee') tableFee: MatTable<any>;
  @ViewChild('crmtable') crmTable: CrmTableComponent;
  isLoadingProfile: boolean;
  columnProfiles = [];
  totalCost = 0;
  dataReasonType = [];
  listFile = new MatTableDataSource<any>();
  listFormatFile = ['.jpg', '.png', '.tiff', '.bmp', '.jpeg', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  displayedColumnsFee = [];
  columns = [];
  displayedColumns = [];

  constructor(
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    protected _translate: TranslateService,
    private _toastrService: ToastrService,
    private _commonCRMService: CommonCRMService,
    private _changeInfoCustomerContractVehicle: ChangeInfoCustomerContractVehicle,
  ) {
    super();
    this.dataModel.dataSourceProfile = [];
    this.dataModel.isLoginToken = AppStorage.getLoginByToken();
  }

  ngOnInit() {
    this.bindDataFee();

    this.formChangeCard = this.fb.group({
      rfidSerial: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9]+$')]],
      staff: ['', Validators.required],
      dateChange: [format(new Date(), COMMOM_CONFIG.DATE_FORMAT)],
      documentType: [''],
      reason: ['', Validators.required],
      payMoney: ['', Validators.required]
    })

    this.columnProfiles = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.updateProfileTable.documentType', field: 'documentTypeName' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'actions', type: 'custom' },
    ];

    this.displayedColumnsFee = ['fee', 'price'];

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-care.search-process.fileName', field: 'fileName' },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumns = this.columns.map(x => x.field);

    this.formChangeCard.get('staff').valueChanges.pipe(debounceTime(1000), tap(x => {
      this.isLoadingStaff = true;
      this.listStaff = [];
    }),
      switchMap(value =>
        iif(() => typeof value !== 'object' && value && value !== '', this._changeInfoCustomerContractVehicle.getMember(value)).pipe(finalize(() => (this.isLoadingStaff = false)))
      ),
      takeUntil(this.subDestroy$)
    ).subscribe(rs => {
      if (rs.mess.code == 1) {
        this.listStaff = [];
        this.listStaff.push(rs.data);
        if (rs.data) {
          this.formChangeCard.controls.staff.setValue(rs.data);
        }
      } else {
        this.formChangeCard.controls.staff.setErrors({ 'required': true });
      }
    });
    this.getListDocumentType();
    if (this.dataModel.isLoginToken) {
      this.formChangeCard.controls.staff.setValue({ username: AppStorage.getUserLogin() });
    }
  }

  displayFnStaff(s: any) {
    if (s) {
      return s?.username;
    }
  }

  getListDocumentType() {
    this._changeInfoCustomerContractVehicle.getDocumentByActionandStatus(ACTION_TYPE.CHUYENTHE, 1).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.listDocument = res.data.listData;
      }
    });
  }

  async bindDataFee() {
    await this.getReason();
    await this.getFees();
  }

  async getReason() {
    const res = await (this._commonCRMService.getReason(ACTION_TYPE.CHUYENTHE).toPromise());
    this.dataReasonType = res.data;
    this.formChangeCard.controls.reason.setValue(this.dataReasonType[0]?.id);
  }

  async getFees() {
    if (this.formChangeCard.get('reason').value) {
      const res = await (this._commonCRMService.getFeesReason(this.formChangeCard.controls.reason.value).toPromise());
      const feeType = {
        fee: this._translate.instant('support-after-sale.transfer-own-vehicle.fee_change_title'),
        price: res.data?.fee ?? 0,
      };
      this.totalCost = res.data.fee;
      this.dataModel.dataSourceFee = [...[feeType]];
    }
  }

  chooseFileChange(chooseFiles) {
    const listFile = chooseFiles.target.files;
    let i = 0;

    for (i; i < listFile.length; i++) {
      const lastIndexFile = listFile[i].name.lastIndexOf('.');
      if (lastIndexFile) {
        const extendFile = listFile[i].name.substring(lastIndexFile);
        const checkExtendFile = this.listFormatFile.find(x => x == extendFile.toLowerCase());
        if (checkExtendFile && listFile[i].size <= 5242880) {
          this.convertFile(listFile[i]);
        } else if (listFile[i].size > 5242880) {
          this._toastrService.warning(this._translate.instant('common.capacityFile') + `${listFile[i].name} ` + this._translate.instant('common.max5MB'));
        } else {
          this._toastrService.warning(`File ${listFile[i].name} ` + this._translate.instant('common.invalidFormat'));
        }
      }
    }
  }

  convertFile(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const index = reader.result.toString().indexOf('base64,');
      const base64 = index > 0 ? reader.result.toString().substring(index + 7) : '';
      const fileSelected = {
        fileName: file.name,
        fileSize: file.size,
        fileBase64: base64,
        fullBase64: reader.result.toString(),
        file
      };
      this.listFile.data = [...this.listFile.data, fileSelected];
    };
  }

  onDeleteFile(file) {
    const findFile = this.listFile.data.findIndex(f => f.fileName === file.fileName);
    if (findFile >= 0) {
      const data = [...this.listFile.data];
      data.splice(findFile, 1);
      this.listFile.data = data;
    }
  }

  onDownloadFile(item: any) {
    if (item.filePath) {
      this._changeInfoCustomerContractVehicle.downloadFileNew(item.attachmentId).subscribe(res => {
        saveAs(res.body, item.fileName);
      }, () => {
        this._toastrService.error(this._translate.instant('common.500Error'));
      });
    } else if (item.file) {
      saveAs(item.file, item.fileName);
    }
  }

  onViewFile(item: any) {
    const extension = item.fileName.split('.').pop().toLowerCase();
    if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp', 'pdf'].includes(extension)) {
      if (item.file && item.fullBase64) {
        if (extension === 'pdf') {
          this.dialog.originalOpen(ViewFilePdfComponent, {
            data: { fullBase64: item.fullBase64, documentName: item.fileName }
          });
        }
        if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp'].includes(extension)) {
          this.dialog.originalOpen(ViewFileImageComponent, {
            data: { fullBase64: item.fullBase64, documentName: item.fileName }
          });
        }
      } else {
        this._changeInfoCustomerContractVehicle.viewFileNew(item.attachmentId).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            const fullBase64 = 'data:image/png;base64,' + res.data;
            if (extension === 'pdf') {
              this.dialog.originalOpen(ViewFilePdfComponent, {
                data: { fullBase64, documentName: item.fileName }
              });
            }
            if (['jpg', 'png', 'tiff', 'bmp', 'jpeg', 'webp'].includes(extension)) {
              this.dialog.originalOpen(ViewFileImageComponent, {
                data: { fullBase64, documentName: item.fileName }
              });
            }
          } else {
            this._toastrService.error(this._translate.instant('common.500Error'));
          }
        }, () => {
          this._toastrService.error(this._translate.instant('common.500Error'));
        });
      }
    } else {
      this.onDownloadFile(item);
    }
  }
}

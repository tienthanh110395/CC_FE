import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AttachFileModel, SelectOptionCategory, SelectOptionModel } from '@app/core/models/common.model';
import { ResetPassLockOpenAgencyService } from '@app/core/services/support-after-sale/reset-password-lock-open-agency/reset-password-lock-open-agency.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { ACTION_REASON, HTTP_CODE } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-base-account',
  templateUrl: './lock-account.component.html',
  styleUrls: ['./lock-account.component.scss']
})
export class LockAccountComponent extends BaseComponent implements OnInit {

  header;
  formAccount: FormGroup;
  listActType: SelectOptionCategory[] = [] as SelectOptionCategory[];
  fileBase64: any = {};
  userId;
  isLock = true;
  listDataProfile = [];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  indexPaginator = 0;
  pageSizeList = [10, 20, 50, 100];
  displayedColumnsProfile = ['stt', 'documentName', 'actionDelete'];

  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected _toastr: ToastrService,
    protected _translate: TranslateService,
    private _resetPasssLockOpenAgencyService: ResetPassLockOpenAgencyService,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<LockAccountComponent>>,
  ) {
    super();

    this.formAccount = this.fb.group({
      actTypeName: ['', Validators.required],
      FileDC: [''],
    });
  }

  ngOnInit() {
    this.header = this._translate.instant('reset-agency.unlock-account');
    this.userId = this.dataDialog.data.id;
    this.getListDocumentTypeObject();
  }

  getListDocumentTypeObject() {
    this._resetPasssLockOpenAgencyService.getReason(ACTION_REASON.KH_YEUCAU_LOCKACC).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.listActType = res.data.map(val => {
          return {
            name: val.name,
            actTypeId: val.id,
          };
        });
      }
    });
  }

  chooseFileChange(event) {
    this.chooseFileModal(event, AttachFileComponent);
  }
  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      panelClass: 'my-dialog',
      width: '600px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      if (res) {
        res.forEach(file => {
          const license = {
            documentName: file.fileName,
            fileSize: file.fileSize,
            fileBase64: file.fileBase64,
            fullBase64: file.fullBase64
          };
          this.listDataProfile.push(license);
        });
        this.renderTable();
      }
    });
  }

  renderTable() {
    this.dataSourceProfile.paginator = this.paginatorProfile;
    this.tableProfile.renderRows();
  }

  onPaginateChange(event) {
    this.indexPaginator = event.pageIndex * event.pageSize;
  }

  deleteProfile(i) {
    this.confirmDialogDeleteProfile(i);
  }

  confirmDialogDeleteProfile(i) {
    this.listDataProfile.splice(i + this.indexPaginator, 1);
    this.renderTable();
  }

  viewProfile(row) {
    const checkExtension = row.documentName.split('.')[1];
    if (checkExtension != 'pdf') {
      this.openViewImageProfile(row);
    } else {
      this.openViewPdfProfile(row);
    }
  }

  openViewImageProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFileImageComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }

  openViewPdfProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFilePdfComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }

  unlockAccCTV() {
    const dialogData = new ConfirmDialogModel(this._translate.instant('common.confirm.title.unlockUser'), this._translate.instant('common.confirm.unlockUser'));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._resetPasssLockOpenAgencyService.unlockAccountCTV(this.userId, this.isLock, this.listDataProfile[0] ? this.listDataProfile[0].fileBase64 : '').subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this._toastr.success(this._translate.instant('reset-agency.unlock-accCTV-success'));
            this.dialogRef.close();
          } else {
            this._toastr.error(res.mess.description);
          }
        },
          error => {
            this._toastr.error(this._translate.instant('common.500Error'));
          }
        );
      }
    });
  }
}

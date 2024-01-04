import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentService } from '@app/core/services/document/document.service';
import { HTTP_CODE } from '@app/shared';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-extend-deadline',
  templateUrl: './dialog-extend-deadline.component.html',
  styleUrls: ['./dialog-extend-deadline.component.scss']
})
export class DialogExtendDeadlineComponent implements OnInit {
  minDate = new Date();
  extendDate = new FormControl('', Validators.required);
  constructor(
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
    private _briefCaseService: DocumentService,
    private _dialogRef: MatDialogRef<TemplateRef<DialogExtendDeadlineComponent>>,
    private _toastrService: ToastrService,
    private _translateService: TranslateService
  ) {

  }

  ngOnInit() {
  }
  extend() {
    const body = {
      contractId: this.dataDialog.contractId,
      infoUpdateDeadline: moment(this.extendDate.value).format(COMMOM_CONFIG.DATE_FORMAT_1)
    };
    this._briefCaseService.updateDeadline(body).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('briefcase.extend-success'));
        this._dialogRef.close(true);
      } else {
        this._toastrService.error(this._translateService.instant(rs.mess.description));
      }
    });
  }
}

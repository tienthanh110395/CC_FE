import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmCloseDialog } from '@app/shared/models/confirm-close-dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-close-dialog.component.html'
})
export class ConfirmCloseDialogComponent implements OnInit {
  title: string;
  message: string;
  messageBold: string;
  btnConfirm: string;
  constructor(public dialogRef: MatDialogRef<ConfirmCloseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmCloseDialog,
    private _translateService: TranslateService) {
    this.title = data.title;
    this.message = data.message;
    this.messageBold = data.messageBold;
  }

  ngOnInit() {
    this.btnConfirm = this.data.btnConfirm ? this.data.btnConfirm : this._translateService.instant('common.button.confirm');
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}


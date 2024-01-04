
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog-bold-form',
  templateUrl: './confirm-dialog-bold-form.component.html',
})

export class ConfirmDialogBoldFormComponent implements OnInit {
  title: string;
  messageFirst: string;
  messageBold: string;
  messageLast: string;
  buttonNameConfirm: string;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogBoldFormComponent>,
    protected translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmBoldFormDialogModel) {
    // Update view with given values
    this.title = data.title;
    this.messageFirst = data.messageFirst;
    this.messageBold = data.messageBold;
    this.messageLast = data.messageLast;
    this.buttonNameConfirm = data.nameButtonConfirm;
    if (!this.buttonNameConfirm) {
      this.buttonNameConfirm = translateService.instant('common.button.confirm');
    }
  }

  ngOnInit() {
  }

  onConfirm(): void {
    // Close the dialog, return true
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }
}

/**
 * Class to represent confirm dialog model.
 *
 * It has been kept here to keep it as part of shared component.
 */
export class ConfirmBoldFormDialogModel {

  constructor(public title: string, public messageFirst: string, public messageBold: string, public messageLast: string, public nameButtonConfirm?: string) {
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-noti',
  templateUrl: './popup-noti.component.html',
  styleUrls: ['./popup-noti.component.scss']
})
export class PopupNotiComponent {
  formGroupPopup: FormGroup;
  content = '';
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PopupNotiComponent>
  ) {
    this.formGroupPopup = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  send() {
    this.dialogRef.close(this.content);
  }
}

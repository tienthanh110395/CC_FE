import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonCRMService, HTTP_CODE } from '@app/shared';
import { COMMOM_CONFIG, environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  formSearch: FormGroup;
  hideOldPass = true;
  hideNewPass = true;
  hideConfirmPass = true;
  constructor(
    private fb: FormBuilder,
    private _crmService: CommonCRMService,
    private _toastrService: ToastrService,
    private _translateService: TranslateService,
    private dialogRef?: MatDialogRef<ChangePasswordComponent>
  ) { }

  ngOnInit() {
    this.formSearch = this.fb.group({
      oldPass: ['', [Validators.required]],
      newPass: ['', [Validators.required]],
      comfirmPass: ['', [Validators.required]]
    }, {
      validator: PasswordValidation.matchPassword
    });
  }
  changePass() {
    let body = {
      value: this.formSearch.value.oldPass,
      newValue: this.formSearch.value.newPass
    }
    this._crmService.changePass(body).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.dialogRef.close();
        this._toastrService.success(this._translateService.instant('user.change_password_sucess'));
      } else {
        this._toastrService.warning(rs.mess.description);
      }
    }, error => {
      this._toastrService.warning(this._translateService.instant('common.500Error'));
    })
  }

}
export class PasswordValidation {
  static matchPassword(AC: AbstractControl) {
    let password = AC.get('newPass').value;
    if (AC.get('comfirmPass').touched || AC.get('comfirmPass').dirty) {
      let verifyPassword = AC.get('comfirmPass').value;
      if (password != verifyPassword) {
        AC.get('comfirmPass').setErrors({ matchPassword: true })
      } else {
        return null
      }
    }
  }
}

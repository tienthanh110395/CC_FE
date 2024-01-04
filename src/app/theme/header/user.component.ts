import { Component } from '@angular/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { MtxDialog } from '@ng-matero/extensions';
import { OAuthService } from 'angular-oauth2-oidc';
import { ChangePasswordComponent } from '../change-password/change-password.component';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent {
  userName: string;
  isLoginToken = AppStorage.getLoginByToken();
  constructor(private readonly oauthService: OAuthService,
    public dialog?: MtxDialog,
  ) {
    this.userName = AppStorage.getUserLogin();
  }

  logout() {
    AppStorage.clear();
    this.oauthService.logOut();
  }
  showChangePassWord() {
    let dialogRef = this.dialog.open(
      {
        // width: '30%',
      },
      ChangePasswordComponent
    );
    dialogRef.disableClose = true;
  }
}

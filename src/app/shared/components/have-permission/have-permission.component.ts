import { Component, OnInit, Input } from '@angular/core';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'have-permission',
  templateUrl: './have-permission.component.html',
})
export class HavePermissionComponent implements OnInit {
  public havePermission = false;
  @Input()
  public actionCode: string;
  @Input()
  public resourceCode: string;

  constructor() {

  }

  ngOnInit() {
    this.havePermission = CommonUtils.havePermission(this.actionCode, this.resourceCode);
  }

}

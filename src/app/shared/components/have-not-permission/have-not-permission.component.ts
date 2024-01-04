import { Component, OnInit, Input } from '@angular/core';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'have-not-permission',
  templateUrl: './have-not-permission.component.html'
})
export class HaveNotPermissionComponent implements OnInit {
  public haveNotPermission = false;
  @Input()
  public actionCode: string;
  @Input()
  public resourceCode: string;

  constructor() {}

  ngOnInit() {
    this.haveNotPermission = !CommonUtils.havePermission(this.actionCode, this.resourceCode);
  }

}

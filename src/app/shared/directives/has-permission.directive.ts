import { Directive, OnInit, ElementRef, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit {
  private _value: any;
  constructor(
    private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {

  }

  @Input()
  set hasPermission(value) {
    this._value = value;
    this.updateView(this._value);
  }

  ngOnInit() {
    
  }

  private updateView(value) {
    if (CommonUtils.havePermission(value[0], value[1])) {
        this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
  
}

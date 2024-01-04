import { Directive, OnInit, ElementRef, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Directive({
  selector: '[hasNotPermission]'
})
export class HasNotPermissionDirective implements OnInit {
  constructor(
    private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {

  }

  ngOnInit() {

  }

  private updateView(value) {
    if (!CommonUtils.havePermission(value[0], value[1])) {
        this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
  @Input()
  set hasNotPermission(value) {
    this.updateView(value);
  }
}

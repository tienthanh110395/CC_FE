import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
  selector: '[autoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {
  private _value: any;
  constructor(private el: ElementRef) {
  }

  @Input()
  set autoFocus(value) {
    this._value = value;
  }

  ngAfterViewInit() {
    setTimeout(() => {
    if (this._value) {
        this.el.nativeElement.focus();
      }
    }, 400);
  }
}

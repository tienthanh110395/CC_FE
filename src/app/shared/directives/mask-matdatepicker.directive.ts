import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as textMask from 'vanilla-text-mask/dist/vanillaTextMask.js';
@Directive({
  selector: '[maskDate]',
})
export class MaskDateDirective implements OnDestroy {
  mask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]; // dd/mm/yyyy
  maskedInputController;
  inputElement;
  constructor(private element: ElementRef, private control: NgControl) {
    this.maskedInputController = textMask.maskInput({
      inputElement: this.element.nativeElement,
      mask: this.mask,
    });
  }
  // @HostListener('change', ['$event']) change(event) {
  //   let val = event.target.value;
  //   if (val) {
  //     const t = moment(val, COMMOM_CONFIG.DATE_FORMAT, true).isValid();
  //     if (!t) {
  //       val = null;
  //       this.control.control.setValue(null);
  //     }
  //   }
  // }
  ngOnDestroy() {
    this.maskedInputController.destroy();
  }
}

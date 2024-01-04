import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[vndFormat]'
})
export class VndFormatDirective implements OnChanges {
  @Input() money?: number;
  constructor(
    private el: ElementRef,
    private ngControl: NgControl
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.money) {
      this.format(this.money);
    }
  }
  @HostListener('input', ['$event']) keyup(e) {
    let v = e.target.value;
    this.format(v);
  }
  format(e) {
    if (Number(e) == 0) {
      this.ngControl.control.setValue(null);
      this.el.nativeElement.value = null;
    } else {
      let newVal = e.replace(/\D/g, '');
      if (newVal.length === 0) {
        newVal = '';
      } else {
        newVal = newVal.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      }
      this.ngControl.control.setValue(this.toNumber(newVal));
      this.el.nativeElement.value = newVal;
    }

  }
  toNumber(val) {
    let valArr = val.split('');
    let valFiltered = valArr.filter(x => !isNaN(x))
    let valProcessed = valFiltered.join('')
    return valProcessed;
  }

}

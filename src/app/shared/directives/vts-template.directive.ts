import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[vtsTemplate]',
  host: {},
})
export class VtsTemplateDirective {
  @Input() type: string;
  @Input('vtsTemplate') name: string;
  constructor(public template: TemplateRef<any>) { }
  getType(): string {
    return this.name;
  }
}

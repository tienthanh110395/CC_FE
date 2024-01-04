import { ContentChild, Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'custom-mat-column',
})
export class TableColumnDirective {
  @Input() public columnName: string;
  @ContentChild(TemplateRef) public columnTemplate: TemplateRef<any>;
}

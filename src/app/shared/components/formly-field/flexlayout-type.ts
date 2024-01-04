import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/material';

@Component({
  selector: 'formly-form-flex',
  template: `
    <div fxLayout="row wrap" fxLayout.xs="column"  fxLayoutGap="20px grid">
        <formly-field *ngFor="let f of field.fieldGroup" [field]="f" [fxFlex]="f.templateOptions.flexOption" fxFlex.lt-sm="100">
        </formly-field>
    </div>
  `,
})
export class FlexLayoutType extends FieldType {
}

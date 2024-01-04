import {AfterViewInit, Component, TemplateRef, ViewChild} from '@angular/core';
import {FieldType} from '@ngx-formly/material';

@Component({
  selector: 'app-formly-field-input',
  template: `
    <input matInput [formControl]="formControl" [formlyAttributes]="field" [readonly]="to.readonly">
    <ng-template #clearInput>
      <button mat-icon-button matSuffix *ngIf="(formControl.value &&  !to.disabled  && !to.readonly)"
              (click)="formControl.setValue(null)" class="showclear">
        <mat-icon>clear</mat-icon>
      </button>
    </ng-template>
  `,
})
export class CustomFormlyFieldInput extends FieldType implements AfterViewInit {
  @ViewChild('clearInput') clearInput: TemplateRef<any>;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.to._matSuffix = this.clearInput;
      (this.options as any)._markForCheck(this.field);
    });
  }
}

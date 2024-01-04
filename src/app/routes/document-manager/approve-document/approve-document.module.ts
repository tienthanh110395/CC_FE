import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApproveDocumentComponent } from './approve-document.component';
import { SharedModule } from '@app/shared';
import { ApproveDocumentRoutes } from './approve-document.routing';
import { InfoDocumentApproveComponent } from './info-document/info-document.component';
import { AngularSplitModule } from 'angular-split';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AngularSplitModule,
    ApproveDocumentRoutes
  ],
  declarations: [ApproveDocumentComponent, InfoDocumentApproveComponent]
})
export class ApproveDocumentModule { }

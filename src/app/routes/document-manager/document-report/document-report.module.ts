import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentReportComponent } from './document-report.component';
import { SharedModule } from '@app/shared';
import { DocumentReportRoutes } from './document-report.routing';
@NgModule({
  imports: [
    CommonModule,
    DocumentReportRoutes,
    SharedModule
  ],
  declarations: [DocumentReportComponent]
})
export class DocumentReportModule { }

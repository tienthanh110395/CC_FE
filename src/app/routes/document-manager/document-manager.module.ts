import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { DocumentManagerRoutes } from './document-manager.routing';
import { DialogExtendDeadlineComponent } from './approve-document/dialog-extend-deadline/dialog-extend-deadline.component';
import { ViewLogBriefComponent } from './view-log-brief/view-log-brief.component';
import { LogDetailComponent } from './view-log-brief/log-detail/log-detail.component';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DocumentManagerRoutes
  ],
  declarations: [
    DialogExtendDeadlineComponent,
    ViewLogBriefComponent,
    LogDetailComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class DocumentManagerModule { }

import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CateConfigRoutes } from '@app/routes/cate-config/cate-config.routing';
import { StatisticsCreateComponent } from "@app/routes/cate-config/ticket-reflective-statistics/statistics-create/statistics-create.component";
import { SharedModule } from '@shared';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { ImpactLogDialogComponent } from './impact-log/impact-log-dialog/impact-log-dialog.component';
import { ImpactLogComponent } from './impact-log/impact-log.component';
import { ImportFileComponent } from './import-file/import-file.component';
import { CreateMapErrorCauseComponent } from './map-cause-error/create-map-error-cause/create-map-error-cause.component';
import { MapCauseErrorComponent } from './map-cause-error/map-cause-error.component';
import { UpdateMapCauseErrorComponent } from './map-cause-error/update-map-cause-error/update-map-cause-error.component';
import { DialogCreateTicketErrorCauseComponent } from './ticket-error-cause/dialog-create-ticket-error-cause/dialog-create-ticket-error-cause.component';
import { DialogEditTicketErrorCauseComponent } from './ticket-error-cause/dialog-edit-ticket-error-cause/dialog-edit-ticket-error-cause.component';
import { TicketErrorCauseComponent } from './ticket-error-cause/ticket-error-cause.component';
import { TicketExpireCauseCreateComponent } from './ticket-expire-cause/ticket-expire-cause-create/ticket-expire-cause-create.component';
import { TicketExpireCauseComponent } from './ticket-expire-cause/ticket-expire-cause.component';
import { TicketGenreCreateComponent } from './ticket-genre/ticket-genre-create/ticket-genre-create.component';
import { TicketGenreEditComponent } from './ticket-genre/ticket-genre-edit/ticket-genre-edit.component';
import { TicketGenreComponent } from './ticket-genre/ticket-genre.component';
import { DialogCreateTicketGroupComponent } from './ticket-group/dialog-create-ticket-group/dialog-create-ticket-group.component';
import { DialogUpdateTicketGroupComponent } from './ticket-group/dialog-update-ticket-group/dialog-update-ticket-group.component';
import { TicketGroupComponent } from './ticket-group/ticket-group.component';
import { TicketLevelCateCreateComponent } from './ticket-level-cate/ticket-level-cate-create/ticket-level-cate-create.component';
import { TicketLevelCateUpdateComponent } from './ticket-level-cate/ticket-level-cate-update/ticket-level-cate-update.component';
import { TicketLevelCateComponent } from './ticket-level-cate/ticket-level-cate.component';
import { ImportFileProcessingTimeDialogComponent } from './ticket-processing-time-config/import-file-processing-time-dialog/import-file-processing-time-dialog.component';
import { ProcessingTimeConfigDialogComponent } from './ticket-processing-time-config/processing-time-config-dialog/processing-time-config-dialog.component';
import { ReceptionTimeConfigDialogComponent } from './ticket-processing-time-config/reception-time-config-dialog/reception-time-config-dialog.component';
import { TicketProcessingTimeConfigComponent } from './ticket-processing-time-config/ticket-processing-time-config.component';
import { TicketReflectiveStatisticsComponent } from './ticket-reflective-statistics/ticket-reflective-statistics.component';
import { TicketSiteDialogComponent } from './ticket-site/ticket-site-dialog/ticket-site-dialog.component';
import { TicketSiteComponent } from './ticket-site/ticket-site.component';
import { TicketTypeCreateComponent } from './ticket-type/ticket-type-create/ticket-type-create.component';
import { TicketTypeComponent } from './ticket-type/ticket-type.component';
import { ImportFileStatisticComponent } from './ticket-reflective-statistics/import-file-statistic/import-file-statistic.component';
import { ImportFileMapErrorCauseComponent } from './map-cause-error/import-file-map-error-cause/import-file-map-error-cause.component';
import { NotifyConfigComponent } from './notify-config/notify-config.component';

@NgModule({
  declarations: [
    TicketGroupComponent,
    TicketGenreComponent,
    TicketTypeComponent,
    TicketProcessingTimeConfigComponent,
    TicketLevelCateComponent,
    TicketErrorCauseComponent,
    TicketExpireCauseComponent,
    ImportFileComponent,
    DialogCreateTicketGroupComponent,
    TicketTypeCreateComponent,
    TicketGenreCreateComponent,
    DialogCreateTicketErrorCauseComponent,
    DialogEditTicketErrorCauseComponent,
    TicketExpireCauseCreateComponent,
    DialogUpdateTicketGroupComponent,
    TicketGenreEditComponent,
    TicketSiteComponent,
    TicketSiteDialogComponent,
    TicketLevelCateCreateComponent,
    TicketLevelCateUpdateComponent,
    ProcessingTimeConfigDialogComponent,
    ReceptionTimeConfigDialogComponent,
    ImportFileProcessingTimeDialogComponent,
    MapCauseErrorComponent,
    ImpactLogComponent,
    CreateMapErrorCauseComponent,
    TicketReflectiveStatisticsComponent,
    ImpactLogDialogComponent,
    StatisticsCreateComponent,
    UpdateMapCauseErrorComponent,
    ImportFileStatisticComponent,
    ImportFileMapErrorCauseComponent,
    NotifyConfigComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    CateConfigRoutes,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    NgxMatSelectSearchModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class CateConfigModule {
}

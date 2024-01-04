import { RouterModule, Routes } from '@angular/router';
import { ImportFileComponent } from '@app/routes/cate-config/import-file/import-file.component';
import { TicketErrorCauseComponent } from '@app/routes/cate-config/ticket-error-cause/ticket-error-cause.component';
import { TicketExpireCauseComponent } from '@app/routes/cate-config/ticket-expire-cause/ticket-expire-cause.component';
import { TicketGenreComponent } from '@app/routes/cate-config/ticket-genre/ticket-genre.component';
import { TicketGroupComponent } from '@app/routes/cate-config/ticket-group/ticket-group.component';
import { TicketLevelCateComponent } from '@app/routes/cate-config/ticket-level-cate/ticket-level-cate.component';
import { TicketProcessingTimeConfigComponent } from '@app/routes/cate-config/ticket-processing-time-config/ticket-processing-time-config.component';
import { TicketTypeCreateComponent } from '@app/routes/cate-config/ticket-type/ticket-type-create/ticket-type-create.component';
import { TicketTypeComponent } from '@app/routes/cate-config/ticket-type/ticket-type.component';

import { ImpactLogComponent } from '@app/routes/cate-config/impact-log/impact-log.component';
import { MapCauseErrorComponent } from '@app/routes/cate-config/map-cause-error/map-cause-error.component';
import { TicketGenreCreateComponent } from '@app/routes/cate-config/ticket-genre/ticket-genre-create/ticket-genre-create.component';
import { TicketGenreEditComponent } from '@app/routes/cate-config/ticket-genre/ticket-genre-edit/ticket-genre-edit.component';
import { TicketReflectiveStatisticsComponent } from "@app/routes/cate-config/ticket-reflective-statistics/ticket-reflective-statistics.component";
import { TicketSiteComponent } from '@app/routes/cate-config/ticket-site/ticket-site.component';
import { NotifyConfigComponent } from './notify-config/notify-config.component';

const routes: Routes = [
  {
    path: 'ticket-group',
    component: TicketGroupComponent,
    data: {
      title: 'menu.cate-config.ticket-group',
    },
  },
  {
    path: 'ticket-genre',
    component: TicketGenreComponent,
    data: {
      title: 'menu.cate-config.ticket-genre',
    },
  },
  {
    path: 'ticket-genre-create',
    component: TicketGenreCreateComponent,
    data: {
      title: 'menu.cate-config.ticket-genre-create',
    },
  },
  {
    path: 'ticket-genre-update/:id',
    component: TicketGenreEditComponent,
    data: {
      title: 'menu.cate-config.ticket-genre-update',
    },
  },
  {
    path: 'ticket-type',
    component: TicketTypeComponent,
    data: {
      title: 'menu.cate-config.ticket-type',
    },
  },
  {
    path: 'ticket-type-create',
    component: TicketTypeCreateComponent,
    data: {
      title: 'menu.cate-config.ticket-type-create',
    },
  },
  {
    path: 'ticket-type-update/:id',
    component: TicketTypeCreateComponent,
    data: {
      title: 'menu.cate-config.ticket-type-update',
    },
  },
  {
    path: 'ticket-processing-time-config',
    component: TicketProcessingTimeConfigComponent,
    data: {
      title: 'menu.cate-config.ticket-processing-time-config',
    },
  },
  {
    path: 'ticket-level-cate',
    component: TicketLevelCateComponent,
    data: {
      title: 'menu.cate-config.ticket-level-cate',
    },
  },
  {
    path: 'ticket-error-cause',
    component: TicketErrorCauseComponent,
    data: {
      title: 'menu.cate-config.ticket-error-cause',
    },
  },
  {
    path: 'ticket-expire-cause',
    component: TicketExpireCauseComponent,
    data: {
      title: 'menu.cate-config.ticket-expire-cause',
    },
  },
  {
    path: 'ticket-site',
    component: TicketSiteComponent,
    data: {
      title: 'menu.cate-config.ticket-site',
    },
  },
  {
    path: 'import-file',
    component: ImportFileComponent,
    data: {
      title: 'menu.cate-config.import-file',
    },
  },
  {
    path: 'map-cause-error',
    component: MapCauseErrorComponent,
    data: {
      title: 'menu.cate-config.map-cause-error',
    },
  }, {
    path: 'ticket-reflective-statistics',
    component: TicketReflectiveStatisticsComponent,
    data: {
      title: 'menu.cate-config.ticket-reflective-statistics',
    },
  },{
    path: 'notify-config',
    component: NotifyConfigComponent,
    data: {
      title: 'menu.cate-config.notify-config',
    },
  },
  {
    path: 'impact-log',
    component: ImpactLogComponent,
    data: {
      title: 'menu.cate-config.impact-log',
    },
  },
];

export const CateConfigRoutes = RouterModule.forChild(routes);

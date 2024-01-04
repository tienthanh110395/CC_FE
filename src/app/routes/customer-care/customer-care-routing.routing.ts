import { Routes, RouterModule } from '@angular/router';
import { SearchAgencyComponent } from './search-agency/search-agency.component';
import { SearchBotComponent } from './search-bot/search-bot.component';
import { SearchCcComponent } from './search-cc/search-cc.component';
import { SearchProcessComponent } from './search-process/search-process.component';
import { SearchInformationCustomerComponent } from './search-information-customer/search-information-customer.component';
import { ConfigProcessTimeComponent } from './config-process-time/config-process-time.component';
import { AssignHandleReflectComponent } from './assign-handle-reflect/assign-handle-reflect.component';
import { ExtentProcessComponent } from './extent-process/extent-process.component';
import { ReceiveReflectComponent } from './search-information-customer/receive-reflect/receive-reflect.component';
import { ProcessTicketTabComponent } from './search-information-customer/ticket/process/process.component';
import { TicketProcessComponent } from './search-cc/ticket-process/ticket-process.component';
import { TicketStatisticsSearchComponent } from './ticket-statistics-search/ticket-statistics-search.component';
import { TicketReportPerformmanceComponent } from './ticket-report-performmance/ticket-report-performmance.component';
import { TicketTypeComponent } from './ticket-type/ticket-type.component';
import { TicketExpireCauseComponent } from './ticket-expire-cause/ticket-expire-cause.component';
import { TicketErrorCauseComponent } from './ticket-error-cause/ticket-error-cause.component';
import { ApproveTicketComponent } from './approve-ticket/approve-ticket.component';
import { EtagChangeRegisComponent } from './etag-change-regis/etag-change-regis.component';
import { StatisticComponent } from './search-information-customer/statistic/statistic.component';
const routes: Routes = [
  {
    path: 'search-cc',
    component: SearchCcComponent,
    data: {
      title: 'menu.customer-care.search-cc'
    }
  },
  {
    path: 'search-process',
    component: SearchProcessComponent,
    data: {
      title: 'menu.customer-care.search-process'
    }
  },
  {
    path: 'search-agency', component: SearchAgencyComponent,
    data: {
      title: 'menu.customer-care.search-agency'
    }
  },
  {
    path: 'config-process-time', component: ConfigProcessTimeComponent,
    data: {
      title: 'menu.customer-care.config-process-time'
    }
  },
  {
    path: 'search-bot', component: SearchBotComponent,
    data: {
      title: 'menu.customer-care.search-bot'
    }
  },
  {
    path: 'search-information-customer',
    component: SearchInformationCustomerComponent,
    data: {
      title: 'menu.customer-care.search-information-customer'
    }
  },
  {
    path: 'assign-handle-reflect',
    component: AssignHandleReflectComponent,
    data: {
      title: 'menu.customer-care.assign-handle-reflect'
    }
  },
  {
    path: 'extent-process',
    component: ExtentProcessComponent,
    data: {
      title: 'menu.customer-care.extent-process'
    }
  },
  {
    path: 'receive-reflect',
    component: ReceiveReflectComponent,
    data: {
      title: 'reset-agency.receive_reflect'
    }
  },
  {
    path: 'ticket-statistics-search',
    component: TicketStatisticsSearchComponent,
    data: {
      title: 'menu.customer-care.ticket-statistics-search'
    }
  },
  {
    path: 'ticket-report-performmance',
    component: TicketReportPerformmanceComponent,
    data: {
      title: 'menu.customer-care.ticket-report-performmance'
    }
  },
  {
    path: 'ticket-process',
    component: TicketProcessComponent,
    data: {
      title: 'customer-care.search-process.processTicket'
    }
  },
  {
    path: 'ticket-type',
    component: TicketTypeComponent,
    data: {
      title: 'menu.customer-care.ticket-type'
    }
  },
  {
    path: 'ticket-expire-cause',
    component: TicketExpireCauseComponent,
    data: {
      title: 'menu.customer-care.ticket-expire-cause'
    }
  },
  {
    path: 'ticket-error-cause',
    component: TicketErrorCauseComponent,
    data: {
      title: 'menu.customer-care.ticket-error-cause'
    }
  },
  {
    path: 'approve-ticket',
    component: ApproveTicketComponent,
    data: {
      title: 'menu.customer-care.approve-ticket'
    }
  },
  {
    path: 'etag-change-regis',
    component: EtagChangeRegisComponent,
    data: {
      title: 'menu.customer-care.etag-change-regis'
    }
  },
  {
    path: 'statistic',
    component: StatisticComponent,
    data: {
      title: 'reset-agency.enter_statistic'
    }
  },
];

export const SearchAgencyRoutes = RouterModule.forChild(routes);

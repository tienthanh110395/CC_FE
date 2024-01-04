import { Routes, RouterModule } from '@angular/router';
import { DocumentReportComponent } from './document-report.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentReportComponent
  },
];

export const DocumentReportRoutes = RouterModule.forChild(routes);

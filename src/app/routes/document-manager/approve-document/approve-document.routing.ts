import { Routes, RouterModule } from '@angular/router';
import { ApproveDocumentComponent } from './approve-document.component';

const routes: Routes = [
  {
    path: '',
    component: ApproveDocumentComponent
  },
];

export const ApproveDocumentRoutes = RouterModule.forChild(routes);

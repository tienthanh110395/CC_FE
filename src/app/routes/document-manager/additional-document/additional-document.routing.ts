import { Routes, RouterModule } from '@angular/router';
import { AdditionalDocumentComponent } from './additional-document.component';

const routes: Routes = [
  {
    path: '',
    component: AdditionalDocumentComponent
  },
];

export const AdditionalDocumentRoutes = RouterModule.forChild(routes);

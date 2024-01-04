import { Routes, RouterModule } from '@angular/router';
import { SearchDocumentComponent } from './search-document.component';

const routes: Routes = [
  {
    path: '',
    component: SearchDocumentComponent
  },
];

export const SearchDocumentRoutes = RouterModule.forChild(routes);

import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'search-document',
    loadChildren: () =>
      import('./search-document/search-document.module').then(
        m => m.SearchDocumentModule
      ),
    data: {
      title: 'menu.document-management.search-document',
    },
  },
  {
    path: 'approve-document',
    loadChildren: () =>
      import('./approve-document/approve-document.module').then(
        m => m.ApproveDocumentModule
      ),
    data: {
      title: 'menu.document-management.approve-document',
    },
  },
  {
    path: 'additional-document',
    loadChildren: () =>
      import('./additional-document/additional-document.module').then(
        m => m.AdditionalDocumentModule
      ),
    data: {
      title: 'menu.document-management.additional-document',
    },
  },
  {
    path: 'document-report',
    loadChildren: () =>
      import('./document-report/document-report.module').then(
        m => m.DocumentReportModule
      ),
    data: {
      title: 'menu.document-management.document-report',
    },
  }
];

export const DocumentManagerRoutes = RouterModule.forChild(routes);

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from '@app/shared/components/sessions/404.component';
import { PropertyResolver } from '@app/shared/services/property.resolver';
import { environment } from '@env/environment';
import { AdminLayoutComponent } from '../theme/admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        resolve: {
          props: PropertyResolver,
        },
        data: {
          title: 'menu.dashboard',
        },
      }
      ,
      {
        path: 'document-management',
        loadChildren: () =>
          import('./document-manager/document-manager.module').then(
            m => m.DocumentManagerModule,
          ),
        data: {
          title: 'menu.document-management',
        },
      },
      {
        path: 'customer-care',
        loadChildren: () =>
          import('./customer-care/customer-care.module').then(
            m => m.CustomCareModule,
          ),
        data: {
          title: 'menu.customer-care',
        },
      },
      {
        path: 'support-after-sale',
        loadChildren: () =>
          import('./support-after-sale/support-after-sale.module').then(
            m => m.SupportAfterSaleModule,
          ),
        data: {
          title: 'menu.support-after-sale',
        },
      },
      {
        path: 'special-vehicle-management',
        loadChildren: () =>
          import('./special-vehicle-management/special-vehicle-management.module').then(
            m => m.SpecialVehicleManagementModule,
          ),
        data: {
          title: 'menu.special-vehicle-management',
        },
      },
      {
        path: 'cate-config',
        loadChildren: () =>
          import('./cate-config/cate-config.module').then(
            m => m.CateConfigModule,
          ),
        data: {
          title: 'menu.cate-config',
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '404',
  },
  {
    path: '404',
    component: Error404Component,
    data: { title: 'page.404' },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
    }),
  ],
  exports: [RouterModule],
})
export class RoutesRoutingModule {
}

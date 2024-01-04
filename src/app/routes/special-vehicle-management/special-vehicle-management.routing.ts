import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PriorityForbiddenVehicleComponent } from './priority-forbidden-vehicle/priority-forbidden-vehicle.component';
import { ExceptionVehicleComponent } from './exception-vehicle/exception-vehicle.component';
import { ExceptionVehicleAccessComponent } from './exception-vehicle-access/exception-vehicle-access.component';
import { PriorityForbiddenVehicleAccessComponent } from './priority-forbidden-vehicle-access/priority-forbidden-vehicle-access.component';
import { AuthGuard } from '@app/core';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'priority-forbidden-vehicle'
  },
  {
    path: 'priority-forbidden-vehicle',
    component: PriorityForbiddenVehicleComponent,
    data: {
      title: 'special-vehicle.title-page-priority'
    },
    // canActivate: [AuthGuard]
  },
  {
    path: 'exception-vehicle',
    component: ExceptionVehicleComponent,
    data: {
      title: 'special-vehicle.title-page-exception'
    },
    // canActivate: [AuthGuard]
  },
  {
    path: 'exception-vehicle-create',
    component: ExceptionVehicleAccessComponent,
    data: {
      title: 'special-vehicle.exception-vehicle-create'
    },
    // canActivate: [AuthGuard]
  },
  {
    path: 'exception-vehicle-update/:id',
    component: ExceptionVehicleAccessComponent,
    data: {
      title: 'special-vehicle.exception-vehicle-update'
    },
    // canActivate: [AuthGuard]
  },
  {
    path: 'priority-forbidden-vehicle-create',
    component: PriorityForbiddenVehicleAccessComponent,
    data: {
      title: 'special-vehicle.priority-forbidden-vehicle-create'
    },
    // canActivate: [AuthGuard]
  },
  {
    path: 'priority-forbidden-vehicle-update/:id',
    component: PriorityForbiddenVehicleAccessComponent,
    data: {
      title: 'special-vehicle.priority-forbidden-vehicle-update'
    },
    // canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpecialVehicleManagementRoutingModule { }

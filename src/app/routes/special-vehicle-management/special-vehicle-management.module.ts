import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialVehicleManagementRoutingModule } from './special-vehicle-management.routing';
import { PriorityForbiddenVehicleComponent } from './priority-forbidden-vehicle/priority-forbidden-vehicle.component';
import { ExceptionVehicleComponent } from './exception-vehicle/exception-vehicle.component';
import { SharedModule } from '@app/shared/shared.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PriorityForbiddenVehicleAccessComponent } from './priority-forbidden-vehicle-access/priority-forbidden-vehicle-access.component';
import { ExceptionVehicleAccessComponent } from './exception-vehicle-access/exception-vehicle-access.component';
import { ExceptionVehicleDetailComponent } from './exception-vehicle-detail/exception-vehicle-detail.component';
import { PriorityForbiddenVehicleDetailComponent } from './priority-forbidden-vehicle-detail/priority-forbidden-vehicle-detail.component';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { DenyVehicleComponent } from './deny-vehicle/deny-vehicle.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SpecialVehicleManagementRoutingModule,
    NgxMatSelectSearchModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    PriorityForbiddenVehicleComponent,
    PriorityForbiddenVehicleAccessComponent,
    PriorityForbiddenVehicleDetailComponent,
    ExceptionVehicleComponent,
    ExceptionVehicleAccessComponent,
    ExceptionVehicleDetailComponent,
    DenyVehicleComponent
  ],
  providers: []
})
export class SpecialVehicleManagementModule { }

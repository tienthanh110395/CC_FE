import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoutesRoutingModule } from './routes-routing.module';

const COMPONENTS = [
  DashboardComponent
];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [CommonModule, SharedModule, RoutesRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
  entryComponents: COMPONENTS_DYNAMIC,
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RoutesModule { }

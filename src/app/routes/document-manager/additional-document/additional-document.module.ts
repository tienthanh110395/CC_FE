import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdditionalDocumentComponent } from './additional-document.component';
import { SharedModule } from '@app/shared';
import { AdditionalDocumentRoutes } from './additional-document.routing';
import { TableContractAdditionalComponent } from './document-contract/document-contract.component';
import { DocumentVehicleComponent } from './document-vehicle/document-vehicle.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AdditionalDocumentRoutes
  ],
  declarations: [AdditionalDocumentComponent,
    TableContractAdditionalComponent,
    DocumentVehicleComponent]
})
export class AdditionalDocumentModule { }

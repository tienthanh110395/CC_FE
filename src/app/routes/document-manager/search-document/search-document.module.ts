import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchDocumentComponent } from './search-document.component';
import { SharedModule } from '@app/shared';
import { SearchDocumentRoutes } from './search-document.routing';
import { InfoDocumentDetailComponent } from './info-document/info-document.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SearchDocumentRoutes
  ],
  declarations: [SearchDocumentComponent, InfoDocumentDetailComponent]
})
export class SearchDocumentModule { }

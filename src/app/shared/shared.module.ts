import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { MaterialExtensionsModule } from '@ng-matero/extensions';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PropertyResolver } from '@shared/services';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxFileDropModule } from 'ngx-file-drop';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgProgressModule } from 'ngx-progressbar';
import { NgProgressHttpModule } from 'ngx-progressbar/http';
import { NgProgressRouterModule } from 'ngx-progressbar/router';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from '../material.module';
import { AttachFileComponent } from './components/attach-file/attach-file.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { CommonListComponent } from './components/common-list/common-list.component';
import { ConfirmCloseDialogComponent } from './components/confirm-close-dialog/confirm-close-dialog.component';
import { ConfirmDialogBoldFormComponent } from './components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DropdownTreeComponent } from './components/dropdown-tree/dropdown-tree.component';
import { ErrorCodeComponent } from './components/error-code/error-code.component';
import { HaveNotPermissionComponent } from './components/have-not-permission/have-not-permission.component';
import { HavePermissionComponent } from './components/have-permission/have-permission.component';
import { InfoContractSharedComponent } from './components/info-contract/info-contract.component';
import { InfoCustomerSharedComponent } from './components/info-customer/info-customer.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { Error404Component } from './components/sessions/404.component';
import { CrmTableComponent } from './components/table-component/table-component.component';
import { ViewFileImageComponent } from './components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from './components/view-file-pdf/view-file-pdf.component';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { DigitOnlyDirective } from './directives/digit-only.directive';
import { FormatCurrencyDirective } from './directives/format-currency.directive';
import { HasNotPermissionDirective } from './directives/has-not-permission.directive';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { InputSpecialDirective } from './directives/input-special.directive';
import { InputTrimDirective } from './directives/input-trim.directive';
import { MaskDateDirective } from './directives/mask-matdatepicker.directive';
import { OnlyNumberDirective } from './directives/only-number.directive';
import { VndFormatDirective } from './directives/vnd-format.directive';
import { VtsTemplateDirective } from './directives/vts-template.directive';
import { DisplayDateMonthPipe } from './pipes/display-date-month.pipe';
import { DisplayDatePipe } from './pipes/display-date.pipe';
import { DisplayHelperPipe } from './pipes/display-helper.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { FindByPipe, FormatCurrencyPipe } from './pipes/format-currency.pipe';
import { HighlightSearch } from './pipes/high-light.pipe';
import { RfidStatusPipe } from './pipes/rfid-status.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { VehicleCheckStatusPipe } from './pipes/vehicle-check-status.pipe';
import { CustomDate } from './utils/custom-date';
import { PaginatorIntlService } from './utils/paging';

const THIRD_MODULES = [
  MaterialModule,
  MaterialExtensionsModule,
  FlexLayoutModule,
  NgProgressModule,
  NgProgressRouterModule,
  NgProgressHttpModule,
  NgSelectModule,
  FormlyModule,
  FormlyMaterialModule,
  ToastrModule,
  TranslateModule,
  ScrollingModule,
  PdfViewerModule,
  NgxFileDropModule,
  PerfectScrollbarModule
];
const COMPONENTS = [
  BreadcrumbComponent,
  PageHeaderComponent,
  ErrorCodeComponent,
  ConfirmDialogComponent,
  ConfirmDialogBoldFormComponent,
  HavePermissionComponent,
  HaveNotPermissionComponent,
  AttachFileComponent,
  CrmTableComponent,
  ViewFileImageComponent,
  ViewFilePdfComponent,
  Error404Component,
  CommonListComponent,
  ConfirmCloseDialogComponent,
  InfoCustomerSharedComponent,
  InfoContractSharedComponent,
  DropdownTreeComponent
];
const COMPONENTS_DYNAMIC = [Error404Component];
const DIRECTIVES = [
  InputSpecialDirective,
  InputTrimDirective,
  AutoFocusDirective,
  HasPermissionDirective,
  HasNotPermissionDirective,
  FormatCurrencyDirective,
  OnlyNumberDirective,
  MaskDateDirective,
  VtsTemplateDirective,
  DigitOnlyDirective,
  VndFormatDirective
];
const PIPES = [
  DisplayHelperPipe,
  DisplayDatePipe,
  DisplayDateMonthPipe,
  SafePipe,
  FormatCurrencyPipe,
  FindByPipe,
  HighlightSearch,
  RfidStatusPipe,
  VehicleCheckStatusPipe,
  FilterPipe
];

@NgModule({
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC, ...DIRECTIVES, ...PIPES],
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, ...THIRD_MODULES],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    ...THIRD_MODULES,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
  ],
  entryComponents: COMPONENTS_DYNAMIC,
  providers: [
    PropertyResolver,
    { provide: MAT_DATE_LOCALE, useValue: 'vi' },
    { provide: DateAdapter, useClass: CustomDate },
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService],
      useFactory: translate => {
        const service = new PaginatorIntlService();
        service.injectTranslateService(translate);
        return service;
      },
    },
    DatePipe,
  ],
})
export class SharedModule { }

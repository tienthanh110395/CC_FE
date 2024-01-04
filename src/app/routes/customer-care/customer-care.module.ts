import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { SearchAgencyRoutes } from './customer-care-routing.routing';
import { LocationAgencyComponent } from './search-agency/location-agency/location-agency.component';
import { SearchAgencyComponent } from './search-agency/search-agency.component';
import { SearchBotComponent } from './search-bot/search-bot.component';
import { SearchCcComponent } from './search-cc/search-cc.component';
import { ActionAuditTabComponent } from './search-information-customer/action-audit-and-reflection/action-audit/action-audit.component';
import { CoordinateProcessTabComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/detail/coordinate-process/coordinate-process.component';
import { TicketHistoryDetailComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/detail/detail.component';
import { ProcessDetailTabComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/detail/process-detail/process-detail.component';
import { ProcessingTabComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/detail/processing/processing.component';
import { TicketInfoTabComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/detail/ticket-info/ticket-info.component';
import { TicketHistoryComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/ticket-history.component';
import { ChooseCustomerComponent } from './search-information-customer/choose-customer/choose-customer.component';
import { SearchInformationCustomerComponent } from './search-information-customer/search-information-customer.component';
import { TabAccountHistoryComponent } from './search-information-customer/tab-customer-information/tab-account-history/tab-account-history.component';
import { TabContractInformationComponent } from './search-information-customer/tab-customer-information/tab-contract-information/tab-contract-information.component';
import { TabCustomerInformationComponent } from './search-information-customer/tab-customer-information/tab-customer-information.component';
import { TabHistoryInvoiceComponent } from './search-information-customer/tab-customer-information/tab-history-invoice/tab-history-invoice.component';
import { TabImpactHistoryComponent } from './search-information-customer/tab-customer-information/tab-impact-history/tab-impact-history.component';
import { RfidDetailComponent } from './search-information-customer/tab-customer-information/tab-vehicle-list/rfid-detail/rfid-detail.component';
import { TabVehicleListComponent } from './search-information-customer/tab-customer-information/tab-vehicle-list/tab-vehicle-list.component';
import { ProcessTicketTabComponent } from './search-information-customer/ticket/process/process.component';
import { ReceiveTicketTabComponent } from './search-information-customer/ticket/receive/receive.component';
import { SearchTicketTabComponent } from './search-information-customer/ticket/search/search.component';
import { TicketComponent } from './search-information-customer/ticket/ticket.component';
import { SearchProcessComponent } from './search-process/search-process.component';
import { AddNewAttachmentComponent } from './search-process/update-assign-process/attachments/add-new/add-new.component';
import { AttachmentsTabComponent } from './search-process/update-assign-process/attachments/attachments.component';
import { AddNewCommentComponent } from './search-process/update-assign-process/comments/add-new/add-new.component';
import { CommentsTabComponent } from './search-process/update-assign-process/comments/comments.component';
import { TicketAssignHistoryTabComponent } from './search-process/update-assign-process/history/history.component';
import { TicketAssignInfoTabComponent } from './search-process/update-assign-process/info/info.component';
import { UpdateAssignProcessComponent } from './search-process/update-assign-process/update-assign-process.component';
import { PriceListComponent } from './search-bot/price-list/price-list.component';
import { PopupNotiComponent } from './search-information-customer/ticket/process/popup-noti/popup-noti.component';
import { PopupNotifyEmailComponent } from './search-information-customer/ticket/process/popup-notify-email/popup-notify-email.component';
import { TabFileAttachComponent } from './search-information-customer/tab-customer-information/tab-file-attach/tab-file-attach.component';
import { ConfigProcessTimeComponent } from './config-process-time/config-process-time.component';
import { TreeComponentComponent } from '@app/shared/components/tree-component/tree-component.component';
import { AssignHandleReflectComponent } from './assign-handle-reflect/assign-handle-reflect.component';
import { ExtentProcessComponent } from './extent-process/extent-process.component';
import { TabInfoVehicleComponent } from './search-information-customer/tab-info-vehicle/tab-info-vehicle.component';
import { TabProfileAttachComponent } from './search-information-customer/tab-info-vehicle/tab-profile-attach/tab-profile-attach.component';
import { TabHistoryImpactVehicleComponent } from './search-information-customer/tab-info-vehicle/tab-history-impact-vehicle/tab-history-impact-vehicle.component';
import { TabRfidHistoryComponent } from './search-information-customer/tab-info-vehicle/tab-rfid-history/tab-rfid-history.component';
import { TabTransactionHistoryVehicleComponent } from './search-information-customer/tab-info-vehicle/tab-transaction-history-vehicle/tab-transaction-history-vehicle.component';
import { TabTicketPurchaseHistoryComponent } from './search-information-customer/tab-info-vehicle/tab-transaction-history-vehicle/tab-ticket-purchase-history/tab-ticket-purchase-history.component';
import { TabHistoryVehicleStationComponent } from './search-information-customer/tab-info-vehicle/tab-transaction-history-vehicle/tab-history-vehicle-station/tab-history-vehicle-station.component';
import { TabHistoryTransactionOtherComponent } from './search-information-customer/tab-info-vehicle/tab-transaction-history-vehicle/tab-history-transaction-other/tab-history-transaction-other.component';
import { ImpactHistoryTicketComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/detail/impact-history-ticket/impact-history-ticket.component';
import { ReceiveReflectComponent } from './search-information-customer/receive-reflect/receive-reflect.component';
import { StatisticComponent } from './search-information-customer/statistic/statistic.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketProcessComponent } from './search-cc/ticket-process/ticket-process.component';
import { TicketStatisticsSearchComponent } from './ticket-statistics-search/ticket-statistics-search.component';
import { TicketReportPerformmanceComponent } from './ticket-report-performmance/ticket-report-performmance.component';
import { ImpactHistoryTicketDetailComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/detail/impact-history-ticket/impact-history-ticket-detail/impact-history-ticket-detail.component';
import { TicketEditComponent } from './search-cc/ticket-edit/ticket-edit.component';
import { TicketExtentComponent } from './search-cc/ticket-extent/ticket-extent.component';
import { TicketErrorCauseComponent } from './ticket-error-cause/ticket-error-cause.component';
import { AddEditTicketErrorCauseComponent } from './ticket-error-cause/add-edit-ticket-error-cause/add-edit-ticket-error-cause.component';
import { ViewTicketErrorCauseComponent } from './ticket-error-cause/view-ticket-error-cause/view-ticket-error-cause.component';
import { TicketEditHistoryComponent } from './search-information-customer/action-audit-and-reflection/ticket-history/ticket-edit-history/ticket-edit-history.component';
import { TicketTypeComponent } from './ticket-type/ticket-type.component';
import { ViewTicketTypeComponent } from './ticket-type/view-ticket-type/view-ticket-type.component';
import { EditAddTicketTypeComponent } from './ticket-type/edit-add-ticket-type/edit-add-ticket-type.component';
import { TicketExpireCauseComponent } from './ticket-expire-cause/ticket-expire-cause.component';
import { ViewTicketExpireCauseComponent } from './ticket-expire-cause/view-ticket-expire-cause/view-ticket-expire-cause.component';
import { AddEditTicketExpireCauseComponent } from './ticket-expire-cause/add-edit-ticket-expire-cause/add-edit-ticket-expire-cause.component';
import { ApproveTicketComponent } from './approve-ticket/approve-ticket.component';
import { RejectTicketStatusComponent } from './approve-ticket/reject-ticket-status/reject-ticket-status.component';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { EtagChangeRegisComponent } from './etag-change-regis/etag-change-regis.component';
import { ListOrderComponent } from './etag-change-regis/list-order/list-order.component';
import { RegisterComponent } from './etag-change-regis/register/register.component';
import { SaveEtagRegisterComponent } from './etag-change-regis/register/save-etag-register/save-etag-register.component';
import { TabVietmapComponent } from './search-information-customer/tab-customer-information/tab-vietmap/tab-vietmap.component';
import { VietmapDetailsComponent } from './search-information-customer/tab-customer-information/tab-vietmap/vietmap-details/vietmap-details.component';
import {TableColumnDirective} from "@shared/directives/table-column.directive";
@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    SearchAgencyRoutes,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
  ],
  declarations: [
    SearchAgencyComponent,
    LocationAgencyComponent,
    SearchBotComponent,
    SearchCcComponent,
    SearchProcessComponent,
    SearchInformationCustomerComponent,
    TabCustomerInformationComponent,
    TabContractInformationComponent,
    TabVehicleListComponent,
    TabImpactHistoryComponent,
    ChooseCustomerComponent,
    TabAccountHistoryComponent,
    TabHistoryInvoiceComponent,
    TicketHistoryComponent,
    TicketHistoryDetailComponent,
    TicketInfoTabComponent,
    ProcessDetailTabComponent,
    CoordinateProcessTabComponent,
    ProcessingTabComponent,
    TicketComponent,
    ReceiveTicketTabComponent,
    SearchTicketTabComponent,
    ProcessTicketTabComponent,
    RfidDetailComponent,
    UpdateAssignProcessComponent,
    TicketAssignInfoTabComponent,
    AttachmentsTabComponent,
    TicketAssignHistoryTabComponent,
    CommentsTabComponent,
    AddNewAttachmentComponent,
    AddNewCommentComponent,
    ActionAuditTabComponent,
    PriceListComponent,
    PopupNotiComponent,
    PopupNotifyEmailComponent,
    TabFileAttachComponent,
    ConfigProcessTimeComponent,
    TreeComponentComponent,
    AssignHandleReflectComponent,
    ExtentProcessComponent,
    TabInfoVehicleComponent,
    TabProfileAttachComponent,
    TabHistoryImpactVehicleComponent,
    TabRfidHistoryComponent,
    TabTransactionHistoryVehicleComponent,
    TabTicketPurchaseHistoryComponent,
    TabHistoryVehicleStationComponent,
    TabHistoryTransactionOtherComponent,
    ImpactHistoryTicketComponent,
    ReceiveReflectComponent,
    StatisticComponent,
    TicketProcessComponent,
    TicketStatisticsSearchComponent,
    TicketReportPerformmanceComponent,
    ImpactHistoryTicketDetailComponent,
    TicketEditComponent,
    TicketEditHistoryComponent,
    TicketExtentComponent,
    TicketTypeComponent,
    ViewTicketTypeComponent,
    EditAddTicketTypeComponent,
    TicketExpireCauseComponent,
    ViewTicketExpireCauseComponent,
    AddEditTicketExpireCauseComponent,
    TicketErrorCauseComponent,
    AddEditTicketErrorCauseComponent,
    ViewTicketErrorCauseComponent,
    ApproveTicketComponent,
    RejectTicketStatusComponent,
    EtagChangeRegisComponent,
    ListOrderComponent,
    RegisterComponent,
    SaveEtagRegisterComponent,
    TabVietmapComponent,
    VietmapDetailsComponent,
    TableColumnDirective,
    TableColumnDirective,
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class CustomCareModule { }

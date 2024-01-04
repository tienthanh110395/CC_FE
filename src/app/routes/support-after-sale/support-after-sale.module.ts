import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "@app/shared";
import { CancelDetailComponent } from "./cancel-ticket-refund/cancel-detail/cancel-detail.component";
import { CancelTicketRefundComponent } from "./cancel-ticket-refund/cancel-ticket-refund.component";
import { RequiedRefundComponent } from "./cancel-ticket-refund/requied-refund/requied-refund.component";
import { ChangeInfoCustomerContractVehicleComponent } from "./change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.component";
import { ChooseContractComponent } from "./change-info-customer-contract-vehicle/choose-contract/choose-contract.component";
import { ContractInfoComponent } from "./change-info-customer-contract-vehicle/contract-info/contract-info.component";
import { AuthorizedComponent } from "./change-info-customer-contract-vehicle/customer-info/authorized/authorized.component";
import { CustomerInfoComponent } from "./change-info-customer-contract-vehicle/customer-info/customer-info.component";
import { RepresentativeComponent } from "./change-info-customer-contract-vehicle/customer-info/representative/representative.component";
import { ChangeCardComponent } from "./change-info-customer-contract-vehicle/vehicle-info/change-card/change-card.component";
import { ChangeInfoComponent } from "./change-info-customer-contract-vehicle/vehicle-info/change-info/change-info.component";
import { ChangePlateComponent } from "./change-info-customer-contract-vehicle/vehicle-info/change-plate/change-plate.component";
import { VehicleInfoComponent } from "./change-info-customer-contract-vehicle/vehicle-info/vehicle-info.component";
import { DetachContractComponent } from "./detach-contract/detach-contract.component";
import { EndContractComponent } from "./end-contract/end-contract.component";
import { MergeContractComponent } from "./merge-contract/merge-contract.component";
import { NewContractComponent } from "./new-contract/new-contract.component";
import { ChooseCustomerComponent } from "./reset-password-lock-open-account/choose-customer/choose-customer.component";
import { ResetPasswordLockOpenAccountComponent } from "./reset-password-lock-open-account/reset-password-lock-open-account.component";
import { LockAccComponent } from "./reset-password-lock-open-account/tab-customer-info/lock-acc/lock-acc.component";
import { ResetPassComponent } from "./reset-password-lock-open-account/tab-customer-info/reset-pass/reset-pass.component";
import { TabCustomerInfoComponent } from "./reset-password-lock-open-account/tab-customer-info/tab-customer-info.component";
import { AttachedFileComponent } from "./reset-password-lock-open-account/tab-vehicle-info/attached-file/attached-file.component";
import { ImpactHistoryComponent } from "./reset-password-lock-open-account/tab-vehicle-info/impact-history/impact-history.component";
import { RfidHistoryComponent } from "./reset-password-lock-open-account/tab-vehicle-info/rfid-history/rfid-history.component";
import { TabVehicleInfoComponent } from "./reset-password-lock-open-account/tab-vehicle-info/tab-vehicle-info.component";
import { DealOtherHistoryComponent } from "./reset-password-lock-open-account/tab-vehicle-info/transaction-history/deal-other-history/deal-other-history.component";
import { TicketPurchaseHistoryComponent } from "./reset-password-lock-open-account/tab-vehicle-info/transaction-history/ticket-purchase-history/ticket-purchase-history.component";
import { TransactionHistoryComponent } from "./reset-password-lock-open-account/tab-vehicle-info/transaction-history/transaction-history.component";
import { VehicleStationHistoryComponent } from "./reset-password-lock-open-account/tab-vehicle-info/transaction-history/vehicle-station-history/vehicle-station-history.component";
import { LockAccountComponent } from "./reset-password-lock-open-agency/lock-account/lock-account.component";
import { ResetAccountComponent } from "./reset-password-lock-open-agency/reset-account/reset-account.component";
import { ResetPasswordLockOpenAgencyComponent } from "./reset-password-lock-open-agency/reset-password-lock-open-agency.component";
import { UnlockAccountComponent } from "./reset-password-lock-open-agency/unlock-account/unlock-account.component";
import { SupportAfterSale } from "./support-after-sale-routing.routing";
import { TransferOwnVehicleComponent } from "./transfer-own-vehicle/transfer-own-vehicle.component";
import { UpdateCancelTicketNoRefundComponent } from "./update-cancel-ticket-no-refund/update-cancel-ticket-no-refund.component";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    SupportAfterSale
  ],
  declarations: [
    ResetPasswordLockOpenAccountComponent,
    ChangeInfoCustomerContractVehicleComponent,
    ResetPasswordLockOpenAgencyComponent,
    TransferOwnVehicleComponent,
    MergeContractComponent,
    DetachContractComponent,
    EndContractComponent,
    CancelTicketRefundComponent,
    CancelDetailComponent,
    RequiedRefundComponent,
    UpdateCancelTicketNoRefundComponent,
    LockAccountComponent,
    UnlockAccountComponent,
    ChooseCustomerComponent,
    TabCustomerInfoComponent,
    TabVehicleInfoComponent,
    RfidHistoryComponent,
    ImpactHistoryComponent,
    TransactionHistoryComponent,
    DealOtherHistoryComponent,
    TicketPurchaseHistoryComponent,
    VehicleStationHistoryComponent,
    AttachedFileComponent,
    ChooseContractComponent,
    CustomerInfoComponent,
    ContractInfoComponent,
    VehicleInfoComponent,
    RepresentativeComponent,
    AuthorizedComponent,
    ResetPassComponent,
    LockAccComponent,
    ResetAccountComponent,
    NewContractComponent,
    ChangeCardComponent,
    ChangePlateComponent,
    ChangeInfoComponent
  ], schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class SupportAfterSaleModule { }

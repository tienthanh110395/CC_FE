import { RouterModule, Routes } from "@angular/router";
import { CancelTicketRefundComponent } from "./cancel-ticket-refund/cancel-ticket-refund.component";
import { ChangeInfoCustomerContractVehicleComponent } from "./change-info-customer-contract-vehicle/change-info-customer-contract-vehicle.component";
import { DetachContractComponent } from "./detach-contract/detach-contract.component";
import { EndContractComponent } from "./end-contract/end-contract.component";
import { MergeContractComponent } from "./merge-contract/merge-contract.component";
import { NewContractComponent } from "./new-contract/new-contract.component";
import { ResetPasswordLockOpenAccountComponent } from "./reset-password-lock-open-account/reset-password-lock-open-account.component";
import { ResetPasswordLockOpenAgencyComponent } from "./reset-password-lock-open-agency/reset-password-lock-open-agency.component";
import { TransferOwnVehicleComponent } from "./transfer-own-vehicle/transfer-own-vehicle.component";
import { UpdateCancelTicketNoRefundComponent } from "./update-cancel-ticket-no-refund/update-cancel-ticket-no-refund.component";

const routes: Routes = [
  {
    path: 'reset-password-lock-open-account',
    component: ResetPasswordLockOpenAccountComponent,
    data: {
      title: 'menu.support-after-sale.reset-password-lock-open-account'
    }
  },
  {
    path: 'change-info-customer-contract-vehicle',
    component: ChangeInfoCustomerContractVehicleComponent,
    data: {
      title: 'menu.support-after-sale.change-info-customer-contract-vehicle'
    }
  },
  {
    path: 'reset-password-lock-open-agency',
    component: ResetPasswordLockOpenAgencyComponent,
    data: {
      title: 'menu.support-after-sale.reset-password-lock-open-agency'
    }
  },
  {
    path: 'transfer-own-vehicle',
    component: TransferOwnVehicleComponent,
    data: {
      title: 'menu.support-after-sale.transfer-own-vehicle'
    }
  },
  {
    path: 'merge-contract',
    component: MergeContractComponent,
    data: {
      title: 'menu.support-after-sale.merge-contract'
    }
  },
  {
    path: 'detach-contract',
    component: DetachContractComponent,
    data: {
      title: 'menu.support-after-sale.detach-contract'
    }
  },
  {
    path: 'new-contract',
    component: NewContractComponent,
    data: {

    }
  },
  {
    path: 'end-contract',
    component: EndContractComponent,
    data: {
      title: 'menu.support-after-sale.end-contract'
    }
  },
  {
    path: 'cancel-ticket-refund',
    component: CancelTicketRefundComponent,
    data: {
      title: 'menu.support-after-sale.cancel-ticket-refund'
    }
  },
  {
    path: 'update-cancel-ticket-no-refund',
    component: UpdateCancelTicketNoRefundComponent,
    data: {
      title: 'menu.support-after-sale.update-cancel-ticket-no-refund'
    }
  },
];

export const SupportAfterSale = RouterModule.forChild(routes);

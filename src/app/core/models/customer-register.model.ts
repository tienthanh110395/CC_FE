export class CustomerInforModel {
  customerTypeId?: number;
  customerType: number;
  customerName?: string;
  customerCode: number;
  numberPhone: string;
  fullName?: string;
  dateOfBirth?: Date;
  gender?: number;
  genderName?: string;
  cardId: string;
  dateRange: Date;
  placeOfIssue: string;
  city: string;
  cityName?: string;
  district: string;
  districtName?: string;
  ward: string;
  wardName?: string;
  street: string;
  address: string;
  email?: string;
  documentType: string;
  documentNumber: string;
  documentName?: string;
  companyName?: string;
  taxNo?: string;
  foundingDate?: Date;
  step?: number;
  plateNumberVtp?: string
}

export class ContractInforModel {
  contractId?: number;
  contractNumber: string;
  signDay: Date;
  staff: string;
  effectiveDate: Date;
  expiryDate: Date;
  signer: string;
  dateOfBirth: Date;
  gender?: boolean;
  documentType: string;
  documentNumber: string;
  dateRange: Date;
  placeOfIssue: string;
}

export class ContractTCBModel {
  fullName: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  address: string;
  numberPhone: string;
  email?: string;
}

export class PayAccountModel {
  accountType: string;
  walletName: string;
  accountNumber: string;
  accountOwner: string;
  accountGovernmental?: boolean;
}

export class RegisterServiceModel {
  packageRegister?: string;
  invoiceCycle?: string;
  receiveEmail?: boolean;
  receiveNotify?: boolean;
  receiveSMS?: boolean;
}

export class UpdateProfileModel {
  license?: string;
}

export class ContractRegisterModel {
  newContractInforForm: ContractInforModel;
  contractTCBForm: ContractTCBModel;
  registerServiceForm: RegisterServiceModel;
  updateProfileForm: UpdateProfileModel;
}

export class VehicleInforModel {
  vehicleId?: number;
  licensePlates: string;
  vehicleOwner: string;
  vehicleType: string;
  vehicleWeight: number;
  merchandiseWeight: number;
  vehiclesTypeFee: string;
  allWeight: number;
  followWeight?: number;
  seatsNumber: number;
  vehicleNumber?: string;
  framesNumber?: string;
  color?: string;
  label?: string;
  vehiclesSeri?: string;
  licensePlateType: string;
  staff: string;
  seriNumber: string;
}

export class VehicleRegisterModel {
  isSave: boolean;
  newVehicleRegisterForm: VehicleInforModel;
  updateProfileForm: UpdateProfileModel;
}

export class RepresentativeEnterpriseModel {
  fullName: string;
  dateOfBirth: Date;
  gender: boolean;
  documentType: string;
  documentNumber: string;
  dateRange: Date;
  placeOfIssue: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  address: string;
  numberPhone?: string;
  email?: string;
}

export class InforRegisterVehicleModel {
  customerId?: number;
  contractId?: number;
  contractNo?: string;
}

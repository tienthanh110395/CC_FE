export class SelectOptionModel {
  id?: number;
  code: string;
  value: string;
  name?: string;
}

export class AttachFileModel {
  fileName: string;
  fileSize: string;
  fileBase64: string;
  fullBase64: string;
}

export class CreateVehicleSuccessModel {
  customerId?: number;
  contractId?: number;
  vehicleId?: number;
}

export class SelectOptionCategory {
  code: string;
  name: string;
  value: string;
  cust_type_id?: number;
  act_type_id?: number;
}

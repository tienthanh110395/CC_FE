export const HTTP_CODE = {
  SUCCESS: 1, // Thành công
  NOT_EXIT_VEHICLE_GROUP: 5,
  UNDEFINED: 500,
  VEHICLE_CAN_NOT_DELETE: 10,
};

export const PLATE_TYPE_COLOR = {
  WHITE: '1',
  BLUE: '2',
  RED: '3',
  NGOAI_GIAO: '4',
  NUOC_NGOAI: '5',
  YELLOW: '6',
};

export const CC_PRIORITY = {
  NORMAL: 1,
  HOT: 2,
  VIP: 3,
};

export const CC_TICKET_STATUS = {
  TAO_MOI: 1,
  DANG_XU_LY: 2,
  XU_LY_XONG: 3,
  KET_LUAN: 4,
  DONG: 5,
  HUY: 6,
  THEO_DOI: 7,
};
export const IMPORT_FILE = {
  FileDC: 1,
};
export const TICKET_ASSIGN_STATUS = {
  NEW: 1,
  CANCEL: 7,
  REJECT: 6,
  RECEIVE: 2,
  CONCLUDE: 3,
  COMPLETE: 4,
  CLOSE: 5,
};
export const ACTION_TYPE = {
  DANG_KY_KH: 2,
  DANG_KY_PT: 3,
  THAY_DOI_KH: 4,
  THAY_DOI_PT: 5,
  KHOA_TK_KH: 8,
  KYMOIHOPDONG: 11,
  KYPHULUCHOPDONG: 12,
  THAY_DOI_HD: 14,
  TACH_HD: 15,
  GOP_HD: 16,
  CHAM_DUT_HD: 17,
  CHUYENTHE: 19,
  CHUYEN_CHU_QUYEN_PT: 23,
  MUA_VE_THANG_QUY: 24,
  HUY_VE_THANG_QUY: 25,
  NAP_TIEN_VAO_TK: 32,
  RESET_MAT_KHAU: 33,
  GAN_THE: 42,
  HUY_VE_CO_HOAN_TIEN: 37,
  HUY_VE_KHONG_HOAN_TIEN: 38,
  KH_YEUCAU_UNLOCKACC: 34,
  TICKET_ADD: 3001,
  TICKET_EDIT: 3002,
  TICKET_ASSIGN: 3004,
  TICKET_RECEIVE: 3005,
  TICKET_PROCESS: 3006,
  TICKET_HOT: 3007,
  TICKET_REPEAT: 3008,
  TICKET_EVALUTED: 3009,
  TICKET_CLOSE: 3010,
  TICKET_CREATE_SR: 3012,
  TICKET_DESTROY: 3020,
  TICKET_FOLLOW: 3022,
  TICKET_CREATE_ADJUST: 3033,
  SR_PROCESS: 3016,
  SR_RECEIVE: 3015,
  SR_CLOSE: 3018,
  SR_EVALUTED: 3017,
  SR_REOPEN: 3019,
  SR_REJECT: 3034,
  TICKET_EXTENT_REQUEST: 3013,
  TICKET_APPROVE_EXTENT_REQUEST: 3014,
  TICKET_REJECT_EXTENT_REQUEST: 3041,
  EIDT_TICKET_EXTENT_REQUEST: 3040,
  CONTRACT_PROFILE_APPROVE: 4001,
  CONTRACT_PROFILE_REJECT: 4002,
  VEHICLE_PROFILE_APPROVE: 4003,
  VEHICLE_PROFILE_REJECT: 4004,
  REJECT_APPROVE_CONTRACT: 4005,
};
export const ACTION_REASON = {
  THAY_DOI_THONGTIN_KH: 4,
  KH_YEUCAU_LOCKACC: 8,
  KH_YEUCAU_RESETMK: 33,
};

export const STATUS_RFID_VEHICLE = {
  CHUAKICHHOAT: '0',
  HOATDONG: '1',
  HUY: '2',
  DONG: '3',
  MO: '4',
  DACHUYENNHUONG: '5',
};

export const STATUS_CONTRACT = {
  CHUAHOATDONG: '1',
  HOATDONG: '2',
  HUY: '3',
  CHAMDUT: '4',
};

export const STATUS_CUSTOMER = {
  CHUAHOATDONG: '0',
  HOATDONG: '1',
};

export const CUSTOMER_TYPE = {
  CA_NHAN: 1,
  DOANH_NGHIEP: 2,
};

export const CUSTOMER_TYPE_ID = {
  CA_NHAN_TRONG_NUOC: 1,
  CONG_TY_CO_PHAN: 2,
  CONG_TY_TNHH: 3,
  DOANH_NGHIEP_NHA_NUOC: 4,
  DOANH_NGHIEP_TU_NHAN: 5,
  CO_QUAN_NHA_NUOC: 6,
  CA_NHAN_NUOC_NGOAI: 7,
};

export const gender = [
  {
    code: '1',
    value: 'Nam',
  },
  {
    code: '2',
    value: 'Nữ',
  },
  {
    code: '3',
    value: 'Không xác định',
  },
];

export const OptionVehicle = [
  {
    code: '1',
    value: 'Đổi thẻ',
  },
  {
    code: '2',
    value: 'Đổi biển',
  },
  {
    code: '3',
    value: 'Thay đổi thông tin',
  },
];

export const TRANSACTION_STATUS = {
  UNPAID: 1,
  PAID_NO_INVOICE: 2,
  BILLED: 3,
  CANCEL: 4,
};

export const BUY_TICKET = {
  TRAM_KIN: 0,
  TRAM_MO: 1,
  TINH_THUONG: '1',
  TINH_BLOCK: '2',
  STATUS: 2,
};

export const BOT_COMFIRM = {
  SUCCESS: 1,
  REJECT: 2,
  RECEIVED: 3,
};
export const STATUS_VEHICLE = {
  KHONGHOATDONG: '0',
  HOATDONG: '1',
  IMPORT: '2',
  KHOP: '3',
  KHONGKHOP: '4',
};
export const RFID_STATUS = {
  CHUAKICHHOAT: '0',
  HOATDONG: '1',
  HUY: '2',
  DONG: '3',
  MO: '4',
  DACHUYENNHUONG: '5',
};
export const VEHICLE_GROUP = {
  LOAI1: '1',
  LOAI2: '2',
  LOAI3: '3',
  LOAI4: '4',
  LOAI5: '5',
};

export const SPECIAL_PRIORITY = {
  VEHICLE: 1,
  TICKET: 2,
  PRIORITY: 3,
  FORBIDDEN: 4,
};

export const SERVICE_PLAN_TYPE = {
  UUTIEN: '2',
  TOANQUOC: '10',
  THANG: '16',
  QUY: '17',
};

export const STATUS_SPECIAL_VEHICLE = {
  CREATE_NEW: 1, // tạo mới
  PENDING: 2, // chờ duyệt
  REJECT: 3, // từ chối duyệt
  APPROVED: 4, // đã duyệt
  ACTIVATED: 5, // đang hiệu lực
  INACTIVED: 6, // hết hiệu lực
  CANCELLED_EXPIRE: 7, // đã hủy hiệu lực
};

export const STATUS_BRIEFCASE = {
  CHUATIEPNHAN: '1',
  DAPHEDUYET: '2',
  BITUCHOI: '3',
  BOSUNG: '4',
};

export const STATUS_CONTRACT_PROFILE = {
  CT_DACO: 1,
  CT_THIEU: 2,
  CT_GIAMAO: 3,
};

export const STATUS_CONTRACT_VEHICLE = {
  PHE_DUYET: 1,
  TU_CHOI: 2,
};

export const CC_TICKET_KIND = {
  PHAT_SINH: 1,
  DON_LE: 2,
};

export const CC_CUST_REACT = {
  OK: 1,
  NOK: 2,
  ANGRY: 3,
};

export const CC_STATUS_REACT = {
  EXPIRE: 0,
  EFFECT: 1,
};

export const CC_PROCESS_TYPE = {
  NO_TIME_DIE: 0,
  ROUNDING_24H: 1,
  MINUS_TIME: 2,
  DIFFERENCE: 4,
};

export const CC_TIME_TYPE = {
  DAY: 1,
  HOUR: 2,
};

export const STATUS_APPROVE = {
  REJECT: '0',
  NOT_APPROVE: '1',
  APPROVE: '2',
};

export const REGISTER_STATUS = {
  DON_MOI: '1',
  DON_DA_XU_LY: '2',
  DON_HUY: '3',
};

export const SYNC_STATUS = {
  DA_DONG_BO: '1',
  CHUA_DONG_BO: '2',
};

export const GROUP_REFLECTS_STATUS = {
  TAT_CA: '-1',
  HIEU_LUC: '1',
  HET_HIEU_LUC: '0',
};
export const GROUP_REFLECTS_GROUP = {
  NHOM_1: '1',
  NHOM_2: '2',
  NHOM_3: '3',
};

export const STATUS_TICKET_TYPE = {
  CREATE_NEW: 2, // tạo mới
  ACTIVATED: 1, // đang hiệu lực
  INACTIVED: 0, // hết hiệu lực
};

export const LEVEL_REASON_ERROR = {
  LEVEL_1: 1, // tạo mới
  LEVEL_2: 2, // đang hiệu lực
  LEVEL_3: 3, // hết hiệu lực
};

export const STATUS_CATE_CONFIG = {
  DANG_HIEU_LUC: 1, // đang hiệu lực
  KHONG_HIEU_LUC: 0, // không hiệu lực
};

export const TICKET_EXPIRE_CAUSE_LEVEL = {
  LEVEL_1: 1, // Cấp 1
  LEVEL_2: 2, // Cấp 2
  LEVEL_3: 3, // Cấp 3
};


export const TICKET_SITE_LEVEL = {
  LEVEL_1: 1, // Cấp 1
  LEVEL_2: 2, // Cấp 2
  LEVEL_3: 3, // Cấp 3
};

export const TICKET_EXPIRE_CAUSE_LEVEL_SEARCH = {
  TAT_CA: '0',
  CAP_1: '1',
  CAP_2: '2',
  CAP_3: '3',
};

export const TICKET_ERROR_CAUSE_LEVEL_SEARCH = {
  TAT_CA: '0',
  CAP_1: '1',
  CAP_2: '2',
  CAP_3: '3',
};
export const LEVEL_STATISTICS_TYPE = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5,
};

export const LIST_CATE_TYPE = {
  THOI_GIAN_XU_LY: 4008,
  NHOM_PHAN_ANH: 4009,
  THE_lOAI_PHAN_ANH: 4010,
  LOAI_PHAN_ANH: 4011,
  MUC_DO_UU_TIEN: 4012,
  NGUYEN_NHAN_LOI: 4013,
  NGUYEN_NHAN_QUA_HAN: 4014,
  DON_VI_CHIU_TRACH_NHIEM: 4015,
  MAP_NGUYEN_NHAN_LOI: 4016,
  DANH_MUC_THONG_KE: 4017,
  CAU_HINH_THONG_BAO: 4018
};

export const LIST_IMPACT_TYPE = {
  THEM_MOI: "INSERT",
  CAP_NHAT: "UPDATE",
};

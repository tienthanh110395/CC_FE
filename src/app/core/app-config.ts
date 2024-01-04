export const PERMISSION_CODE: any = {
  // action tac dong
  'action.view': 'VIEW',
  'action.insert': 'INSERT',
  'action.update': 'UPDATE',
  'action.delete': 'DELETE',
  'action.import': 'IMPORT',
  'action.export': 'EXPORT',
};

export enum RESOURCE {
  CC_CUSTOMER = 'CC_CUSTOMER',
  CC_VEHICLE = 'CC_VEHICLE',
  CC_PROFILE = 'CC_PROFILE',
  CC = 'CC',
  CC_CATE_CONFIG = 'CC_CATE_CONFIG',
  CC_PROCESSING_TIME_CONFIG = 'CC_PROCESSING_TIME_CONFIG',
  CC_EXPIRE_CAUSE = 'CC_EXPIRE_CAUSE',
  CC_SITE = 'CC_SITE',
  CC_LEVEL_CATE = 'CC_LEVEL_CATE',
  CC_IMPACT_LOG = 'CC_IMPACT_LOG'
};

export enum PERMISSION {
  VIEW = 'action.view',
  INSERT = 'action.insert',
  DELETE = 'action.delete',
  UPDATE = 'action.update',
  CC_CUSTOMER_01 = 'CC_CUSTOMER_01', //Tra cứu thông tin khách hàng
  CC_CUSTOMER_02 = 'CC_CUSTOMER_02', //Tra cứu, báo cáo phản ánh
  CC_CUSTOMER_03 = 'CC_CUSTOMER_03', //Tiếp nhận, xử lý YC phối hợp hỗ trợ
  CC_CUSTOMER_04 = 'CC_CUSTOMER_04', //Tra cứu thông tin BOT
  CC_CUSTOMER_05 = 'CC_CUSTOMER_05', //Tra cứu đại lý/điểm bán
  CC_VEHICLE_01 = 'CC_VEHICLE_01', //DS phương tiện ưu tiên/cấm
  CC_VEHICLE_02 = 'CC_VEHICLE_02', //DS phương tiện ngoại lệ
  CC_PROFILE_01 = 'CC_PROFILE_01', //Tra cứu hồ sơ
  CC_PROFILE_02 = 'CC_PROFILE_02', //Phê duyệt hồ sơ
  CC_PROFILE_03 = 'CC_PROFILE_03', //Bổ sung hồ sơ
  CC_PROFILE_04 = 'CC_PROFILE_04', //Báo cáo quản lý hồ sơ
  CC_01 = 'CC_01', //Reset mật khẩu/khóa/mở khóa TK CPT
  CC_02 = 'CC_02', //Thay đổi thông tin KH, HĐ, PT, gán/kích hoạt thẻ
  CC_03 = 'CC_03', //Reset mật khẩu/khóa/mở khóa TK app đại lý
  CC_04 = 'CC_04', //Chuyển chủ quyền phương tiện
  CC_05 = 'CC_05', //Gộp hợp đồng
  CC_06 = 'CC_06', //Tách hợp đồng
  CC_07 = 'CC_07', //Hủy hợp đồng
  CC_08 = 'CC_08', //Hủy vé tháng quý có hoàn tiền
  CC_09 = 'CC_09', //Thay đổi gia han, hủy vé tháng quý không hoàn tiền

};

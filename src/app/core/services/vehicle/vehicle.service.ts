import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonUtils } from '@app/shared/services/common-utils.service';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';

@Injectable({
  providedIn: 'root',
})
export class VehicleService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  getDetailVehicle(vehicleId) {
    const url = `${this.serviceUrl}/customers/contracts/vehicles/${vehicleId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  vehicleRegister(customerId, contractId, body) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/vehicles`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  searchVehiclesAssignRFID(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/vehicles/assigned-rfid`;
    return this.getRequest(url, { params: buildParams });
  }

  searchVehiclesNotAssignRFID(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/vehicles/not-assign-rfid`;
    return this.getRequest(url, { params: buildParams });
  }

  searchDetailsVehicle(data?: any, vehicleId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/vehicles/${vehicleId}`;
    return this.getRequest(url, { params: buildParams });
  }

  searchActionVehicleHistories(
    data?: any,
    customerId?: number,
    contractId?: number,
    vehicleId?: number
  ) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/vehicles/${vehicleId}/act-vehicle-histories`;
    return this.getRequest(url, { params: buildParams });
  }

  searchVehicleProfiles(data?: any, vehicleId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/vehicles/${vehicleId}/profiles`;
    return this.getRequest(url, { params: buildParams });
  }
  downloadProfileByVehicle(vehicleId: number) {
    const url = `${this.serviceUrl}/customers/contracts/vehicles/profiles/${vehicleId}/download`;
    return this.postRequestFile(url);
  }

  updateVehicle(customerId, contractId, vehicleId, body) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/vehicles/${vehicleId}`;
    return this.putRequest(url, body);
  }

  searchOtherTransaction(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/contracts/${contractId}/other-transaction-histories`;
    return this.getRequest(url, { params: buildParams });
  }

  searchHistoryTransactionVehicle(data?: any, vehicles?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/vehicles/${vehicles}/ticket-purchase-histories`;
    return this.getRequest(url, { params: buildParams });
  }

  searchHistoryVehicleTicket(contractId: number) {
    const url = `${this.serviceUrl}/ticket-purchase-efficiency-histories?contractId=${contractId}`;
    return this.getRequest(url);
  }

  searchHistoryVehicleTicketRequest(contractId: number, pagesize: number, startrecord: number) {
    const url = `${this.serviceUrl}/ticket/del-boo1/${contractId}?pagesize=${pagesize}&startrecord=${startrecord}`;
    return this.getRequest(url);
  }

  getFee(data: any) {
    const url = `${this.serviceUrl}/service-plans/fee-boo`;
    return this.postRequest(url, { "servicePlanDTOList": data });
  }

  vehicleRegisterInfor(body) {
    const url = `${this.serviceUrl}/vehicles-registry-info`;
    return this.postRequest(url, body);
  }

  assignRfid(customerId, contractId, body) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/vehicles/assign-rfid`;
    return this.postRequest(url, body);
  }

  vehicleAssignedExport(contractId) {
    const url = `${this.serviceUrl}/contracts/${contractId}/vehicles-assigned-export`;
    return this.postRequestFile(url);
  }

  getBalance(customerId, contractId) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/ocsInfo`;
    return this.getRequest(url);
  }

  activeRFID(form: any, id: number) {
    const url = `${this.serviceUrl}/vehicles/${id}/active`;
    return this.postRequestFile(url, form);
  }
  lockRFID(form: any, id: number) {
    const url = `${this.serviceUrl}/vehicles/${id}/lock`;
    return this.putRequest(url, form);
  }
  unLockRFID(form: any, id: number) {
    const url = `${this.serviceUrl}/vehicles/${id}/unlock`;
    return this.putRequest(url, form);
  }
  swapRFID(id: number, rfidDTO: any) {
    const url = `${this.serviceUrl}/vehicles/${id}/swap`;
    return this.putRequest(url, rfidDTO);
  }
  destroyRFID(id: number, rfidDTO: any) {
    const url = `${this.serviceUrl}/vehicles/${id}/destroy`;
    return this.deleteRequest(url, rfidDTO);
  }

  getBuyTicketCharge(customerId, contractId, body) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/charge-ticket-boo`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }
  activeMutilRFID(form: any, ids: Array<number>) {
    const strId = ids.join(',');
    const url = `${this.serviceUrl}/vehicles/${strId}/actives`;
    return this.postRequest(url, form);
  }
  updateProfileVehicles(vehicleId, body) {
    const url = `${this.serviceUrl}/vehicles/${vehicleId}/profiles`;
    return this.putRequest(url, body);
  }

  downloadProfileVehicle(idProfile) {
    const url = `${this.serviceUrl}/customers/contracts/vehicles/profiles/${idProfile}/download`;
    return this.postRequestFile(url);
  }

  deleteProfileVehicle(vehicleId, profileId, body) {
    const url = `${this.serviceUrl}/vehicles/${vehicleId}/profiles/${profileId}`;
    return this.putRequest(url, body);
  }

  transferVehicle(body) {
    const url = `${this.serviceUrl}/transfer-vehicles`;
    return this.putRequest(url, body);
  }

  getVehicleRegistry(plateNumber) {
    const url = `${this.serviceUrl}/vehicles/registry-info/${plateNumber}`;
    return this.getRequest(url);
  }
  findProfileByVehicleAll(vehicleId: number, actTypeId: number) {
    const url = `${this.serviceUrl}/customers/contracts/vehicles/${vehicleId}/profiles/all?actTypeId=${actTypeId}`;
    return this.getRequest(url);
  }
  getVehiclesByPlateNumber(data: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/vehicles`;
    return this.getRequest(url, { params: buildParams });
  }
  swapPlateNumber(vehicleId: number, vehicleSwapPlateNumberDTO: any) {
    const url = `${this.serviceUrl}/vehicles/${vehicleId}/swap-plate-numbers`;
    return this.postRequest(url, vehicleSwapPlateNumberDTO);
  }
  getListVehicleException(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/vehicles-exception/results`;
    return this.getRequest(url, { params: buildParams });
  }

  getDetailVehicleException(exceptionListId) {
    const url = `${this.serviceUrl}/vehicles-exception/${exceptionListId}`;
    return this.getRequest(url);
  }

  deleteVehicleException(id) {
    const url = `${this.serviceUrl}/vehicles-exception/${id}`;
    return this.deleteRequest(url);
  }

  exportVehicleException(dataParam) {
    const url = `${this.serviceUrl}/vehicles-exception/export-excel`;
    return this.postRequestFile(url, dataParam);
  }

  getDetailVehicleByPlateNumber(data) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/vehicles`;
    return this.getRequest(url, { params: buildParams });
  }

  saveVehicleException(data) {
    const url = `${this.serviceUrl}/vehicles-exception/add`;
    return this.postRequest(url, data);
  }

  updateVehicleException(data) {
    const url = `${this.serviceUrl}/vehicles-exception/${data.exceptionListId}`;
    return this.putRequest(url, data);
  }

  downloadDocumentFile(attachmentFileId) {
    const url = `${this.serviceUrl}/vehicles-exception/download-attachment-file/${attachmentFileId}`;
    return this.postRequestFile(url);
  }

  approveVehicleException(data) {
    const url = `${this.serviceUrl}/vehicles-exception/approval`;
    return this.putRequest(url, data);
  }

  denyVehicleException(data) {
    const url = `${this.serviceUrl}/vehicles-exception/reject`;
    return this.putRequest(url, data);
  }

  importVehicleException(data) {
    const url = `${this.serviceUrl}/vehicles-exception/import`;
    return this.postRequestFile2(url, data);
  }

  downloadTemplateExceptionVehicle() {
    const url = `${this.serviceUrl}/vehicles-exception/import-template`;
    return this.postRequestFile(url);
  }

  downloadMultiDocumentFile(exceptionListId) {
    const url = `${this.serviceUrl}/vehicles-exception/download-attachment-files/${exceptionListId}`;
    return this.postRequestFile2(url);
  }

  getListPromotions(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    if (!searchData.stationIds)
      searchData.stationIds = '';
    if (!searchData.stageIds)
      searchData.stageIds = '';
    const url = `${this.serviceUrl}/promotions`;
    return this.getRequest(url, { params: searchData });
  }

  cancelTicket(body: any, saleTransDetailId) {
    const url = `${this.serviceUrl}/ticket/confirm/destroy/${saleTransDetailId}`;
    return this.postRequest(url, body);
  }
  /**
   * Lấy danh sách xe hoạt động của màn mua vé
   * @param data
   * @param contractId
   */
  searchVehiclesActive(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/vehicles/active`;
    return this.getRequest(url, { params: buildParams });
  }

  getVehicleBoo1(plateNumber, plateType) {
    plateType = Number(plateType);
    const url = `${this.serviceUrl}/etc360/vehicle/${plateNumber}?plateTypeCode=${plateType}`;
    return this.getRequest(url);
  }
  /**
   * Lấy thông tin giá tiền trước khi đấu nối
   * @param plateNumber
   * @param plateType
   */
  checkFee(plateNumber, plateTypeCode) {
    const url = `${this.serviceUrl}/fee/add-vehicle/${plateNumber}?plateTypeCode=${plateTypeCode}`;
    return this.getRequest(url);
  }
  /**
   * Kiểm tra thông tin của xe trước khi dán thẻ
   * @param plateNumber
   */
  checkInfoVehicle(plateNumber: string) {
    this.serviceUrl
    const url = `${this.serviceUrl}/vehicle/activation/check/${plateNumber}`;
    return this.getRequest(url);
  }

  getServicePlanTypes() {
    const url = `${this.serviceUrl}/service-plan-types`;
    return this.getRequest(url);
  }

  changeEPC(body?: any) {
    const url = `${this.serviceUrl}/register/change-epc`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  getChangeEPC(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/epc-change`;
    return this.getRequest(url, { params: buildParams });
  }

  exportExcelChangeEtag(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/epc-change/export`;
    return this.postRequestFile2(url, searchData);
  }
  getCityProvince() {
    const url = `${this.serviceUrl}/vtt/provinces`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  getDistrict(province: string) {
    const url = `${this.serviceUrl}/vtt/districts?province=${province}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  getWard(province: string, district: string) {
    const url = `${this.serviceUrl}/vtt/wards?province=${province}&district=${district}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  getVehicleByContract(contractId?: number) {
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/vehicles`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  getVehicleTransfersRFID(data?: any, contractId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/contracts/${contractId}/vehicles/transfer-rfid`;
    return this.getRequest(url, { params: buildParams });
  }
}

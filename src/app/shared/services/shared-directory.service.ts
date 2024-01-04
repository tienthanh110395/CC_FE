import { Injectable } from '@angular/core';
import { BasicService } from '../../core/services/basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CommonUtils } from './common-utils.service';

@Injectable({
  providedIn: 'root',
})
export class SharedDirectoryService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(
      environment.serverUrl.api_dmdc,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService
    );
  }

  // list trạm và đoạn
  getListStageAndStation() {
    const url = `${this.serviceUrl}/mobile/stage/station`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách loại khách hàng
  getListCustomerType() {
    const url = `${this.serviceUrl}/customer-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách loại giấy tờ
  getListDocumentType() {
    const url = `${this.serviceUrl}/document-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách loại giấy tờ theo loại khách hàng
  getListDocumentTypeByCustomer(customerTypeId) {
    const url = `${this.serviceUrl}/document-types/${customerTypeId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }


  // Danh sách tỉnh/huyện/phường xã
  getListAreas(parentCode?: string) {
    const url = `${this.serviceUrl}/areas` + (parentCode ? `/${parentCode}` : '');
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách loại phương tiện
  getListVehicleType() {
    const url = `${this.serviceUrl}/vehicle-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách phương tiện thu phí
  getListVehicleFee() {
    const url = `${this.serviceUrl}/vehicle-groups`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách phương tiện thu phí
  getListVehicleFeeRachMieu() {
    const url = `${this.serviceUrl}/vehicle-groups?stationId=5018`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách nhãn hiệu phương tiện
  getListVehicleLabel() {
    const url = `${this.serviceUrl}/vehicle-marks`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách dòng xe
  getListVehicleBrands() {
    const url = `${this.serviceUrl}/vehicle-brands`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách loại biển xe
  getListVehiclePlateTypes() {
    const url = `${this.serviceUrl}/vehicle-plate-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách màu xe
  getListVehicleColours() {
    const url = `${this.serviceUrl}/vehicle-colours`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getTicketType() {
    const url = `${this.serviceUrl}/ticket-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getStationType() {
    const url = `${this.serviceUrl}/station-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getStages() {
    const url = `${this.serviceUrl}/stages`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getStagesDetail(id) {
    const url = `${this.serviceUrl}/stages/${id}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getStations() {
    const url = `${this.serviceUrl}/stations`;
    this.helperService.isProcessing(true);
    return this.getRequest(url, { params: { getAll: true } });
  }

  getStationsActive(data?) {
    const url = `${this.serviceUrl}/stations`;
    this.helperService.isProcessing(true);
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    return this.getRequest(url, { params: buildParams });
  }

  // lấy danh sách trạm kín
  getStationsCloses() {
    const url = `${this.serviceUrl}/stations/close`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getLanes(id) {
    const url = `${this.serviceUrl}/stations/${id}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getMethodCharges(methodchargesId) {
    const url = `${this.serviceUrl}/method-charges/${methodchargesId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getAddressDetail(awardId) {
    const url = `${this.serviceUrl}/areas/${awardId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getServiceTypes() {
    const url = `${this.serviceUrl}/categories?table_name=SERVICE_TYPE`;
    return this.getRequest(url);
  }

  getBotStations(botId) {
    const url = `${this.serviceUrl}/stations?serviceTypeId=${botId}`;
    return this.getRequest(url);
  }

  getCategories(paramValue?: any) {
    const url = `${this.serviceUrl}/categories?table_name=${paramValue}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  getAddressByCode(areaCode: string) {
    const url = `${this.serviceUrl}/areas/${areaCode}/details`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  // THien get bot theo id tram
  getStationsDetail(id) {
    const url = `${this.serviceUrl}/stations/${id}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Thiện lấy danh sách bots
  getListBots() {
    const url = `${this.serviceUrl}/bots`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  exportListBots(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/bots/export-excel`;
    return this.postRequestFile2(url, searchData);
  }

  // Thiện lấy danh sách tuyến
  getListRoutes() {
    const url = `${this.serviceUrl}/routes`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  //Thien lấy danh sách trạm mở
  getStationsOpens() {
    const url = `${this.serviceUrl}/stations/open`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  // Thiện lấy danh sách làn
  getListLans() {
    const url = `${this.serviceUrl}/lanes`;
    this.helperService.isProcessing(true);
    return this.getRequest(url, { params: { getAll: true } });
  }

  getVehicleGroupType(data: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/vehicle-groups/mapping/type`;
    return this.getRequest(url, { params: buildParams });
  }
  getAllMethodCharges() {
    const url = `${this.serviceUrl}/method-charges`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  getStagesCRM() {
    const url = `${this.serviceUrl}/stages`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  getStageAndStation() {
    const url = `${this.serviceUrl}/mobile/stage/station`;
    return this.getRequest(url);
  }
}

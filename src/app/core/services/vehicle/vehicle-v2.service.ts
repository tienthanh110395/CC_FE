import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonUtils } from '@app/shared/services/common-utils.service';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../basic.service';

@Injectable({
  providedIn: 'root',
})
export class VehicleService_V2 extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  getVehicleBoo1(plateNumber, plateType) {
    plateType = Number(plateType);
    const url = `${this.serviceUrl}/etc360/vehicle/${plateNumber}?plateTypeCode=${plateType}`;
    return this.getRequest(url);
  }
}

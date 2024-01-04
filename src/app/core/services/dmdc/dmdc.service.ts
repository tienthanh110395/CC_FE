import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class DmdcService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api_dmdc, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }
  getVehicleType() {
    return this.getRequest(`${this.serviceUrl}/vehicle-plate-types`);
  }
  getStationType() {
    return this.getRequest(`${this.serviceUrl}/station-types`);
  }
  getStationByStationType() {
    return this.getRequest(`${this.serviceUrl}/stations/open`, {});
  }
  getStages() {
    return this.getRequest(`${this.serviceUrl}/stages?getAll=false`);
  }
  getTicketType() {
    return this.getRequest(`${this.serviceUrl}/ticket-types?getAll=false`);
  }

}

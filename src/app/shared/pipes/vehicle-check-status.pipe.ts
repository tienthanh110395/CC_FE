import { Pipe, PipeTransform } from '@angular/core';
import { STATUS_VEHICLE } from '../constant/common.constant';

@Pipe({
  name: 'vehicleCheck'
})
export class VehicleCheckStatusPipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return ''
    }
    let name = '';
    switch (value.toString()) {
      case STATUS_VEHICLE.HOATDONG:
        name = 'common.activated'
        break;
      case STATUS_VEHICLE.IMPORT:
        name = 'common.import-from-file'
        break;
      case STATUS_VEHICLE.KHONGHOATDONG:
        name = 'common.not-activated'
        break;
      case STATUS_VEHICLE.KHONGKHOP:
        name = 'vehicle.notMatch'
        break;
      case STATUS_VEHICLE.KHOP:
        name = 'vehicle.match'
        break;
    }
    return name;
  }

}

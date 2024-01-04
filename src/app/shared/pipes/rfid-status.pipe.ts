import { Pipe, PipeTransform } from '@angular/core';
import { RFID_STATUS } from '../constant/common.constant';

@Pipe({
  name: 'rfidStatus'
})
export class RfidStatusPipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return ''
    }
    let name = '';
    switch (value.toString()) {
      case RFID_STATUS.CHUAKICHHOAT:
        name = 'common.notActive'
        break;
      case RFID_STATUS.HOATDONG:
        name = 'common.activated'
        break;
      case RFID_STATUS.MO:
        name = 'common.open'
        break;
      case RFID_STATUS.DONG:
        name = 'common.close'
        break;
      case RFID_STATUS.CHUAKICHHOAT:
        name = 'common.notActive'
        break;
    }
    return name;
  }

}

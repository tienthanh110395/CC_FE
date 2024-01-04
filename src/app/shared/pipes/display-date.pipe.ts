import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonUtils } from '../services';

@Pipe({
  name: 'displayDate'
})
export class DisplayDatePipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return super.transform(value, CommonUtils.getDateFormat());
  }
}

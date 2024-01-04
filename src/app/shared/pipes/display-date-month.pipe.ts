import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'displayDateMonth'
})
export class DisplayDateMonthPipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    // let formatMonth = CommonUtils.getDateFormat().replace('dd', '');
    // // Trương hợp format dd/../..
    // if (formatMonth.charAt(0) === '/') {
    //   formatMonth = formatMonth.substr(1);
    // }
    // // Trường hợp format ../dd/..
    // if (formatMonth.includes('//')) {
    //   formatMonth = formatMonth.replace('//', '/');
    // }
    // // Trường hợp format../../dd
    // if (formatMonth.charAt(formatMonth.length) === '/') {
    //   formatMonth = formatMonth.substr(formatMonth.length);
    // }
    return super.transform(value, 'MM/yyyy');
  }
}

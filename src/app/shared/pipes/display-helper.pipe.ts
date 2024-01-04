import { Pipe, PipeTransform } from '@angular/core';

/**
 * Author: huynq73
 * Purpose: Hien tri gia tri cua thuoc tinh theo mong muon
 * Params: dataList, sourceProp, destProp
 */
@Pipe({
  name: 'displayHelper'
})
export class DisplayHelperPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    const dataList = args[0] as Array<any>;
    const sourceProp = args[1];
    const destProp = args[2];
    if (!dataList || dataList.length === 0) {
      return value;
    }
    const destItem = dataList.filter(item => item[sourceProp] === value);
    return destItem.length > 0 ? (destItem[0][destProp] ? destItem[0][destProp] : value) : value;
  }
}

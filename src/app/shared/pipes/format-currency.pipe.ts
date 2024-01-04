import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { catchError } from 'rxjs/operators';

@Pipe({
  name: 'formatCurrency'
})
export class FormatCurrencyPipe extends CurrencyPipe implements PipeTransform {
  private decimal_separator:string='.';
  private thousands_separator:string = ',';
  transform(value: any, args?: any): any {
    if (value == null || value.toString().trim() === '') {
      return null;
    }
    let formatedByCurrencyPipe;
    if (parseFloat(value) === (value | 0)) {
      formatedByCurrencyPipe = super.transform(value, args);
    } else {
      try{
        formatedByCurrencyPipe = super.transform(value, args, 'symbol', '1.2-3');
      }
      catch(error){
        return value;
      }
    }
    if (formatedByCurrencyPipe) {
      let cleanString = formatedByCurrencyPipe.replace(/([^0-9,.]+)/gi, '');
      if(parseFloat(value) < 0){
        cleanString = "-" + cleanString;
      }
      return cleanString;
    }
    return null;
  }

  parse(value: any): any{
    if(value){
      let number = value.split(this.decimal_separator)[0];
      number = number.replace(new RegExp(this.thousands_separator, "g"), "");
      return number;
    }
    return null;
  }
}

@Pipe({ name: 'findBy', pure: false })
export class FindByPipe implements PipeTransform {
  transform(items: any[], searchText: string, propsName: string[]): any[] {
    if (!items) { return []; }
    if (!searchText) { return items; }
    if (!propsName) { return items; }
    searchText = searchText.toLowerCase();
    return items.filter( it => {
      for (const propName of propsName) {
        const isMatched = it[propName].toLowerCase().includes(searchText);
        if (isMatched) {
          return true;
        }
      }
    });
   }
}
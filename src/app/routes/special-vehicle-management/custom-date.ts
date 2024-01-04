import { Injectable } from '@angular/core';
import { COMMOM_CONFIG } from '@env/environment';
import { NativeDateAdapter } from '@angular/material/core';
import { parse, format } from 'date-fns';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: any): string {
    if (displayFormat == 'input') {

      const day = date.getDay();
      const month = date.getMonth();
      const year = date.getFullYear();
      const minute = date.getMinutes();
      const hour = date.getHours();
      //  const second = date.seconds();

      return `${day}/${month}/${year} ${hour}:${minute}`;
    }

    return format(date, COMMOM_CONFIG.DATE_TIME_FORMAT_3)  ;
  }

  parse(value: any): any{
    if (!value) return null;
    return parse(value, COMMOM_CONFIG.DATE_TIME_FORMAT_3, new Date());
  }
}

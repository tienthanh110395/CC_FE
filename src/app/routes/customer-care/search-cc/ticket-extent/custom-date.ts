import { Injectable } from "@angular/core";
import { COMMOM_CONFIG } from "@env/environment";
import * as moment from 'moment';
import { Moment } from "moment";
import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';

@Injectable()
export class CustomDateAdapter extends NgxMatMomentAdapter {
    format(date: Moment, displayFormat: Object): string {
        if (displayFormat === 'input') {

            const day = date.daysInMonth;
            const month = date.month();
            const year = date.year();
            const minute = date.minutes();
            const hour = date.hours();
            //  const second = date.seconds();

            return `${day}/${month}/${year} ${hour}:${minute}`;
        }

        return date.format(COMMOM_CONFIG.DATE_TIME_FORMAT_3);
    }

    parse(value: any): Moment | null {
        if (!value) return null;
        const date = moment(value, COMMOM_CONFIG.DATE_TIME_FORMAT_3);
        return date;
    }
}
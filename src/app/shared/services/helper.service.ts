import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { COMMOM_CONFIG } from '@env/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  public APP_TOAST_MESSAGE = new BehaviorSubject<any>([]);
  public APP_CONFIRM_DELETE = new BehaviorSubject(null);
  public APP_SHOW_HIDE_LEFT_MENU = new BehaviorSubject<any>([]);
  public APP_SHOW_PROCESSING = new BehaviorSubject<any>([]);
  constructor(private datePipe: DatePipe) { }
  /**
   * createMessage
   * param data
   */
  processReturnMessage(data) {
    this.APP_TOAST_MESSAGE.next(data);
  }
  /**
   * processing
   * param data
   */
  isProcessing(isProcessing: boolean) {
    this.APP_SHOW_PROCESSING.next(isProcessing);
  }
  /**
   * confirmDelete
   * param data
   */
  confirmDelete(data) {
    this.APP_CONFIRM_DELETE.next(data);
    // this.APP_CONFIRM_DELETE.pipe(data);
  }

  refreshConfirmDelete() {
    this.APP_CONFIRM_DELETE = new BehaviorSubject({});
  }
  renderDateTime(datetime, format: 'normal' | 'fromNow' = 'fromNow', isDatetime) {
    if (!datetime) return '';
    const config = isDatetime ? COMMOM_CONFIG.DATE_TIME_FORMAT : COMMOM_CONFIG.DATE_FORMAT;
    if (typeof datetime === 'number') datetime = this.datePipe.transform(datetime, 'dd/MM/yyyy');
    // if (typeof datetime === 'string') datetime = moment(datetime, config).toDate();
    if (format === 'normal') {
      if (isDatetime) {
        return this.datePipe.transform(datetime, 'dd/MM/yyyy HH:mm');
      } else {
        return this.datePipe.transform(datetime, 'dd/MM/yyyy');
      }
    }

    const now: any = new Date();
    const milisecond = now - datetime;
    if (milisecond < 30000)
      // 30 giây
      return 'Vài giây trước';
    if (milisecond >= 30000 && milisecond < 90000)
      // 30 giây - 90 giây
      return 'Một phút trước';
    if (milisecond < 300000)
      // 5 phút
      return 'Vài phút trước';
    if (milisecond >= 300000 && milisecond < 3600000)
      // dưới 1 tiếng
      return Math.ceil(milisecond / 60000) + ' phút trước';
    if (milisecond >= 3600000 && milisecond < 18000000)
      // dưới 5 tiếng
      return 'Vài giờ trước';
    if (milisecond >= 18000000 && milisecond < 86400000) {
      // dưới 1 ngày
      if (datetime.getDate() == now.getDate())
        return Math.ceil(milisecond / 3600000) + ' giờ trước';
      else
        return `Hôm qua  ${isDatetime ? 'lúc' + this.datePipe.transform(datetime, 'HH:mm') : ''}`;
    }
    if (milisecond >= 86400000) {
      if (
        datetime.getDate() == now.getDate() - 1 &&
        datetime.getMonth() == now.getMonth() &&
        datetime.getYear() == now.getYear()
      )
        return `Hôm qua  ${isDatetime ? 'lúc' + this.datePipe.transform(datetime, 'HH:mm') : ''}`;
      else if (isDatetime) {
        return this.datePipe.transform(datetime, 'dd/MM/yyyy HH:mm');
      } else {
        return this.datePipe.transform(datetime, 'dd/MM/yyyy');
      }
    }
  }
  getQueryString(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };
}

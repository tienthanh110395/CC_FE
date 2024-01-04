import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class PubSubEventService {
  pathToRoot: string;
  data = {} as any;
  subjects: { [name: string]: Subject<any> } = {};
  constructor() { }
  private addSubject(name: string, subject?: Subject<any>): Subject<any> {
    if (!this.subjects[name] || !this.subjects[name].observers) {
      if (!subject) {
        subject = new Subject<any>();
      }
      this.subjects[name] = subject;
    }
    return this.subjects[name];
  }
  /**
   * publish 1 event
   * @param name
   * @param data
   */
  pub$(name: string, data?: any) {
    const subject = this.addSubject(name);
    subject.next(data);
  }

  /**
   * Tắt event
   * @param name
   */
  private completeSubject(name: string) {
    if (this.subjects[name]) {
      this.subjects[name].next();
      this.subjects[name].complete();
      delete this.subjects[name];
    }
  }

  private getSubject(name: string) {
    if (!this.subjects[name] || !this.subjects[name].observers) {
      this.subjects[name] = new Subject<any>();
    }

    return this.subjects[name];
  }
  /**
   * subcrible 1 event
   * @param name
   * @param callBack
   */
  sub$(name: string, callBack: any) {
    return this.getSubject(name)
      .subscribe(rs => {
        try {
          callBack(rs);
        } catch { }
      });
  }
  /**
   * Ngừng sub event, nhưng k hủy event
   * @param name
   */
  unSubscribe(name: string) {
    if (this.subjects[name]) {
      this.subjects[name].unsubscribe();
    }
  }

  destroyContext() {
    for (const name in this.subjects) {
      this.completeSubject(name);
    }
    this.data = {};
  }
}

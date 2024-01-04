import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
const STORE_KEY = 'userLastAction';
@Injectable({
  providedIn: 'root'
})
export class IdleUserCheckService implements OnDestroy {
  public static runTimer: boolean;
  public USER_IDLE_TIMER_VALUE_IN_MIN: number;
  public FINAL_LEVEL_TIMER_VALUE_IN_MIN: number;
  public userIdlenessChecker: BehaviorSubject<string>;

  private sessionForIdle: Observable<number>;
  private userActivityChangeCallback: ($event) => void;
  constructor(private zone: NgZone) {
    if (!this.userIdlenessChecker) {
      this.userIdlenessChecker = new BehaviorSubject<string>('INITIATE_TIMER');
    }
  }

  public initilizeSessionTimeout(): void {
    IdleUserCheckService.runTimer = true;
    this.reset();
    this.initListener();
    this.initInterval();
  }

  get lastAction(): number {
    return parseInt(localStorage.getItem(STORE_KEY), 10);
  }

  set lastAction(value) {
    localStorage.setItem(STORE_KEY, value.toString());
  }

  private initListener(): void {
    this.zone.runOutsideAngular(() => {
      this.userActivityChangeCallback = ($event) => this.handleUserActiveState($event);
      window.document.addEventListener('click', this.userActivityChangeCallback.bind(this), true);
      window.document.addEventListener('wheel', this.userActivityChangeCallback.bind(this), true);
      window.document.addEventListener('mousemove', this.userActivityChangeCallback.bind(this), true);
      window.document.addEventListener('keypress', this.userActivityChangeCallback.bind(this), true);
    });
  }

  handleUserActiveState(event): void {
    this.reset();
  }

  public reset(): void {
    this.lastAction = Date.now();
    if (this.userIdlenessChecker) {
      this.userIdlenessChecker.next('RESET_TIMER');
    }
  }

  private initInterval(): void {
    const intervalDuration = 1000;
    this.sessionForIdle = interval(intervalDuration).pipe(
      map((tick: number) => {
        return tick;
      }),
      takeWhile(() => IdleUserCheckService.runTimer)
    );

    this.check();
  }

  private check(): void {
    this.sessionForIdle
      .subscribe(() => {
        const now = Date.now();
        const timeleft = this.lastAction + this.USER_IDLE_TIMER_VALUE_IN_MIN * 60 * 1000;
        const diff = timeleft - now;
        const isTimeout = diff < 0;

        this.userIdlenessChecker.next(`${diff}`);

        if (isTimeout) {

          window.document.removeEventListener('click', this.userActivityChangeCallback, true);
          window.document.removeEventListener('wheel', this.userActivityChangeCallback, true);
          window.document.removeEventListener('mousemove', this.userActivityChangeCallback, true);
          window.document.removeEventListener('keypress', this.userActivityChangeCallback, true);

          this.zone.run(() => {
            if (this.userIdlenessChecker) {
              this.userIdlenessChecker.next('STOPPED_TIMER');
            }
            IdleUserCheckService.runTimer = false;
          });
        }
      });
  }

  public removeActionFromStore(): void {
    localStorage.removeItem(STORE_KEY);
  }

  ngOnDestroy(): void {
    if (this.userIdlenessChecker) {
      this.userIdlenessChecker.unsubscribe();
      this.userIdlenessChecker = undefined;
    }
  }

}

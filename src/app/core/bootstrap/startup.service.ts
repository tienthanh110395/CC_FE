import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { MenuService } from './menu.service';


@Injectable({
  providedIn: 'root',
})
export class StartupService {
  constructor(private _menu: MenuService, private _http: HttpClient) { }

  load(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      let menuJson = 'assets/data/menu.json';
      this._http
        .get(menuJson + '?_t=' + Date.now())
        .pipe(
          catchError(res => {
            resolve();
            return res;
          })
        )
        .subscribe(
          (res: any) => {
            this._menu.recursMenuForTranslation(res.menu, 'menu');
            this._menu.set(res.menu);
          },
          () => {
            reject();
          },
          () => {
            resolve();
          }
        );
    });
  }
}

import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '@core';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styles: [],
})
export class TranslateComponent {
  langs: any;
  langSelected = 'vi-VN';

  constructor(private _translate: TranslateService, private _settings: SettingsService) {
    _translate.addLangs(['vi-VN', 'en-US']);
    _translate.setDefaultLang('vi-VN');

    // const browserLang = navigator.language;
    const browserLang = 'vi-VN';
    _translate.use(browserLang.match(/vi-VN|en-US/) ? browserLang : 'vi-VN');
    this.langs = [
      {
        key: 'vi-VN',
        value: 'common.language-vi',
        tooltip: 'common.changeto-language-vi',
      },
      {
        key: 'en-US',
        value: 'common.language-en',
        tooltip: 'common.changeto-language-en',
      },
    ];
    // this.langs = {
    //   'vi-VN': 'common.language-vi',
    //   'en-US': 'common.language-en'
    // };
  }

  useLanguage(language: string) {
    this._translate.use(language);
    this._settings.setLanguage(language);
    this.langSelected = language;
  }
}

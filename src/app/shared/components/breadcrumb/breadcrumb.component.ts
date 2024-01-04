import { Component, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AppStorage } from '@app/core/services/AppStorage';
import { MenuService } from '@core/bootstrap/menu.service';

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BreadcrumbComponent implements OnInit, OnChanges {
  @Input() nav: string[] = [];
  breadCrumb = [];

  constructor(private _router: Router, private _menu: MenuService) { }

  ngOnInit() {
    this.nav = Array.isArray(this.nav) ? this.nav : [];
    if (this.nav.length === 0) {
      this.genBreadcrumb();
    }
  }

  ngOnChanges(change) {
    this.saveUrlBreadCrumb();
  }

  trackByNavlink(index: number, navlink: string): string {
    return navlink;
  }

  genBreadcrumb() {
    const states = this._router.url.slice(1).split('/');
    this.nav = this._menu.getMenuLevel(states);
    this.nav.unshift('menu.dashboard');
  }

  onClickNavigateBreadCrumb(value) {
    const states = value.split('.');
    let endUri = states[states.length - 1];
    let listBreadCrumb = [];
    if (AppStorage.get('bread-crumb')) {
      listBreadCrumb = AppStorage.get('bread-crumb');
      let findUri = listBreadCrumb.find(b => b.key == endUri);
      if (findUri) {
        this._router.navigate([findUri.url]);
      }
    }
  }

  saveUrlBreadCrumb() {
    if (AppStorage.get('bread-crumb')) {
      this.breadCrumb = AppStorage.get('bread-crumb');
    }
    if (this.breadCrumb.length > 3) {
      this.breadCrumb.splice(0, 1);
    }
    const url = this._router.url;
    const arrKey = this.nav[this.nav.length - 1].split('.');
    const key = arrKey[arrKey.length - 1];
    this.breadCrumb.push({ key: key, url: url });
    AppStorage.set('bread-crumb', this.breadCrumb);
  }
}

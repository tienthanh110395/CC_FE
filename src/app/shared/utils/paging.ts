import { TranslateService } from '@ngx-translate/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

export class PaginatorIntlService extends MatPaginatorIntl  {

  translate: TranslateService;
  itemsPerPageLabel = 'paging.itemPerPage';
  nextPageLabel     = 'paging.nextPage';
  previousPageLabel = 'paging.prevPage';
  firstPageLabel    = 'paging.firstPage';
  lastPageLabel     = 'paging.lastPage';
  getRangeLabel = function (page, pageSize, length) {
    const of = this.translate ? this.translate.instant('paging.of') : 'of';
    if (length === 0 || pageSize === 0) {
      return '0 ' + of + ' ' + length;
    }
    length = Math.max(length, 0);
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const startIndex = page * pageSize > length ? 0 : page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return startIndex + 1 + ' - ' + endIndex + ' ' + of + ' ' + length;
  };

  injectTranslateService(translate: TranslateService) {
    this.translate = translate;

    this.translate.onLangChange.subscribe(() => {
      this.translateLabels();
    });

    this.translateLabels();
  }

  translateLabels() {
    this.itemsPerPageLabel = this.translate.instant('paging.itemPerPage');
    this.nextPageLabel = this.translate.instant('paging.nextPage');
    this.previousPageLabel = this.translate.instant('paging.prevPage');
    this.firstPageLabel = this.translate.instant('paging.firstPage');
    this.lastPageLabel = this.translate.instant('paging.lastPage');
  }
}

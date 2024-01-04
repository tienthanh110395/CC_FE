import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { VtsTemplateDirective } from '@app/shared/directives/vts-template.directive';
import { BaseComponent } from '../base-component/base-component.component';

@Component({
  selector: 'common-list',
  templateUrl: './common-list.component.html',
  styleUrls: ['./common-list.component.scss']
})
export class CommonListComponent extends BaseComponent
  implements OnInit, AfterContentInit, OnChanges {
  @Input() isLoading: boolean;
  displayedColumns: string[];
  @Input() columns: any[];
  @Input() dataSource = [];
  @Input() isPaging = true;
  @Input() totalRecord = 0;
  @Input() headerTable: string;
  @Input() showHeader = true;
  @Output() page: EventEmitter<any> = new EventEmitter();
  @Input() pageIndex: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() changePageIndex: EventEmitter<any> = new EventEmitter();
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('matTable') matTable: MatTable<any>;
  @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>;
  @Input() stickyHeight: string;
  @Input() selectionMode: 'single' | 'multiple';
  @Output() rowSelect: EventEmitter<any> = new EventEmitter();
  @Input() startRecord = this.searchModel.startrecord;
  @Output() toogleCheckAll: EventEmitter<any> = new EventEmitter();
  @Input() showCheckboxHeader = false;
  @Input() widthTable;
  @Input() stickyHeader = false;
  //  tạo directive sau đó tìm ra list các VtsTemplateDirective
  @ContentChildren(VtsTemplateDirective) columnList: QueryList<any>;
  constructor() {
    super();
  }
  ngOnInit() {
    this.displayedColumns = this.columns.map(x => x.field);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.paginator && this.pageIndex == 0) {
      this.paginator.pageIndex = 0;
    }
  }
  ngAfterContentInit() {
    this.columnDefs.forEach(columnDef => this.table.addColumnDef(columnDef));
  }
  onPaginateChange(event) {
    this.page.emit(event);
  }
  renderTable() {
    this.table.renderRows();
  }
  onClickRow(item) {
    if (this.selectionMode) {
      if (this.selectionMode === 'single') {
        this.dataSource.map(x => {
          x.selected = x == item ? x.selected : false;
          return x;
        });
      }
      item.selected = !item.selected;
      this.rowSelect.next(item);
    }
  }
  columnTemplates(name) {
    if (this.columnList != null) {
      const temp = this.columnList.toArray().find(x => x.name === name);
      return temp ? temp.template : null;
    }
  }
  checkTypeNumber(t): boolean {
    return typeof t == 'number';

  }
  trackByFn(index, item) {
    return index;
  }
  checkAll(event) {
    this.toogleCheckAll.next(event);
  }
}

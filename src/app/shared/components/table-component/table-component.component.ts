import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { BaseComponent } from '../base-component/base-component.component';

@Component({
  selector: 'crm-table',
  templateUrl: './table-component.component.html',
  styleUrls: ['./table-component.component.scss']
})
export class CrmTableComponent extends BaseComponent implements AfterContentInit, OnChanges {
  @Input() isLoading: boolean;
  @Input() displayedColumns: string[];
  @Input() dataSource = [];
  @Input() isPaging = true;
  @Input() totalRecord = 0;
  @Input() headerTable: string;
  @Input() showHeader = true;
  @Output() onPage: EventEmitter<any> = new EventEmitter();
  @Input() pageIndex: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() changePageIndex: EventEmitter<any> = new EventEmitter();
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('matTable') matTable: MatTable<any>;
  @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>;
  @Input() stickyHeight: string;
  @Input() selectionMode;
  @Output() onRowSelect: EventEmitter<any> = new EventEmitter();
  @Input() widthTable;
  @Input() stickyHeader = false;
  constructor(
  ) {
    super();
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
    this.onPage.emit(event)
  }
  renderTable() {
    this.table.renderRows();
  }
  onClickRow(item) {
    if (this.selectionMode) {
      if (this.selectionMode === 'single') {
        this.dataSource.map(x => {
          x['selected'] = x == item ? x.selected : false;
          return x;
        });
      }
      item.selected = !item.selected;
      this.onRowSelect.next(item);
    }
  }
  trackByFn(index, item) {
    return index;
  }
}

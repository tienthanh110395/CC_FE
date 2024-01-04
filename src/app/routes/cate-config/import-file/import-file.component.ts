import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-import-file',
  templateUrl: './import-file.component.html',
  styleUrls: ['./import-file.component.scss'],
})
export class ImportFileComponent extends BaseComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() totalRecord = 0;
  @Input() displayedColumns: string[];
  lstImport: any = [
    { timeImport: '12/05/2023', createUser: 'V123', fileImport: 'ahi.xlsx' },
  ];
  displayedColumnsImport: any = [];
  dataSource = new MatTableDataSource<any>();

  constructor() {
    super(null, null);
  }

  ngOnInit(): void {
    this.columns = [
      { i18n: 'STT', field: 'orderNumber' },//STT
      { i18n: 'Thời gian Import file', field: 'timeImport' },//Thời gian Import File
      { i18n: 'Người Import', field: 'createUser' },//Người Import
      { i18n: 'File Import', field: 'fileImport' },//File Import
    ];
    this.displayedColumnsImport = this.columns.map(x => x.field);
  }
}

import { Component, Inject, Input, OnInit, TemplateRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { BaseComponent } from "@shared/components/base-component/base-component.component";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ComponentType, ToastrService } from "ngx-toastr";
import { TicketLevelCateService } from "@core/services/cate-config/ticket-level-cate.service";
import { TranslateService } from "@ngx-translate/core";
import { RESOURCE } from "@core";

@Component({
  selector: 'app-import-file-statistic',
  templateUrl: './import-file-statistic.component.html',
  styleUrls: ['./import-file-statistic.component.scss']
})
export class ImportFileStatisticComponent extends BaseComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() totalRecord = 0;
  @Input() displayedColumns: string[];
  lstImport: any = [
    { fileResult: "ahi.xlsx",timeImport: '12/05/2023', createUser: 'V123', resultImport:'Thành công' },
  ];
  displayedColumnsImport: any = [];
  dataSource = new MatTableDataSource<any>();
  countTableType = 0;
  displayedColumnsType: any = [];
  constructor(private dialog: MatDialog,
              public dialogRef: MatDialogRef<ComponentType<ImportFileStatisticComponent> | TemplateRef<any>>,
              private fb: FormBuilder,
              private ticketLevelCateService: TicketLevelCateService,
              @Inject(MAT_DIALOG_DATA) public dataInput?: any,
              protected toars?: ToastrService,
              protected translateService?: TranslateService,
  ) {
    super(ticketLevelCateService, RESOURCE.CC_CATE_CONFIG, toars, translateService);
  }


  ngOnInit(): void {
    this.buildColumns();
    this.displayedColumnsType = this.columns.map(x => x.field);
    this.buildForm();
  }
  buildColumns() {
    this.columns = [
      { i18n: 'STT', field: 'orderNumber' },//STT
      { i18n: 'File kết quả', field: 'fileResult' },//Tác động
      { i18n: 'Ngày import', field: 'timeImport' },//Mã mức độ
      { i18n: 'Người import', field: 'createUser' },//Tên mức độ`
      { i18n: 'Kêt quả import', field: "resultImport" }
    ];
  }
  buildForm() {
    this.formSearch = this.fb.group({
      ticketLevelCateCode: '',//Mã loại phản ánh
      ticketLevelCateName: '',//Tên loại phản ánh
      fromDate: '',//Từ ngày
      toDate: '',//Đến ngày
      inEffect: '', // Đang hiệu lực
      expire: '', // Hết hiệu lực
      createUser: '', //Người tạo
      startRecord: 0,
      pageSize: this.pageSizeList[0],
      status:'',
      description:'',
      type:"",
      levelTt:"",
      excelName:""
    });
  }
}

import { Inject, Injectable, Injector, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PERMISSION, RESOURCE } from '@app/core/app-config';
import { ResourcePermission } from '@app/core/models/resource-permission.model';
import { CommonUtils } from '@app/shared/services/common-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { IColumn } from '@shared/models/icolumn';
import { ComponentType, ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable()
export class BaseComponent implements OnInit, OnDestroy {
  public resource;
  public permissions: ResourcePermission;
  /**
   * các cột của bảng
   */
  columns: IColumn[] = [];
  columnsTable2: IColumn[] = [];
  displayedColumns = [];
  /**
   * form group search
   */
  formSearch: FormGroup;
  private mainService: any;
  /**
   * trạng thái loading
   */
  isLoading = false;
  /**
   * biến tìm kiếm kiểu any
   */
  searchModel: any = {};
  /**
   * các data của component
   */
  dataModel: any = {};
  isAdvSearch = false;
  isCheckAll = false;
  selectColumns = [];
  /**
   * tổng bảng ghi của bảng
   */
  totalRecord = 0;
  /**
   * số lượng bản ghi trên bảng
   */
  pageSizeList = [10, 50, 100];
  permissionApp = PERMISSION;
  resourceApp = RESOURCE;
  /**
   * index
   */
  pageIndex = 0;
  /**
   * các hàng được chọn
   */
  selectedRow: any;
  /**
   *  kiểu chọn là 'single' hoặc 'multiple'
   */
  selectionMode: string;
  subDestroy$ = new Subject<any>();
  constructor(
    service?: any,
    @Inject(String) resource?,
    protected toastr?: ToastrService,
    protected translateService?: TranslateService,
    public dialogRef?: MatDialogRef<ComponentType<any> | TemplateRef<any>>
  ) {
    this.searchModel.pagesize = this.pageSizeList[0];
    this.searchModel.startrecord = 0;
    if (resource) {
      this.resource = resource;
    }
    this.mainService = service;
    this.permissions = CommonUtils.getPermissionByResourceCode(this.resource);
    this.selectedRow = this.selectionMode === 'single' ? {} : [];
  }
  ngOnDestroy(): void {
    this.subDestroy$.next();
    this.subDestroy$.complete();
  }

  ngOnInit(): void {
  }
  /** =================== Check Permissions =================== */

  public hasPermission(operationKey: string): boolean {
    // return true;
    if (this.permissions == null) {
      return false;
    }
    const scopes: string[] = this.permissions.scopes;
    return scopes.indexOf(operationKey) > -1;
  }

  public hasPermissionOtherResource(operationKey: string, resource: string): boolean {
    // return true;
    let permission = CommonUtils.getPermissionByResourceCode(resource);
    if (permission == null) {
      return false;
    }
    const scopes: string[] = permission.scopes;
    return scopes.indexOf(operationKey) > -1;
  }
  /** =================== End Check Permissions =================== */

  public processSearch(controller?: any): void {
    this.isLoading = true;
    const params = this.formSearch ? this.formSearch.value : null;
    this.mainService.search(params, controller).subscribe(res => {
      if (res.mess.code == 1) {
        this.dataModel.dataSource = res.data.listData;
        this.isLoading = false;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
    });
  }
  onClosePopup() {
    this.dialogRef.close();
  }
  /**
   * xử lý check box
   * @param event event
   */
  checkAll(event) {
    this.dataModel.dataSource.forEach(element => {
      element.checked = event.checked;
      this.selectColumns.push(element);
    });
    if (!event.checked) {
      this.selectColumns = [];
    }
  }
  checkItem(item) {
    if (item.checked) {
      this.selectColumns.push(item);
    } else {
      this.selectColumns.splice(this.selectColumns.indexOf(item), 1);
    }
    this.isCheckAll = this.selectColumns.length === this.dataModel.dataSource.length;
  }
  getData() { }
  // phân trang
  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord =
      event.pageIndex == 0 ? event.pageIndex : event.pageIndex * event.pageSize;
    this.searchModel.pagesize = event.pageSize;
    this.getData();
  }
  /**
   *  search thì back về page 1
   */
  onSearch() {
    this.pageIndex = 0;
    this.searchModel.startrecord = 0;
    this.getData();
  }
  /**
   * lấy ra height để scroll
   * @param source datasource để check length
   */
  getHeight(source) {
    if (source) {
      if (source.length > 5) {
        return '300px';
      } else {
        return 'fit-content';
      }
    }
  }
  /**
   * hàm chọn row cho table
   * @param item item được chọn
   */
  onRowSelected(item) {
    if (this.selectionMode === 'multiple') {
      if (item.selected) {
        this.selectedRow.push(item);
      } else {
        this.selectedRow.splice(this.selectedRow.indexOf(item), 1);
      }
    }
    if (this.selectionMode === 'single') {
      if (item.selected) {
        this.selectedRow = item;
      } else {
        this.selectedRow = null;
      }
    }
  }
  mapColumn() {
    this.displayedColumns = this.columns.map(x => x.field);
  }
  removeNull(obj: any) {
    for (const item in obj) {
      if (!obj[item] && item != 'startrecord') {
        delete obj[item];
      }
    }
  }
}

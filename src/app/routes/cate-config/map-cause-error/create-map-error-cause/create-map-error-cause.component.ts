import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RESOURCE } from '@core';
import { TickeErrorService } from '@core/services/cate-config/ticket-error.service';
import { TicketTypeService } from '@core/services/cate-config/ticket-type.service';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '@shared/components/base-component/base-component.component';
import _ from 'lodash';
import { ComponentType, ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs/internal/Subject';
import { MapErrorCauseService } from '@core/services/cate-config/map-error-cause.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MapErrorCauseModel } from '@app/core/models/MapErrorCause.model';
import { HTTP_CODE } from '@shared';
import { SelectOptionModel } from '../../../../core/models/common.model';

@Component({
  selector: 'app-create-map-error-cause',
  templateUrl: './create-map-error-cause.component.html',
  styleUrls: ['./create-map-error-cause.component.scss'],
})
export class CreateMapErrorCauseComponent extends BaseComponent implements OnInit {
  form!: FormGroup;
  title!: string;
  data!: string;
  onDestroy = new Subject<void>();
  search: any = 1;
  isEdit = true;

  levelTt: number = 7;

  lstTicketGroup: SelectOptionModel[] = [] as SelectOptionModel[];
  lstTicketGenre: any = [];

  lstTicketErrorCauseLv1: any = [];
  lstTicketErrorCauseLv2: any = [];
  lstTicketErrorCauseLv3: any = [];

  list1: any = [];
  list2: any = [];
  list3: any = [];

  list1Show: any = [];
  list2Show: any = [];
  list3Show: any = [];

  allComplete: boolean = false;
  allComplete2: boolean = false;
  allComplete3: boolean = false;

  allCompleteSearch: boolean = false;
  allComplete2Search: boolean = false;
  allComplete3Search: boolean = false;

  searchText: string = '';
  searchText2: string = '';
  searchText3: string = '';

  searchGenre: string = '';

  private saveTimeout: any;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<CreateMapErrorCauseComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    private mapErrorCauseService: MapErrorCauseService,
    private ticketTypeService: TicketTypeService,
    private tickeErrorService: TickeErrorService,
    protected toars?: ToastrService,
    protected translateService?: TranslateService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
  ) {
    super(ticketTypeService, RESOURCE.CC_CATE_CONFIG, toars, translateService);
  }

  ngOnInit(): void {
    this.title = this.dataInput.data['title'];
    this.buildForm();
    this.getListTicketGroup();
    this.getListNNLoi(undefined, 1);
  }

  buildForm() {
    this.form = this.fb.group({
      ticketTypeId: [''],
      ticketGroup: ['', [Validators.required]], //Nhóm phản ánh
      ticketGenre: ['', [Validators.required]], //Thể loại phản ánh
      ticketGroupFilter: '', //Filter Nhóm phản ánh
      ticketGenreFilter: '', //Filter Thể loại phản ánh
      ticketErrorCauseLv1Filter: '', //Filter Nguyên nhân lỗi cấp 1
      ticketErrorCauseLv2Filter: '', //Filter Nguyên nhân lỗi cấp 2
      ticketErrorCauseLv3Filter: '', //Filter Nguyên nhân lỗi cấp 3
      ticketErrorLevelOne: '', // nguyên nhân lỗi cấp 1
      ticketErrorLevelTwo: '', //nguyên nhân lỗi cấp 2
      ticketErrorLevelThree: '', //Nguyên nhân lỗi câp 3
      levelTt: '',

    });
  }

  getListTicketGroup() {
    let params: object = {
      search: this.search,
    };
    this.ticketTypeService.getTicketTypeByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data?.listData || [];
      this.lstTicketGroup = data.map(val => ({ value: val.ticketTypeId, label: val.ticketTypeName }));
    });
  }

  onChangeNNLoi(ob: MatCheckboxChange, item: any, levelId: number) {
    item['checked'] = ob.checked;
    if (ob.checked && levelId) {
      this.getListNNLoi(item['ticketErrorCauseId'], levelId);
    } else {
      //remove list old
      this.removeItemByParentId(item['ticketErrorCauseId'], levelId);
    }

    if (levelId == 2) {
      this.searchText = this.searchText.toLocaleLowerCase();
      this.list1 = this.lstTicketErrorCauseLv1.filter(it => {
        return it['name'].toLocaleLowerCase().includes(this.searchText);
      });

      if (this.searchText && this.list1.length == this.list1.filter(item => item.checked === true).length) {
        this.allCompleteSearch = true;
      } else if (this.searchText && this.list1.length != this.list1.filter(item => item.checked === true).length) {
        this.allCompleteSearch = false;
      } else {
        this.allComplete = this.lstTicketErrorCauseLv1 != null && this.lstTicketErrorCauseLv1.every(t => t.checked);
      }

      if (this.searchText2 && this.list2.length == this.list2.filter(item => item.checked === true).length) {
        this.allComplete2Search = true;
      } else (this.searchText2 && this.list2.length != this.list2.filter(item => item.checked === true).length);
      {
        this.allComplete2Search = false;
      }

    } else if (levelId == 3) {

      this.searchText2 = this.searchText2.toLocaleLowerCase();
      this.list2 = this.lstTicketErrorCauseLv2.filter(it => {
        return it['name'].toLocaleLowerCase().includes(this.searchText2);
      });
      if (this.searchText2 && this.list2.length == this.list2.filter(item => item.checked === true).length) {
        this.allComplete2Search = true;
      } else if (this.searchText2 && this.list2.length != this.list2.filter(item => item.checked === true).length) {
        this.allComplete2Search = false;
      } else {
        this.allComplete2 = this.lstTicketErrorCauseLv2 != null && this.lstTicketErrorCauseLv2.every(t => t.checked);
      }
      if (this.searchText3 && this.list3.length == this.list3.filter(item => item.checked === true).length) {
        this.allComplete3Search = true;
      } else (this.searchText3 && this.list3.length != this.list3.filter(item => item.checked === true).length);
      {
        this.allComplete3Search = false;
      }

    } else {
      this.searchText3 = this.searchText3.toLocaleLowerCase();
      this.list3 = this.lstTicketErrorCauseLv3.filter(it => {
        return it['name'].toLocaleLowerCase().includes(this.searchText3);
      });
      if (this.searchText3 && this.list3.length == this.lstTicketErrorCauseLv3.filter(item => item.checked === true).length) {
        this.allComplete3Search = true;
      } else if (this.searchText3 && this.list3.length != this.lstTicketErrorCauseLv3.filter(item => item.checked === true).length) {
        this.allComplete3Search = false;
      } else {
        this.allComplete3 = this.lstTicketErrorCauseLv3 != null && this.lstTicketErrorCauseLv3.every(t => t.checked);
      }

    }
  }

  onChangeItem(ob: MatCheckboxChange, item: any) {
    item['checked'] = ob.checked;
  }

  onChangeGroup() {
    if (this.searchModel) {
      this.getListTicketGenre(this.searchModel);
      this.searchGenre = '';
    } else {
      this.lstTicketGenre = [] as SelectOptionModel[];
      delete this.searchModel;
      this.searchGenre = '';
    }
  }

  getListTicketGenre(parentId) {
    this.isLoading = true;
    this.mapErrorCauseService.getTicketTypeByParentIdForMap(parentId).subscribe(res => {
      this.isLoading = false;
      this.lstTicketGenre = _.cloneDeep(res.data || []);
    });
  }

  getListNNLoi(parentId, levelId) {
    this.tickeErrorService.getErrorCauseByParentId(parentId ? [parentId] : [], levelId).subscribe(res => {
      switch (levelId) {
        case 1:
          this.lstTicketErrorCauseLv1 = _.concat(this.lstTicketErrorCauseLv1, res.data || []);
          break;
        case 2:
          this.lstTicketErrorCauseLv2 = _.concat(this.lstTicketErrorCauseLv2, res.data || []);
          this.filterListErr2();
          if (res.data.length > 0) {
            this.allComplete2 = false;
          } else {
            return;
          }
          break;
        case 3:
          this.lstTicketErrorCauseLv3 = _.concat(this.lstTicketErrorCauseLv3, res.data || []);
          this.filterListErr3();
          if (res.data.length > 0) {
            this.allComplete3 = false;
          } else {
            return;
          }
          break;
      }
    });
  }

  removeItemByParentId(parentId, levelId) {
    let newLst = [];
    switch (levelId) {
      case 1:
        newLst = [];
        for (let i = 0; i < this.lstTicketErrorCauseLv1.length; i++) {
          if (this.lstTicketErrorCauseLv1[i].parentId != parentId) {
            newLst.push(this.lstTicketErrorCauseLv1[i]);
          }
        }
        this.lstTicketErrorCauseLv1 = newLst;
        break;
      case 2:
        newLst = [];
        for (let i = 0; i < this.lstTicketErrorCauseLv2.length; i++) {
          if (this.lstTicketErrorCauseLv2[i].parentId != parentId) {
            newLst.push(this.lstTicketErrorCauseLv2[i]);
          } else {
            this.removeItemByParentId(this.lstTicketErrorCauseLv2[i].ticketErrorCauseId, 3);
          }
        }
        this.lstTicketErrorCauseLv2 = newLst;
        this.searchText2 = '';
        break;
      case 3:
        newLst = [];
        for (let i = 0; i < this.lstTicketErrorCauseLv3.length; i++) {
          if (this.lstTicketErrorCauseLv3[i].parentId != parentId) {
            newLst.push(this.lstTicketErrorCauseLv3[i]);
          }
        }
        this.lstTicketErrorCauseLv3 = newLst;
        this.searchText3 = '';
        break;
    }
  }

  doSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }

    let dataTicketType = _.filter(this.lstTicketGenre, (obj) => {
      return obj['checked'] === true;
    });

    if (this.searchText3) {
      this.lstTicketErrorCauseLv3 = this.list3;
    }
    let dataChoice = _.filter(this.lstTicketErrorCauseLv3, (obj) => {
      return obj['checked'] === true;
    });

    if (dataTicketType.length === 0 || this.lstTicketGenre.length === 0 || this.lstTicketErrorCauseLv3.length === 0 || dataChoice.length === 0) {
      this.toars.warning(this.translateService.instant('common.notify.null-data'));
      return;
    }

    let dataSave = [];
    dataChoice.forEach(obj => {
      let errorLv2 = _.filter(this.lstTicketErrorCauseLv2, (item) => {
        return item['ticketErrorCauseId'] === obj['parentId'];
      });

      dataTicketType.forEach(element => {

        let item = new MapErrorCauseModel();
        item.ticketErrorId = errorLv2[0]['parentId'];
        item.ticketErrorLv2Id = obj['parentId'];
        item.ticketErrorLv3Id = obj['ticketErrorCauseId'];
        item.ticketTypeId = element['ticketTypeId'];
        dataSave.push(item);
      });
    });
    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.mapErrorCauseService.saveOrUpdate(dataSave).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data !== null) {
            rs.data ? this.toars.success(this.translateService.instant('map-cause-error.createSuccess')) :
              this.toars.success(this.translateService.instant('map-cause-error.createSuccess'));
            this.doClose();
          } else {
            this.toars.error(this.translateService.instant('map-cause-error.createError'));
          }
        },
        () => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant('common.500Error'));
        },
      );

      this.saveTimeout = null;
    }, 1000); // Delay of 1000 milliseconds
  }

  doClose() {
    this.dialogRef.close();
  }


  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  // Set All nguyên nhân lỗi ,
  // @param Checked : (true/false)
  // @param levelId
  // Return allComplete = checked (allComplete trạng thái của true/false của tất cả NNL)
  setAll(checked: boolean, levelId: number) {
    // Tick all nguyên nhân lỗi cấp 1
    if (levelId == 2) {
      this.allComplete = checked;
      this.allCompleteSearch = checked;
      if (this.lstTicketErrorCauseLv1 == null) {
        return;
      }
      this.lstTicketErrorCauseLv1.forEach(t => (t.checked = checked));
      // Tick all nguyên nhân lỗi cấp 2
    } else if (levelId == 3) {
      this.allComplete2 = checked;
      this.allComplete2Search = checked;
      if (this.lstTicketErrorCauseLv2 == null) {
        return;
      }
      this.lstTicketErrorCauseLv2.forEach(t => (t.checked = checked));
      // Tick all nguyên nhân lỗi cấp 3
    } else {
      this.allComplete3 = checked;
      this.allComplete3Search = checked;
      if (this.lstTicketErrorCauseLv3 == null) {
        return;
      }
      this.lstTicketErrorCauseLv3.forEach(t => (t.checked = checked));
    }

    // Tick all nguyên nhân lỗi
    if (checked && levelId) {
      // Nếu checked == true và tồn tại levelId
      // Lấy ra list nguyên nhân lỗi con
      if (levelId == 2) {
        for (let item of this.lstTicketErrorCauseLv1) {
          this.getListNNLoi(item['ticketErrorCauseId'], levelId);
        }
      } else if (levelId == 3) {
        for (let item of this.lstTicketErrorCauseLv2) {
          this.getListNNLoi(item['ticketErrorCauseId'], levelId);
        }
      }

      // Nếu checked == false và tồn tại levelId
    } else {
      // Xóa list nguyên nhân lỗi con theo id cha
      // Return New list NNL con
      // Return Trạng thái allComplete = false
      if (levelId == 2) {
        for (let item of this.lstTicketErrorCauseLv1) {
          //remove list old
          this.removeItemByParentId(item['ticketErrorCauseId'], levelId);
        }
        this.allComplete2Search = checked;
        this.allComplete3Search = checked;
        this.allComplete2 = checked;
        this.allComplete3 = checked;

      } else if (levelId == 3) {
        for (let item of this.lstTicketErrorCauseLv2) {
          //remove list old
          this.removeItemByParentId(item['ticketErrorCauseId'], levelId);
        }
        this.allComplete2 = checked;
        this.allComplete3 = checked;
        this.allComplete2Search = checked;
        this.allComplete3Search = checked;
      } else {
        for (let item of this.lstTicketErrorCauseLv3) {
          //remove list old
          this.removeItemByParentId(item['ticketErrorCauseId'], levelId);
        }
        this.allComplete3 = checked;
        this.allComplete3Search = checked;
      }
    }
  }

  filterListErr2() {
    for (let item of this.lstTicketErrorCauseLv2) {

      if (item > 0) {

        let flag = false;

        if (item > 1) {
          flag = true;
        }

        this.lstTicketErrorCauseLv2.push({
          ticketErrorCauseId: item.ticketErrorId2,
          name: item.ticketErrorName2,
          checked: flag,
        });
      }

      this.lstTicketErrorCauseLv2 = this.lstTicketErrorCauseLv2.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.ticketErrorCauseId === value.ticketErrorCauseId
        )),
      );
    }
  }

  filterListErr3() {
    for (let item of this.lstTicketErrorCauseLv3) {

      if (item > 0) {

        let flag = false;

        if (item > 1) {
          flag = true;
        }

        this.lstTicketErrorCauseLv3.push({
          ticketErrorCauseId: item.ticketErrorId3,
          name: item.ticketErrorName3,
          checked: flag,
        });
      }

      this.lstTicketErrorCauseLv3 = this.lstTicketErrorCauseLv3.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.ticketErrorCauseId === value.ticketErrorCauseId
        )),
      );
    }
  }

  setAllSearch1(checked: boolean, lstTicketErrorCauseLv1, searchText) {

    this.allCompleteSearch = checked;
    searchText = searchText.toLocaleLowerCase();
    this.list1 = lstTicketErrorCauseLv1.filter(it => {
      return it['name'].toLocaleLowerCase().includes(searchText);
    });

    this.list1.forEach(t => (t.checked = checked));

    this.list1Show = this.lstTicketErrorCauseLv1.concat(this.list1);
    this.list1Show = this.list1Show.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.ticketErrorCauseId === value.ticketErrorCauseId
      )),
    );
    this.lstTicketErrorCauseLv1 = this.list1Show;

    if (checked) {
      for (const item of this.list1) {
        this.getListNNLoi(item.ticketErrorCauseId, 2);
      }
    } else {
      this.allComplete2Search = checked;
      this.allComplete3Search = checked;
      for (const item of this.list1) {
        this.removeItemByParentId(item['ticketErrorCauseId'], 2);
      }
    }
  }

  setAllSearch2(checked: boolean, lstTicketErrorCauseLv2, searchText2) {
    this.allComplete2Search = checked;
    searchText2 = searchText2.toLocaleLowerCase();
    this.list2 = lstTicketErrorCauseLv2.filter(it => {
      return it['name'].toLocaleLowerCase().includes(searchText2);
    });

    this.list2.forEach(t => (t.checked = checked));

    this.list2Show = this.lstTicketErrorCauseLv2.concat(this.list2);
    this.list2Show = this.list2Show.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.ticketErrorCauseId === value.ticketErrorCauseId
      )),
    );
    this.lstTicketErrorCauseLv2 = this.list2Show;

    if (checked) {
      for (const item of this.list2) {
        this.getListNNLoi(item.ticketErrorCauseId, 3);
      }
    } else {
      this.allComplete3Search = checked;
      for (const item of this.list2) {
        this.removeItemByParentId(item['ticketErrorCauseId'], 3);
      }
    }
  }

  setAllSearch3(checked: boolean, lstTicketErrorCauseLv3, searchText3) {
    this.allComplete3Search = checked;
    searchText3 = searchText3.toLocaleLowerCase();
    this.list3 = lstTicketErrorCauseLv3.filter(it => {
      return it['name'].toLocaleLowerCase().includes(searchText3);
    });

    this.list3.forEach(t => (t.checked = checked));

    this.list3Show = this.lstTicketErrorCauseLv3.concat(this.list3);
    this.list3Show = this.list3Show.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.ticketErrorCauseId === value.ticketErrorCauseId
      )),
    );
    this.lstTicketErrorCauseLv3 = this.list3Show;

  }

  close(level) {
    switch (level) {
      case 1:
        this.searchText = '';
        this.allCompleteSearch = false;
        this.allComplete = this.lstTicketErrorCauseLv1 != null && this.lstTicketErrorCauseLv1.every(t => t.checked);
        break;
      case 2:
        this.searchText2 = '';
        this.allComplete2 = this.lstTicketErrorCauseLv2 != null && this.lstTicketErrorCauseLv2.every(t => t.checked);
        this.allComplete2Search = false;
      case 3:
        this.searchText3 = '';
        this.allComplete3 = this.lstTicketErrorCauseLv3 != null && this.lstTicketErrorCauseLv3.every(t => t.checked);
        this.allComplete3Search = false;
    }
  }
}

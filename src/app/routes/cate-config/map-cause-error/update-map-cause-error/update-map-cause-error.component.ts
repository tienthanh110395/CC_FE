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
import { MapErrorCauseService } from '@core/services/cate-config/map-error-cause.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MapErrorCauseModel } from '@app/core/models/MapErrorCause.model';
import { HTTP_CODE } from '@shared';

@Component({
  selector: 'app-update-map-cause-error',
  templateUrl: './update-map-cause-error.component.html',
  styleUrls: ['./update-map-cause-error.component.scss'],
})
export class UpdateMapCauseErrorComponent extends BaseComponent implements OnInit {

  form!: FormGroup;
  title!: string;
  ticketGenreId: any;
  search: any = 1;
  checked = true;
  lstTicketGroup: any;
  lstTicketGenre: any = [];

  lstTicketErrorCauseLv: any = [];
  lstTicketErrorCauseLv1: any = [];
  lstTicketErrorCauseLv1Checked: any = [];
  lstTicketErrorCauseLv2: any = [];
  lstTicketErrorCauseLv2Checked: any = [];
  lstTicketErrorCauseLv3: any = [];
  lstTicketErrorCauseLv3Checked: any = [];
  ticketGenre: any;
  lstParentLvId2: any = [];
  lstParentLvId3: any = [];
  mapErrorCauseId: any = [];
  levelTt: number = 7;

  allComplete: boolean = false;
  allComplete2: boolean = false;
  allComplete3: boolean = false;

  allCompleteSearch: boolean = false;
  allComplete2Search: boolean = false;
  allComplete3Search: boolean = false;

  list1: any = [];
  list2: any = [];
  list3: any = [];

  list1Show: any = [];
  list2Show: any = [];
  list3Show: any = [];

  list3True: any = [];
  list3Save: any = [];

  searchText: string = '';
  searchText2: string = '';
  searchText3: string = '';

  private saveTimeout: any;

  constructor(
    public dialogRef: MatDialogRef<ComponentType<UpdateMapCauseErrorComponent> | TemplateRef<any>>,
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
    this.ticketGenreId = this.dataInput.data['ticketGenreId'];
    this.mapData();
  }

  async mapData() {
    await this.getDataForUpdateMapByTicketType(this.ticketGenreId);
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
      this.list1 = this.lstTicketErrorCauseLv1Checked.filter(it => {
        return it['name'].toLocaleLowerCase().includes(this.searchText);
      });
      if (this.searchText && this.list1.length == this.list1.filter(item => item.checked === true).length) {
        this.allCompleteSearch = true;
      } else if (this.searchText && this.list1.length != this.list1.filter(item => item.checked === true).length) {
        this.allCompleteSearch = false;
      } else {
        this.allComplete = this.lstTicketErrorCauseLv1Checked != null && this.lstTicketErrorCauseLv1Checked.every(t => t.checked);
      }
      if (this.searchText2 && this.list2.length == this.list2.filter(item => item.checked === true).length) {
        this.allComplete2Search = true;
      } else (this.searchText2 && this.list2.length != this.list2.filter(item => item.checked === true).length);
      {
        this.allComplete2Search = false;
      }
    } else if (levelId == 3) {
      this.searchText2 = this.searchText2.toLocaleLowerCase();
      this.list2 = this.lstTicketErrorCauseLv2Checked.filter(it => {
        return it['name'].toLocaleLowerCase().includes(this.searchText2);
      });
      if (this.searchText2 && this.list2.length == this.list2.filter(item => item.checked === true).length) {
        this.allComplete2Search = true;
      } else if (this.searchText2 && this.list2.length != this.list2.filter(item => item.checked === true).length) {
        this.allComplete2Search = false;
      } else {
        this.allComplete2 = this.lstTicketErrorCauseLv2Checked != null && this.lstTicketErrorCauseLv2Checked.every(t => t.checked);
      }
      if (this.searchText3 && this.list3.length == this.list3.filter(item => item.checked === true).length) {
        this.allComplete3Search = true;
      } else (this.searchText3 && this.list3.length != this.list3.filter(item => item.checked === true).length);
      {
        this.allComplete3Search = false;
      }
    } else {
      this.searchText3 = this.searchText3.toLocaleLowerCase();
      this.list3 = this.lstTicketErrorCauseLv3Checked.filter(it => {
        return it['name'].toLocaleLowerCase().includes(this.searchText3);
      });
      if (this.searchText3 && this.list3.length == this.lstTicketErrorCauseLv3Checked.filter(item => item.checked === true).length) {
        this.allComplete3Search = true;
      } else if (this.searchText3 && this.list3.length != this.lstTicketErrorCauseLv3Checked.filter(item => item.checked === true).length) {
        this.allComplete3Search = false;
      } else {
        this.allComplete3 = this.lstTicketErrorCauseLv3Checked != null && this.lstTicketErrorCauseLv3Checked.every(t => t.checked);
      }
    }
  }

  checkItem(item) {
    for (const i of this.lstTicketErrorCauseLv1) {
      if (item == i) {
        return true;
      }
    }
    return true;
  }

  removeItemByParentId(parentId, levelId) {
    let newLst = [];
    switch (levelId) {
      case 1:
        newLst = [];
        for (let i = 0; i < this.lstTicketErrorCauseLv1Checked.length; i++) {
          if (this.lstTicketErrorCauseLv1Checked[i].parentId != parentId) {
            newLst.push(this.lstTicketErrorCauseLv1Checked[i]);
          }
        }
        this.lstTicketErrorCauseLv1Checked = newLst;
        break;
      case 2:
        newLst = [];
        for (let i = 0; i < this.lstTicketErrorCauseLv2Checked.length; i++) {
          if (this.lstTicketErrorCauseLv2Checked[i].parentId != parentId) {
            newLst.push(this.lstTicketErrorCauseLv2Checked[i]);
          } else {
            this.removeItemByParentId(this.lstTicketErrorCauseLv2Checked[i].ticketErrorCauseId, 3);
          }
        }
        this.searchText2 = "";
        this.lstTicketErrorCauseLv2Checked = newLst;
        break;
      case 3:
        newLst = [];
        for (let i = 0; i < this.lstTicketErrorCauseLv3Checked.length; i++) {
          if (this.lstTicketErrorCauseLv3Checked[i].parentId != parentId) {
            newLst.push(this.lstTicketErrorCauseLv3Checked[i]);
          }
        }
        this.searchText3 = "";
        this.lstTicketErrorCauseLv3Checked = newLst;
        break;
    }
  }

  getListNNLoi(parentId, levelId) {
    this.tickeErrorService.getErrorCauseByParentId(parentId ? [parentId] : [], levelId).subscribe(res => {
      switch (levelId) {
        case 1:
          this.lstTicketErrorCauseLv1Checked = _.concat(this.lstTicketErrorCauseLv1Checked, res.data || []);
          break;
        case 2:
          this.lstTicketErrorCauseLv2Checked = _.concat(this.lstTicketErrorCauseLv2Checked, res.data || []);
          this.filterListErr2();
          if (res.data.length > 0) {
            this.allComplete2 = false;
          } else {
            return;
          }
          break;
        case 3:
          this.lstTicketErrorCauseLv3Checked = _.concat(this.lstTicketErrorCauseLv3Checked, res.data || []);
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

  getDataForUpdateMapByTicketType(ticketGenreId) {

    // Lấy danh sách NNL đã map theo 'ticketGenreId'
    this.mapErrorCauseService.getDataForUpdateMapByTicketType(ticketGenreId).subscribe(res => {

      // 'res.data' là danh sách các thông tin lấy ra từ hàm 'getDataForUpdateMapByTicketType'
      if (res.data) {
        // Nhóm PA và Thể loại PA lấy đối tượng vị trí đầu tiên
        this.ticketGenreId = res.data[0].ticketGenreId;
        this.ticketGenre = res.data[0].ticketGenre;
        this.lstTicketGroup = res.data[0];

        for (const prLv of res.data) {
          this.lstParentLvId2.push(prLv.parentIdLv2);
          this.lstParentLvId3.push(prLv.parentIdLv3);
          this.mapErrorCauseId.push(prLv.mapErrorCauseId);
        }

        const params = {
          lstParentLvId2: this.lstParentLvId2,
          lstParentLvId3: this.lstParentLvId3,
        };

        this.mapErrorCauseService.getErrorCauseByParentIdForUpdateMap(params).subscribe(result => {

          this.isLoading = false;

          this.lstTicketErrorCauseLv = result.data.listData;

          // Vòng lặp for theo danh sách 'lstTicketErrorCauseLv1' ở hàm 'getListNNLoi'
          // 'lstTicketErrorCauseLv1' là danh sách tất cả các nguyên nhân lỗi cấp 1
          for (const it of this.lstTicketErrorCauseLv) {

            let flag = false;

            // Vòng lặp for theo danh sách 'res.data' từ hàm 'getDataForUpdateMapByTicketType'.
            for (const re of res.data) {
              if (re.ticketErrorName1 == it.ticketErrorName1) {
                flag = true;
              }
            }

            // Khai báo 'lstTicketErrorCauseLv1Checked' và push vào các trường cần thiết
            this.lstTicketErrorCauseLv1Checked.push({
              ticketErrorCauseId: it.ticketErrorId1,
              name: it.ticketErrorName1,
              checked: flag,
            });

            this.lstTicketErrorCauseLv1Checked = this.lstTicketErrorCauseLv1Checked.filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.ticketErrorCauseId === value.ticketErrorCauseId
              )),
            );
          }

          for (const it of this.lstTicketErrorCauseLv) {
            let flag = false;

            // Vòng lặp for theo danh sách 'res.data' từ hàm 'getDataForUpdateMapByTicketType'.
            for (const re of res.data) {
              if (re.ticketErrorName2 == it.ticketErrorName2) {
                flag = true;
              }
            }
            if (it.ticketErrorId2 != null) {
              // Khai báo 'lstTicketErrorCauseLv2Checked' và push vào các trường cần thiết
              this.lstTicketErrorCauseLv2Checked.push({
                ticketErrorCauseId: it.ticketErrorId2,
                name: it.ticketErrorName2,
                parentId: it.parentIdLv2,
                checked: flag,
              });
            }

            this.lstTicketErrorCauseLv2Checked = this.lstTicketErrorCauseLv2Checked.filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.ticketErrorCauseId === value.ticketErrorCauseId
              )),
            );
          }

          for (const it of this.lstTicketErrorCauseLv) {
            let flag = false;

            // Vòng lặp for theo danh sách 'res.data' từ hàm 'getDataForUpdateMapByTicketType'.
            for (const re of res.data) {
              if (re.ticketErrorName3 == it.ticketErrorName3) {
                flag = true;
              }
            }

            if (it.ticketErrorId3 != null) {
              // Khai báo 'lstTicketErrorCauseLv3Checked' và push vào các trường cần thiết
              this.lstTicketErrorCauseLv3Checked.push({
                ticketErrorCauseId: it.ticketErrorId3,
                name: it.ticketErrorName3,
                parentId: it.parentIdLv3,
                checked: flag,
              });
            }

            this.lstTicketErrorCauseLv3Checked = this.lstTicketErrorCauseLv3Checked.filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.ticketErrorCauseId === value.ticketErrorCauseId
              )),
            );
          }
        });
      }
    });
  }

  onChangeItem(ob: MatCheckboxChange, item: any) {
    item['checked'] = ob.checked;
  }

  doSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }

    if(this.searchText3){
      this.lstTicketErrorCauseLv3Checked =  this.list3Save;
    }

    let dataChoice = _.filter(this.lstTicketErrorCauseLv3Checked, (obj) => {
      return obj['checked'] === true;
    });

    if (this.lstTicketErrorCauseLv3Checked.length === 0 || dataChoice.length === 0) {
      this.toars.warning(this.translateService.instant('common.notify.null-data'));
      return;
    }

    let dataSave = [];
    dataChoice.forEach(obj => {

      let errorLv2 = _.filter(this.lstTicketErrorCauseLv2Checked, (item) => {
        return item['ticketErrorCauseId'] === obj['parentId'];
      });

      let item = new MapErrorCauseModel();
      item.mapErrorCauseId = this.mapErrorCauseId;
      item.ticketErrorId = errorLv2[0]['parentId'];
      item.ticketErrorLv2Id = obj['parentId'];
      item.ticketErrorLv3Id = obj['ticketErrorCauseId'];
      item.ticketTypeId = this.ticketGenreId;
      item.levelTt = this.levelTt;
      dataSave.push(item);
    });
    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.mapErrorCauseService.updateMap(dataSave).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data !== null) {
            rs.data ? this.toars.success(this.translateService.instant('map-cause-error.updateSuccess')) :
              this.toars.success(this.translateService.instant('map-cause-error.updateSuccess'));
            this.doClose();
          } else {
            this.toars.error(this.translateService.instant('map-cause-error.updateError'));
            this.toars.warning(this.translateService.instant('common.notify.null-data'));
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

  // Set All nguyên nhân lỗi ,
  // @param Checked : (true/false)
  // @param levelId
  // Return allComplete = checked (allComplete trạng thái của true/false của tất cả NNL)
  setAll(checked: boolean, levelId: number) {
    // Tick all nguyên nhân lỗi cấp 1
    if (levelId == 2) {
      this.allComplete = checked;
      this.allCompleteSearch = checked;
      if (this.lstTicketErrorCauseLv1Checked == null) {
        return;
      }
      this.lstTicketErrorCauseLv1Checked.forEach(t => (t.checked = checked));
      // Tick all nguyên nhân lỗi cấp 2
    } else if (levelId == 3) {
      this.allComplete2 = checked;
      this.allComplete2Search = checked;
      if (this.lstTicketErrorCauseLv2Checked == null) {
        return;
      }
      this.lstTicketErrorCauseLv2Checked.forEach(t => (t.checked = checked));
      // Tick all nguyên nhân lỗi cấp 3
    } else {
      this.allComplete3 = checked;
      this.allComplete3Search = checked;
      if (this.lstTicketErrorCauseLv3Checked == null) {
        return;
      }
      this.lstTicketErrorCauseLv3Checked.forEach(t => (t.checked = checked));
    }

    // Tick all nguyên nhân lỗi
    if (checked && levelId) {
      // Nếu checked == true và tồn tại levelId
      // Lấy ra list nguyên nhân lỗi con
      if (levelId == 2) {
        for (let item of this.lstTicketErrorCauseLv1Checked) {
          //get list con
          this.getListNNLoi(item['ticketErrorCauseId'], levelId);
        }
      } else if (levelId == 3) {
        for (let item of this.lstTicketErrorCauseLv2Checked) {
          this.getListNNLoi(item['ticketErrorCauseId'], levelId);
        }
      }

      // Nếu checked == false và tồn tại levelId
    } else {
      // Xóa list nguyên nhân lỗi con theo id cha
      // Return New list NNL con
      // Return Trạng thái allComplete = false
      if (levelId == 2) {
        for (let item of this.lstTicketErrorCauseLv1Checked) {
          //remove list old
          this.removeItemByParentId(item['ticketErrorCauseId'], levelId);
        }
        this.allComplete2Search = checked;
        this.allComplete3Search = checked;
        this.allComplete2 = checked;
        this.allComplete3 = checked;

      } else if (levelId == 3) {
        for (let item of this.lstTicketErrorCauseLv2Checked) {
          //remove list old
          this.removeItemByParentId(item['ticketErrorCauseId'], levelId);
        }
        this.allComplete2 = checked;
        this.allComplete3 = checked;
        this.allComplete3Search = checked;

      } else {
        for (let item of this.lstTicketErrorCauseLv3Checked) {
          //remove list old
          this.removeItemByParentId(item['ticketErrorCauseId'], levelId);
        }
        this.allComplete3 = checked;
        this.allComplete3Search = checked;
      }
    }
  }

  filterListErr2() {
    for (let item of this.lstTicketErrorCauseLv2Checked) {

      if (item > 0) {

        let flag = false;

        if (item > 1) {
          flag = true;
        }

        this.lstTicketErrorCauseLv2Checked.push({
          ticketErrorCauseId: item.ticketErrorId2,
          name: item.ticketErrorName2,
          checked: flag,
        });
      }

      this.lstTicketErrorCauseLv2Checked = this.lstTicketErrorCauseLv2Checked.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.ticketErrorCauseId === value.ticketErrorCauseId
        )),
      );
    }
  }

  filterListErr3() {
    for (let item of this.lstTicketErrorCauseLv3Checked) {

      if (item > 0) {

        let flag = false;

        if (item > 1) {
          flag = true;
        }

        this.lstTicketErrorCauseLv3Checked.push({
          ticketErrorCauseId: item.ticketErrorId3,
          name: item.ticketErrorName3,
          checked: flag,
        });
      }

      this.lstTicketErrorCauseLv3Checked = this.lstTicketErrorCauseLv3Checked.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.ticketErrorCauseId === value.ticketErrorCauseId
        )),
      );
    }
  }

  setAllSearch1(checked: boolean,lstTicketErrorCauseLv1Checked,searchText) {
    this.allCompleteSearch = checked;
    searchText = searchText.toLocaleLowerCase();
    this.list1 = lstTicketErrorCauseLv1Checked.filter(it => {
      return it["name"].toLocaleLowerCase().includes(searchText);
    });

    this.list1.forEach(t => (t.checked = checked));

    this.list1Show = this.lstTicketErrorCauseLv1Checked.concat(this.list1);
    this.list1Show = this.list1Show.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.ticketErrorCauseId === value.ticketErrorCauseId
      )),
    );
    this.lstTicketErrorCauseLv1Checked = this.list1Show;


    if(checked) {
      for (const item of this.list1) {
        this.getListNNLoi(item.ticketErrorCauseId,2)
      }
    } else {
      this.allComplete2Search = checked;
      this.allComplete3Search = checked;
      for (const item of this.list1) {
        this.removeItemByParentId(item['ticketErrorCauseId'], 2);
      }
    }

  }

  setAllSearch2(checked: boolean,lstTicketErrorCauseLv2Checked,searchText2) {
    this.allComplete2Search = checked;
    searchText2 = searchText2.toLocaleLowerCase();
    this.list2 = lstTicketErrorCauseLv2Checked.filter(it => {
      return it["name"].toLocaleLowerCase().includes(searchText2);
    });

    this.list2.forEach(t => (t.checked = checked));

    this.list2Show = this.lstTicketErrorCauseLv2Checked.concat(this.list2);
    this.list2Show = this.list2Show.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.ticketErrorCauseId === value.ticketErrorCauseId
      )),
    );
    this.lstTicketErrorCauseLv2Checked = this.list2Show;

    if(checked) {
      for (const item of this.list2) {
        this.getListNNLoi(item.ticketErrorCauseId,3)
      }
    } else {
      this.allComplete3Search = checked;
      for (const item of this.list2) {
        this.removeItemByParentId(item['ticketErrorCauseId'], 3);
      }
    }
  }
  setAllSearch3(checked: boolean,lstTicketErrorCauseLv3Checked,searchText3) {
    this.allComplete3Search = checked;
    searchText3 = searchText3.toLocaleLowerCase();
    this.list3 = lstTicketErrorCauseLv3Checked.filter(it => {
      return it["name"].toLocaleLowerCase().includes(searchText3);
    });

    this.list3True = this.lstTicketErrorCauseLv3Checked.filter(item => item.checked === true);
    this.list3Save = this.list3True.concat(this.list3);
    this.list3Save = this.list3Save.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.ticketErrorCauseId === value.ticketErrorCauseId
      )),
    );

    this.list3.forEach(t => (t.checked = checked));
    this.list3Show = this.lstTicketErrorCauseLv3Checked.concat(this.list3);
    this.list3Show = this.list3Show.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.ticketErrorCauseId === value.ticketErrorCauseId
      )),
    );
    this.lstTicketErrorCauseLv3Checked = this.list3Show;
  }

  close(level) {
    switch (level) {
      case 1:
        this.searchText = '';
        this.allCompleteSearch = false;
        this.allComplete = this.lstTicketErrorCauseLv1Checked != null && this.lstTicketErrorCauseLv1Checked.every(t => t.checked);
        break;
      case 2:
        this.searchText2 = '';
        this.allComplete2Search = false;
        this.allComplete2 = this.lstTicketErrorCauseLv2Checked != null && this.lstTicketErrorCauseLv2Checked.every(t => t.checked);
      case 3:
        this.searchText3 = '';
        this.allComplete3Search = false;
        this.allComplete3 = this.lstTicketErrorCauseLv3Checked != null && this.lstTicketErrorCauseLv3Checked.every(t => t.checked);
    }
  }
}

import { Component, OnInit, ChangeDetectorRef, ViewChild, Inject, TemplateRef } from "@angular/core";
import { BaseComponent } from "@app/shared/components/base-component/base-component.component";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { HTTP_CODE, LEVEL_STATISTICS_TYPE } from "@app/shared";
import { TranslateService } from "@ngx-translate/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ComponentType, ToastrService } from "ngx-toastr";
import { TicketCateStatisticService } from "@core/services/cate-config/ticket-cate-statistic.service";

@Component({
  selector: "app-statistics-create",
  templateUrl: "./statistics-create.component.html",
  styleUrls: ["./statistics-create.component.scss"]
})
export class StatisticsCreateComponent extends BaseComponent implements OnInit {
  form!: FormGroup;
  data!: string;
  enable = true;
  isEdit = false;
  title!: string;
  isClearLv1: boolean = false;
  isClearLv2: boolean = false;
  isClearLv3: boolean = false;
  isClearLv4: boolean = false;
  statisticTypeId!: number;
  selectedStatisticsLv!: any;
  selectedLevel1: boolean = false;
  selectedLevel2: boolean = false;
  selectedLevel3: boolean = false;
  selectedLevel4: boolean = false;
  levelStatistic!: number;
  status: number = 1;
  levelTt: number = 10;
  searchModelLv1: any = {};
  searchModelLv2: any = {};
  searchModelLv3: any = {};
  searchModelLv4: any = {};
  saveTimeout: any;

  lstLevelStatistics: any = [
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_1,
      label: this.translateService.instant("ticket-statistic.statistic-lv1")
    },
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_2,
      label: this.translateService.instant("ticket-statistic.statistic-lv2")
    },
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_3,
      label: this.translateService.instant("ticket-statistic.statistic-lv3")
    },
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_4,
      label: this.translateService.instant("ticket-statistic.statistic-lv4")
    },
    {
      value: LEVEL_STATISTICS_TYPE.LEVEL_5,
      label: this.translateService.instant("ticket-statistic.statistic-lv5")
    }
  ];
  lstTicketStatisticNameLv1: any = [];
  lstTicketStatisticNameLv2: any = [];
  lstTicketStatisticNameLv3: any = [];
  lstTicketStatisticNameLv4: any = [];
  search: any = 1;


  constructor(
    public dialog: MatDialogRef<ComponentType<StatisticsCreateComponent> | TemplateRef<any>>,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private ticketCateStatisticService: TicketCateStatisticService,
    protected toars: ToastrService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any
  ) {
    super(null, null);
  }

  ngOnInit(): void {
    this.buildForm();
    this.getLstErrorLvOne();
    this.isEdit = true;
    this.title = this.dataInput.data["title"];
    this.selectedStatisticsLv = this.dataInput["data"]["data"] && this.dataInput["data"]["data"]["levelStatistic"] ? this.dataInput["data"]["data"]["levelStatistic"] : null;
    this.statisticTypeId = this.dataInput["data"]["data"] && this.dataInput["data"]["data"]["statisticTypeId"] ? this.dataInput["data"]["data"]["statisticTypeId"] : null;
    if (this.dataInput.data.data["statisticTypeId"]) {
      this.data = this.dataInput.data.data["statisticTypeId"];
      this.isEdit = false;
      this.search = 0;
      this.getDataDetailStatistic(this.data);
    }
  }

  buildForm() {
    this.form = this.fb.group({
      statisticTypeId: [""],
      levelStatistic: ["", [Validators.required]],
      ticketStatisticsLevelOne: "", // thống kê cấp 1
      ticketStatisticsLevelTwo: "", // thống kê cấp 2
      ticketStatisticsLevelThree: "", // thống kê cấp 3
      ticketStatisticsLevelFour: "", // thống kê cấp 4
      ticketCateStatisticsName: ["", [Validators.required, Validators.maxLength(255)]], // mã nguyên nhân lỗi
      description: ["", [Validators.maxLength(1024)]],//Mô tả
      levelTt: "",
      template: ["", [Validators.maxLength(1024)]]//Form nhập
    });
  }

  // Click chọn cấp nguyên nhân lỗi
  onChangeLevelStatistic(event) {
    this.selectedStatisticsLv = event.value;
    if (this.selectedStatisticsLv == 1) {
      this.form['controls']['ticketStatisticsLevelOne'].setValidators([]);
      this.form['controls']['ticketStatisticsLevelTwo'].setValidators([]);
      this.form['controls']['ticketStatisticsLevelThree'].setValidators([]);
      this.form['controls']['ticketStatisticsLevelFour'].setValidators([]);
    }
    if (this.selectedStatisticsLv == 2) {
      this.form['controls']['ticketStatisticsLevelOne'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelTwo'].setValidators([]);
      this.form['controls']['ticketStatisticsLevelThree'].setValidators([]);
      this.form['controls']['ticketStatisticsLevelFour'].setValidators([]);
    }
    if (this.selectedStatisticsLv == 3) {
      this.form['controls']['ticketStatisticsLevelOne'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelTwo'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelThree'].setValidators([]);
      this.form['controls']['ticketStatisticsLevelFour'].setValidators([]);
    }
    if (this.selectedStatisticsLv == 4) {
      this.form['controls']['ticketStatisticsLevelOne'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelTwo'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelThree'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelFour'].setValidators([]);
    }
    if (this.selectedStatisticsLv == 5) {
      this.form['controls']['ticketStatisticsLevelOne'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelTwo'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelThree'].setValidators([Validators.required]);
      this.form['controls']['ticketStatisticsLevelFour'].setValidators([Validators.required]);
    }
    this.form['controls']['ticketStatisticsLevelOne'].updateValueAndValidity();
    this.form['controls']['ticketStatisticsLevelTwo'].updateValueAndValidity();
    this.form['controls']['ticketStatisticsLevelThree'].updateValueAndValidity();
    this.form['controls']['ticketStatisticsLevelFour'].updateValueAndValidity();
  }

  defaultDataDetail(ticketCateStatistic: any) {
    this.form["controls"]["levelStatistic"].setValue(ticketCateStatistic.levelStatistic);
    if (ticketCateStatistic.levelStatistic == 5) {
      this.form["controls"]["ticketStatisticsLevelOne"].setValue(ticketCateStatistic.parentId4);
      this.form["controls"]["ticketStatisticsLevelTwo"].setValue(ticketCateStatistic.parentId3);
      this.form["controls"]["ticketStatisticsLevelThree"].setValue(ticketCateStatistic.parentId2);
      this.form["controls"]["ticketStatisticsLevelFour"].setValue(ticketCateStatistic.parentId1);
    } else if (ticketCateStatistic.levelStatistic == 4) {
      this.form["controls"]["ticketStatisticsLevelOne"].setValue(ticketCateStatistic.parentId3);
      this.form["controls"]["ticketStatisticsLevelTwo"].setValue(ticketCateStatistic.parentId2);
      this.form["controls"]["ticketStatisticsLevelThree"].setValue(ticketCateStatistic.parentId1);
    } else if (ticketCateStatistic.levelStatistic == 3) {
      this.form["controls"]["ticketStatisticsLevelOne"].setValue(ticketCateStatistic.parentId2);
      this.form["controls"]["ticketStatisticsLevelTwo"].setValue(ticketCateStatistic.parentId1);
    } else if (ticketCateStatistic.levelStatistic == 2) {
      this.form["controls"]["ticketStatisticsLevelOne"].setValue(ticketCateStatistic.parentId1);

    }
    // this.form["controls"]["ticketCateStatisticsCode"].setValue(ticketCateStatistic.ticketCateStatisticsCode);
    this.form["controls"]["ticketCateStatisticsName"].setValue(ticketCateStatistic.ticketCateStatisticsName);
    this.form["controls"]["description"].setValue(ticketCateStatistic.description);
    this.form["controls"]["template"].setValue(ticketCateStatistic.template);

    this.form["controls"]["ticketStatisticsLevelOne"].disable();
    this.form["controls"]["ticketStatisticsLevelTwo"].disable();
    this.form["controls"]["ticketStatisticsLevelThree"].disable();
    this.form["controls"]["ticketStatisticsLevelFour"].disable();
    this.form["controls"]["levelStatistic"].disable();
  }

  getDataDetailStatistic(statisticTypeId) {
    this.isLoading = true;
    this.ticketCateStatisticService.getDataDetailStatistic(statisticTypeId).subscribe(rs => {
      this.isLoading = false;
      this.getLstErrorLvOne();

      this.defaultDataDetail(rs["data"]);
      if (this.selectedStatisticsLv == 3) {
        this.getListLevelErrorTwo(rs["data"]["parentId2"]);
      }
      if (this.selectedStatisticsLv == 4) {
        this.getListLevelErrorTwo(rs["data"]["parentId3"]);
        this.getListLevelErrorThree(rs["data"]["parentId2"]);
      }
      if (this.selectedStatisticsLv == 5) {
        this.getListLevelErrorTwo(rs["data"]["parentId4"]);
        this.getListLevelErrorThree(rs["data"]["parentId3"]);
        this.getListLevelErrorFour(rs["data"]["parentId2"]);
      }
    });
  }

  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }

  getLstErrorLvOne() {
    this.isLoading = true;
    let params: object = {
      search: this.search
    };
    this.isLoading = true;
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      this.isLoading = false;
      const data = res.data.listData || [];
      this.lstTicketStatisticNameLv1 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
    });
  }

  onChangLevelOne(option) {
    this.form.controls.ticketStatisticsLevelTwo.setValue("");
    if (option?.value) {
      this.getListLevelErrorTwo(option.value);
      this.isClearLv1 = true;
    } else {
      this.isClearLv1 = false;
      this.isClearLv2 = false;
      this.isClearLv3 = false;
      this.isClearLv4 = false;
      this.form.controls.ticketStatisticsLevelTwo.setValue("");
      this.form.controls.ticketStatisticsLevelThree.setValue("");
      this.form.controls.ticketStatisticsLevelFour.setValue("");
      this.lstTicketStatisticNameLv2 = [];
      this.lstTicketStatisticNameLv3 = [];
      this.lstTicketStatisticNameLv4 = [];
    }
  }

  getListLevelErrorTwo(lstParentId) {
    let params: object = {
      lstParentId: [lstParentId],
      search: this.search
    };
    this.isLoading = true;
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      this.isLoading = false;
      console.log("res2", res);
      const data = res.data?.listData || [];
      this.lstTicketStatisticNameLv2 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
    });
    console.log("this.lstTicketStatisticNameLv2", this.lstTicketStatisticNameLv2);

  }

  getListLevelErrorOne(lstParentId) {
    this.isLoading = true;
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId([lstParentId]).subscribe(res => {
      this.isLoading = false;
      console.log("res1", res);
      const data = res.data?.listData || [];
      this.lstTicketStatisticNameLv1 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
    });
    console.log("this.lstTicketStatisticNameLv1", this.lstTicketStatisticNameLv1);

  }

  onChangLevelTwo(option) {
    this.form.controls.ticketStatisticsLevelThree.setValue(null);
    if (option?.value) {
      this.isClearLv2 = true;
      this.getListLevelErrorThree(option.value);
    } else {
      this.isClearLv2 = false;
      this.isClearLv3 = false;
      this.isClearLv4 = false;
      this.form.controls.ticketStatisticsLevelThree.setValue(null);
      this.form.controls.ticketStatisticsLevelFour.setValue(null);
      this.lstTicketStatisticNameLv3 = [];
      this.lstTicketStatisticNameLv4 = [];
    }
  }

  getListLevelErrorThree(lstParentId) {
    let params: object = {
      lstParentId: [lstParentId],
      search: this.search
    };
    this.isLoading = true;
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      this.isLoading = false;
      console.log("res3", res);

      const data = res.data?.listData || [];
      this.lstTicketStatisticNameLv3 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
    });
    console.log("this.lstTicketStatisticNameLv3", this.lstTicketStatisticNameLv3);

  }

  onChangLevelThree(option) {
    this.form.controls.ticketStatisticsLevelFour.setValue(null);
    if (option?.value) {
      this.getListLevelErrorFour(option.value);
      this.isClearLv3 = true;
    } else {
      this.isClearLv3 = false;
      this.isClearLv4 = false;
      this.form.controls.ticketStatisticsLevelFour.setValue(null);
      this.lstTicketStatisticNameLv4 = [];
    }
  }

  onChangLevelFour() {
    this.isClearLv4 = true;
  }

  getListLevelErrorFour(lstParentId) {
    this.isLoading = true;
    let params: object = {
      lstParentId: [lstParentId],
      search: this.search
    };
    this.ticketCateStatisticService.getListTickecCateStatisticByParentId(params).subscribe(res => {
      this.isLoading = false;
      console.log("res4", res);

      const data = res.data?.listData || [];
      this.lstTicketStatisticNameLv4 = data.map(val => ({ value: val.statisticTypeId, label: val.name }));
    });
    console.log("this.lstTicketStatisticNameLv4", this.lstTicketStatisticNameLv4);
  }

  doSaveOrUpdate() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    if (this.form.invalid ) {
      this.form.markAllAsTouched();
      this.toars.warning(this.translateService.instant("cateConfig.ticketType.saveWarning"));
      return;
    }
    let dataParams: object = {
      statisticTypeId: this.data ? this.data : null,
      levelStatistic: this.getValueOfField("levelStatistic"),
      ticketStatisticsLevelOne: this.getValueOfField("ticketStatisticsLevelOne"),
      ticketStatisticsLevelTwo: this.getValueOfField("ticketStatisticsLevelTwo"),
      ticketStatisticsLevelThree: this.getValueOfField("ticketStatisticsLevelThree"),
      ticketStatisticsLevelFour: this.getValueOfField("ticketStatisticsLevelFour"),
      ticketCateStatisticsName: this.getValueOfField("ticketCateStatisticsName"),
      description: this.getValueOfField("description"),
      template: this.getValueOfField("template"),
      status: this.status,
      levelTt: this.levelTt
    };

    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.ticketCateStatisticService.saveOrUpdate(dataParams).subscribe(rs => {
          this.isLoading = false;
          if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
            dataParams["statisticTypeId"] ? this.toars.success(this.translateService.instant("Cập nhật danh mục thống kê thành công"))
              : this.toars.success(this.translateService.instant("Thêm mới danh mục thống kê thành công"));
            this.dataModel.dataSource = rs.data.listData;
            this.totalRecord = rs.data.count;
            this.doClose();
          } else if (rs.data === 1) {
            this.toars.warning(this.translateService.instant("Mã thống kê bị trùng lặp. Vui lòng nhập lại mã"));
          } else {
            this.toars.warning(this.translateService.instant("Mã thống kê bị trùng lặp. Vui lòng nhập lại mã"));
          }
        }
      );
      this.saveTimeout = null;
    }, 1000); // Delay of 1000 milliseconds

  }

  doClose() {
    this.dialog.close();
  }

  btnClear() {
    this.selectedStatisticsLv = 1;
  }
}

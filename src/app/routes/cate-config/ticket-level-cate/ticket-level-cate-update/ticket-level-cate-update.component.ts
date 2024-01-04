import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TicketLevelCateService } from "@core/services/cate-config/ticket-level-cate.service";
import { TranslateService } from "@ngx-translate/core";
import { HTTP_CODE } from "@shared";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-ticket-level-cate-update",
  templateUrl: "./ticket-level-cate-update.component.html",
  styleUrls: ["./ticket-level-cate-update.component.scss"]
})
export class TicketLevelCateUpdateComponent implements OnInit {
  form!: FormGroup;
  isLoading: boolean = false;
  data!: string;
  title!: string;
  type: number = 1;
  status: number = 1;
  listTitle: any = [];
  saveTimeout: any;
  constructor(
    private dialogRef: MatDialogRef<TicketLevelCateUpdateComponent>,
    private fb: FormBuilder,
    private ticketLevelCateService: TicketLevelCateService,
    @Inject(MAT_DIALOG_DATA) public dataInput?: any,
    protected toars?: ToastrService,
    protected translateService?: TranslateService
  ) {
  }
  ngOnInit(): void {
    this.buildForm();
  }
  buildForm() {
    this.form = this.fb.group({
      ticketLevelCateId: [],
      ticketLevelCateName: ["", [Validators.required, Validators.maxLength(255)]],
      description: ["", [Validators.maxLength(1024)]],
      type: ""
    });
  }

  doSave() {

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.isLoading = true;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toars.warning(this.translateService.instant('Kiểm tra thông tin đầu vào'));
      return;
    }
    let params: object = {
      ticketLevelCateName: this.getValueOfField('ticketLevelCateName'),
      description: this.getValueOfField('description'),
      type: this.type,
      status: this.status,
    };

    this.saveTimeout = setTimeout(() => {
      // Perform the save operation
      this.ticketLevelCateService.saveOrUpdate(params).subscribe(rs => {
        this.isLoading = false;
        if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data === true) {
          this.toars.success(this.translateService.instant('Thêm mới mức độ ưu tiên thành công'));
          this.onClosePopup();
        } else {
          this.toars.warning(this.translateService.instant('Kiểm tra thông tin đầu vào'));
        }
      },
        (error) => {
          this.isLoading = false;
          this.toars.error(this.translateService.instant('common.500Error'));
        },
      );
      this.saveTimeout = null;
    }, 1000); // Delay of 1000 milliseconds
  }
  getValueOfField(item: any) {
    return this.form.get(item)?.value;
  }
  onClosePopup(): any {
    this.dialogRef.close();
  }
}

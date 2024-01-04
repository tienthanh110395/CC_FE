import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Inject, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CommonCCService } from '@app/shared/services/common-cc.service';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-edit-add-ticket-type',
  templateUrl: './edit-add-ticket-type.component.html',
  styleUrls: ['./edit-add-ticket-type.component.scss']
})
export class EditAddTicketTypeComponent extends BaseComponent implements OnInit {
  header;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  ticketTypeId: Number;
  ticketTypeLv1List = [];
  ticketTypeLv2List = [];
  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService,
    private _commonCCService: CommonCCService,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<EditAddTicketTypeComponent>>,
    public dialog?: MtxDialog,
  ) {
    super();
    this.formSearch = this.fb.group({
      name: [],
      code: [],
      l1TicketTypeId: [],
      l2TicketTypeId: [],
      isCpt: [],
      description: [],
      status: [],
      ticketTemplate: [],
    });
  }

  triggerResize() {
    this.ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {
    if (this.dataDialog?.ticketTypeId) {
      this.ticketTypeId = this.dataDialog.ticketTypeId;
      this.header = this._translateService.instant('ticket-extend.edit-ticket-type');
      this.setValueForm();
    } else {
      this.header = this._translateService.instant('ticket-extend.add-ticket-type');
    }
    this.getListTicketTypeLv1();
    this.getListTicketTypeLv2(this.dataDialog?.ticketTypeId);
  }

  getListTicketTypeLv1() {
    this._commonCCService.getListTicketType().subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketTypeLv1List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  getListTicketTypeLv2(parentId) {
    this._commonCCService.getListTicketType(parentId).subscribe(res => {
      const data = res.data?.listData || [];
      this.ticketTypeLv2List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
    });
  }

  onChangeTicketTypeLv1(option) {
    this.formSearch.controls.l2TicketTypeId.setValue(null);
    this.ticketTypeLv2List = [];
    if (option) {
      this._commonCCService.getListTicketType(option.value).subscribe(res => {
        const data = res.data?.listData || [];
        this.ticketTypeLv2List = data.map(val => ({ value: val.ticketTypeId, label: val.name }));
      });
    }
  }

  setValueForm() {
    this._ticketService.getDetailTicketType(this.dataDialog.ticketTypeId).subscribe(res => {
      if (res.mess.code == 1) {
        this.formSearch.controls.name.setValue(res.data.name || '');
        this.formSearch.controls.code.setValue(res.data.code || '');
        this.formSearch.controls.l1TicketTypeId.setValue(this.dataDialog.ticketTypeId || '');
        this.formSearch.controls.l2TicketTypeId.setValue(this.dataDialog.ticketTypeIdLv2 || '');
        this.formSearch.controls.isCpt.setValue(String(res.data.isCpt) || '');
        this.formSearch.controls.description.setValue(this.dataDialog.description || '');
        this.formSearch.controls.status.setValue(String(res.data.status) || '');
        this.formSearch.controls.ticketTemplate.setValue(this.dataDialog.ticketTemplate || '');
      }
    })
  }

  resetAllForm() {
    if (this.dataDialog) {
      this.setValueForm();
      this.formSearch.markAsPristine();
    } else {
      this.formSearch.reset();
    }
  }

  onSave() {
    const body = {
      name: this.formSearch.controls.name.value,
      code: this.formSearch.controls.code.value,
      status: this.formSearch.controls.status.value,
      isCpt: this.formSearch.controls.isCpt.value,
      ticketTemplate: this.formSearch.controls.ticketTemplate.value,
      description: this.formSearch.controls.description.value,
    }
    if (this.ticketTypeId) {
      this._ticketService.editTicketType(this.ticketTypeId, body).subscribe(res => {
        if (res.mess.code == 1) {
          this._toastrService.success(this._translateService.instant('ticket-extend.edit-ticket-type-success'))
        } else {
          this._toastrService.error(res.mess.description);
        }
      })
    } else {
      const addBody = Object.assign({}, this.formSearch.value);
      if (this.formSearch.value.l1TicketTypeId) {
        // addBody.code = this.
      }
      this._ticketService.addTicketType(addBody).subscribe(res => {
        if (res.mess.code == 1) {
          this._toastrService.success(this._translateService.instant('ticket-extend.add-ticket-type-success'))
        } else {
          this._toastrService.error(res.mess.description);
        }
      })
    }
  }
}

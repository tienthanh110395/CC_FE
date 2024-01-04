import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-extent-process',
  templateUrl: './extent-process.component.html',
  styleUrls: ['./extent-process.component.scss']
})
export class ExtentProcessComponent extends BaseComponent implements OnInit {
  extentProcessForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private _translateService: TranslateService,
    private _toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit() {
    this.buildExtentProcessForm();
  }

  buildExtentProcessForm() {
    this.extentProcessForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      contractNo: [''],
    })
  }
}

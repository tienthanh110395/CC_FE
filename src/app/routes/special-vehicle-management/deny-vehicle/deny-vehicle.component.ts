import { ChangeDetectorRef, Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { VehicleService, RESOURCE } from '@app/core';
import { SharedDirectoryService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-deny-vehicle',
  templateUrl: './deny-vehicle.component.html',
  styleUrls: ['./deny-vehicle.component.scss']
})
export class DenyVehicleComponent extends BaseComponent implements OnInit {


  formSave: FormGroup;

  constructor(protected toars: ToastrService,
    protected translateService: TranslateService,
    private _sharedDirectoryService: SharedDirectoryService,
    private fb: FormBuilder,
    private router: Router,
    private vehicleService: VehicleService,
    public actr: ActivatedRoute,
    public dialog?: MtxDialog,
    public dialogRef?: MatDialogRef<TemplateRef<DenyVehicleComponent>>,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    private cdr?: ChangeDetectorRef) {
    super();
  }
  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.formSave = this.fb.group({
      description: ['', [Validators.required, ValidationService.cannotWhiteSpace]],
    });
  }

  onConfirm() {
    const data = {
      exceptionListIds: [],
      description: this.formSave.controls.description.value
    }
    this.dataDialog.exceptionListIds.forEach(element => {
      data.exceptionListIds.push(element.exceptionListId);
    })
    this.vehicleService.denyVehicleException(data).subscribe(res => {
      if (res.mess.code) {
        this.toars.success(res.data.message);
        this.onClose();
      }
    })
  }

  onClose() {
    this.dialogRef.close();
  }

}





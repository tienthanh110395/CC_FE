import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-priority-forbidden-vehicle-detail',
  templateUrl: './priority-forbidden-vehicle-detail.component.html',
  styleUrls: ['./priority-forbidden-vehicle-detail.component.scss']
})
export class PriorityForbiddenVehicleDetailComponent implements OnInit {

  formDetail: FormGroup;
  listOptionPriorityType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionBackListType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGroupVehicle: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGroupVehicleRachmieu: SelectOptionModel[] = [] as SelectOptionModel[];
  listAttachFile = [];
  status: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _vehicleService: VehicleService) { }

  ngOnInit() {
    this.buildForm();
    this.setDisableControl();
    this.getDetailVehicleException();
    if (AppStorage.get('white-list-type-vehicle')) {
      this.listOptionPriorityType = AppStorage.get('white-list-type-vehicle');
    }

    if (AppStorage.get('back-list-type-vehicle')) {
      this.listOptionBackListType = AppStorage.get('back-list-type-vehicle');
    }
    if (AppStorage.get('vehicle-group')) {
      this.listOptionGroupVehicle = AppStorage.get('vehicle-group');
    }

    if (AppStorage.get('vehicle-group-rachmieu')) {
      this.listOptionGroupVehicleRachmieu = AppStorage.get('vehicle-group-rachmieu');
    }
  }

  buildForm() {
    this.formDetail = this.fb.group({
      priorityFobType: '', // Loại ưu tiên/cấm
      priorityType: '', // Loại ưu tiên
      scopeType: '', // Loại phạm vi
      plateNumber: '',
      plateType: '',
      groupVehicle: '', // Loại phương tiện thu phí
      seriNumber: '',
      vehicleOwner: '', // Chủ phương tiện
      contractNo: '', // Số hợp đồng
      stationOrStage: '', // Đoạn/ Trạm
      effectiveDateFrom: null, // Ngày hiệu lực: Từ ngày - đến ngày
      effectiveDateTo: null,
      comment: '', // Ghi chú,
      documentName: '', // tên văn bản
      attachFile: '', // File đính kèm,
      expDateEdit: ''
    });
  }

  setDisableControl() {
    this.formDetail.get('priorityFobType').disable();
  }


  getDetailVehicleException() {
    this._vehicleService.getDetailVehicleException(this.data.data.exceptionListId).subscribe(rs => {
      this.patchValueForm(rs.data);
    })
  }

  patchValueForm(formValue) {
    const findWhiteType = this.listOptionPriorityType.find(x => x.code == formValue?.whiteListType);
    let whiteTypeName = '';
    if (findWhiteType) {
      whiteTypeName = findWhiteType.value;
    }
    if (formValue.hasOwnProperty('expDateEdit'))
      this.status = formValue.status;
    else
      this.status = 1;
    const findBackType = this.listOptionBackListType.find(x => x.code == formValue?.blackListType);
    let backListName = '';
    if (findBackType) {
      backListName = findBackType.value;
    }
    this.formDetail.patchValue({
      priorityFobType: formValue.exceptionType,
      priorityType: whiteTypeName,
      plateNumber: formValue.plateNumber,
      scopeType: backListName,
      plateType: this.data.data.plateType,
      seriNumber: this.data.data.epc,
      vehicleOwner: formValue.customerName,
      contractNo: formValue.contractNo,
      stationOrStage: this.data.data.stationOrStage,
      effectiveDateFrom: formValue.effDate ? formValue.effDate : '',
      effectiveDateTo: formValue.expDate ? formValue.expDate : '',
      expDateEdit: formValue.hasOwnProperty('expDateEdit') ? formValue.expDateEdit : '',
      comment: formValue.description ?? null,
      documentName: formValue.attachmentFiles.length > 0 ? formValue.attachmentFiles[0].documentName : ''
    });
    this.accessAttachFile(formValue.attachmentFiles)
  }

  accessAttachFile(files: any[]) {
    files.forEach(f => {
      const findIndex = f.documentPath.lastIndexOf('/');
      if (findIndex > 0) {
        const fileName = f.documentPath.substring(findIndex + 38);
        const attachmentFileId = f.attachmentFileId;
        const fileDetail = {
          fileName: fileName,
          attachmentFileId: attachmentFileId
        }
        this.listAttachFile.push(fileDetail);
      }
    })
  }

  onDownloadFile(file) {
    this._vehicleService.downloadDocumentFile(file.attachmentFileId).subscribe(res => {
      saveAs(res, file.fileName);
    })
  }

}

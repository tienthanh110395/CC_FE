import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AttachFileModel } from '@app/core/models/common.model';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-attach-file',
  templateUrl: './attach-file.component.html',
  styleUrls: ['./attach-file.component.scss']
})
export class AttachFileComponent implements OnInit {
  formAttachFile: FormGroup;
  listChooseFile: AttachFileModel[] = [] as AttachFileModel[];
  @Input('listFormatFile') listFormatFile: string[] = ['.jpg', '.png', '.tiff', '.bmp', '.pdf', '.jpeg'];
  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private toars: ToastrService,
    private translateService: TranslateService,
    public dialogRef: MatDialogRef<AttachFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.buildForm();
  }

  onCloseForm() {
    this.dialogRef.close(true);
  }

  buildForm() {
    this.formAttachFile = this.fb.group({
      chooseFile: ['']
    });
  }

  chooseFileChange(chooseFiles) {
    const listFile = chooseFiles.target.files;
    let i = 0;

    for (i; i < listFile.length; i++) {
      const lastIndexFile = listFile[i].name.lastIndexOf('.');
      if (lastIndexFile) {
        const extendFile = listFile[i].name.substring(lastIndexFile);
        const checkExtendFile = this.listFormatFile.find(x => x == extendFile.toLowerCase());
        if (checkExtendFile && listFile[i].size <= 5000000) {
          this.convertFile(listFile[i]);
        } else if (listFile[i].size > 5000000) {
          this.toars.warning(this.translateService.instant('common.capacityFile') + `${listFile[i].name} ` + this.translateService.instant('common.max5MB'));
        } else {
          this.toars.warning(`File ${listFile[i].name} ` + this.translateService.instant('common.invalidFormat'));
        }
      }
    }
  }

  convertFile(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const index = reader.result.toString().indexOf('base64,');
      const base64 = index > 0 ? reader.result.toString().substring(index + 7) : '';
      const fileSelected: AttachFileModel = {
        fileName: file.name,
        fileSize: file.size,
        fileBase64: base64,
        fullBase64: reader.result.toString()
      } as AttachFileModel
      this.listChooseFile.push(fileSelected);
    };
    reader.onerror = (error) => {
    };
  }

  onDeleteFile(file) {
    const findFile = this.listChooseFile.findIndex(f => f.fileName == file.fileName);
    if (findFile >= 0) {
      this.listChooseFile.splice(findFile, 1);
    }
  }
}

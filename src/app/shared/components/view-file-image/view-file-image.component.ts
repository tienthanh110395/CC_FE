import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-file-image',
  templateUrl: './view-file-image.component.html',
  styleUrls: ['./view-file-image.component.scss']
})
export class ViewFileImageComponent implements OnInit {

  fileView: string = '';
  documentName: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.documentName = this.data.documentName.split('.')[0];
    this.fileView = this.data.fullBase64;
  }
}

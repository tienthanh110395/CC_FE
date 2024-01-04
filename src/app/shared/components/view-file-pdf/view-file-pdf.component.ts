import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-file-pdf',
  templateUrl: './view-file-pdf.component.html',
  styleUrls: ['./view-file-pdf.component.scss']
})
export class ViewFilePdfComponent implements OnInit {

  src: string = '';
  documentName: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.documentName = this.data.documentName.split('.')[0];
    this.src = this.data.fullBase64;
  }

}

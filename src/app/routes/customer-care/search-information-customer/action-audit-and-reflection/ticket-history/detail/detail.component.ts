import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { TranslateService } from '@ngx-translate/core';
import { CoordinateProcessTabComponent } from './coordinate-process/coordinate-process.component';
import { ImpactHistoryTicketComponent } from './impact-history-ticket/impact-history-ticket.component';
import { ProcessDetailTabComponent } from './process-detail/process-detail.component';
import { ProcessingTabComponent } from './processing/processing.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class TicketHistoryDetailComponent implements OnInit {

  @ViewChild('processingTab') processingTab: ProcessingTabComponent;
  @ViewChild('processDetailTab') processDetailTab: ProcessDetailTabComponent;
  @ViewChild('coordinateProcessTab') coordinateProcessTab: CoordinateProcessTabComponent;
  @ViewChild('impactHistoryTicketTab') impactHistoryTicketTab: ImpactHistoryTicketComponent;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogBoldFormComponent>,
    protected translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  ngOnInit(): void {
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}

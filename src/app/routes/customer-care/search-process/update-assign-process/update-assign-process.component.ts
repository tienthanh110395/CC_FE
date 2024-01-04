import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TicketService } from '@app/core/services/customer-care/ticket/ticket.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-assign-process',
  templateUrl: './update-assign-process.component.html',
  styleUrls: ['./update-assign-process.component.scss']
})
export class UpdateAssignProcessComponent implements OnInit {

  tabIndex: number = 0;
  @Output() onChangeIsEdit: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  @Input() data: any = {};
  constructor(protected _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _ticketService: TicketService) { }

  ngOnInit(): void {
  }

  onTabChange(event: any) {
  }

  setIsEdit(check: boolean) {
    this.onChangeIsEdit.emit(check);
  }
}

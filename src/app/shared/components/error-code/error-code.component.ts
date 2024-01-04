import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'error-code',
  templateUrl: './error-code.component.html',
  styleUrls: ['./error-code.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ErrorCodeComponent implements OnInit {
  @Input() code = '';
  @Input() title = '';
  @Input() message = '';

  constructor(
    protected translateService: TranslateService,
  ) {}

  ngOnInit() {}
}

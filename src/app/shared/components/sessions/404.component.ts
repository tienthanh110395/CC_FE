import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-404',
  template: `
    <error-code
      code="404"
      [title]="'page.404'"
      [message]="'page.message'"
    ></error-code>
  `,
})
export class Error404Component implements OnInit {
  constructor() { }

  ngOnInit() { }
}

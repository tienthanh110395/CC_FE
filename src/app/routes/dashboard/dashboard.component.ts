import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  totalCustomer = 0;
  totalContract = 0;
  totalVehicle = 0;
  totalContractProfile = 0;
  constructor(
    public actr: ActivatedRoute,

  ) {
    super(actr);
  }

  ngOnInit() {
  }
}

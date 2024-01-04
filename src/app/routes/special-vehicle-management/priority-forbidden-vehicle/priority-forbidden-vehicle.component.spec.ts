/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PriorityForbiddenVehicleComponent } from './priority-forbidden-vehicle.component';

describe('PriorityForbiddenVehicleComponent', () => {
  let component: PriorityForbiddenVehicleComponent;
  let fixture: ComponentFixture<PriorityForbiddenVehicleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriorityForbiddenVehicleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorityForbiddenVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

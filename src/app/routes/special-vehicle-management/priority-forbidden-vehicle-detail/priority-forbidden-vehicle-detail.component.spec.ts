/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PriorityForbiddenVehicleDetailComponent } from './priority-forbidden-vehicle-detail.component';

describe('PriorityForbiddenVehicleDetailComponent', () => {
  let component: PriorityForbiddenVehicleDetailComponent;
  let fixture: ComponentFixture<PriorityForbiddenVehicleDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriorityForbiddenVehicleDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorityForbiddenVehicleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

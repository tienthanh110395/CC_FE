/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PriorityForbiddenVehicleAccessComponent } from './priority-forbidden-vehicle-access.component';

describe('PriorityForbiddenVehicleAccessComponent', () => {
  let component: PriorityForbiddenVehicleAccessComponent;
  let fixture: ComponentFixture<PriorityForbiddenVehicleAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriorityForbiddenVehicleAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorityForbiddenVehicleAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

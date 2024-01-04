import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAssignProcessComponent } from './update-assign-process.component';

describe('UpdateAssignProcessComponent', () => {
  let component: UpdateAssignProcessComponent;
  let fixture: ComponentFixture<UpdateAssignProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateAssignProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateAssignProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

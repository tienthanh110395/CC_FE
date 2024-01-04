import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportFileProcessingTimeDialogComponent } from './import-file-processing-time-dialog.component';

describe('ImportFileProcessingTimeDialogComponent', () => {
  let component: ImportFileProcessingTimeDialogComponent;
  let fixture: ComponentFixture<ImportFileProcessingTimeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportFileProcessingTimeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportFileProcessingTimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

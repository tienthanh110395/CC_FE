import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchProcessComponent } from './search-process.component';

describe('SearchProcessComponent', () => {
  let component: SearchProcessComponent;
  let fixture: ComponentFixture<SearchProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCcComponent } from './search-cc.component';

describe('SearchCcComponent', () => {
  let component: SearchCcComponent;
  let fixture: ComponentFixture<SearchCcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchCcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

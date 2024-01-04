import { TestBed } from '@angular/core/testing';

import { NotifyConfigService } from './notify-config.service';

describe('NotifyConfigService', () => {
  let service: NotifyConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotifyConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

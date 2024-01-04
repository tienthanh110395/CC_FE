/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IdleUserCheckService } from './idle-user-check.service';

describe('Service: IdleUserCheck', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdleUserCheckService]
    });
  });

  it('should ...', inject([IdleUserCheckService], (service: IdleUserCheckService) => {
    expect(service).toBeTruthy();
  }));
});

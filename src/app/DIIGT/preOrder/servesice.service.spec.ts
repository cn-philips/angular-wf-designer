import { TestBed } from '@angular/core/testing';

import { ServesiceService } from './servesice.service';

describe('ServesiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServesiceService = TestBed.get(ServesiceService);
    expect(service).toBeTruthy();
  });
});

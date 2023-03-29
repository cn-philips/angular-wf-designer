import { TestBed } from '@angular/core/testing';

import { RouterExtendService } from './router-extend.service';

describe('RouterExtendService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RouterExtendService = TestBed.get(RouterExtendService);
    expect(service).toBeTruthy();
  });
});

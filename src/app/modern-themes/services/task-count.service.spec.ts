import { TestBed } from '@angular/core/testing';

import { TaskCountService } from './task-count.service';

describe('TaskCountService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaskCountService = TestBed.get(TaskCountService);
    expect(service).toBeTruthy();
  });
});

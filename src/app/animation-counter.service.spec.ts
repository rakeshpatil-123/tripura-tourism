import { TestBed } from '@angular/core/testing';

import { AnimationCounterService } from './animation-counter.service';

describe('AnimationCounterService', () => {
  let service: AnimationCounterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimationCounterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

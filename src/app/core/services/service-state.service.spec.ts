import { TestBed } from '@angular/core/testing';

import { ServiceStateService } from './service-state.service';

describe('ServiceStateService', () => {
  let service: ServiceStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

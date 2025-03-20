import { TestBed } from '@angular/core/testing';

import { EnterpriseStateService } from './enterprise-state.service';

describe('EnterpriseStateService', () => {
  let service: EnterpriseStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnterpriseStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

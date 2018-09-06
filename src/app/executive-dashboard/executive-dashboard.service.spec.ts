import { TestBed, inject } from '@angular/core/testing';

import { ExecutiveDashboardService } from './executive-dashboard.service';

describe('ExecutiveDashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExecutiveDashboardService]
    });
  });

  it('should be created', inject([ExecutiveDashboardService], (service: ExecutiveDashboardService) => {
    expect(service).toBeTruthy();
  }));
});

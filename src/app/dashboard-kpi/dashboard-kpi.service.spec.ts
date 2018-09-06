import { TestBed, inject } from '@angular/core/testing';

import { DashboardKpiService } from './dashboard-kpi.service';

describe('DashboardKpiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardKpiService]
    });
  });

  it('should be created', inject([DashboardKpiService], (service: DashboardKpiService) => {
    expect(service).toBeTruthy();
  }));
});

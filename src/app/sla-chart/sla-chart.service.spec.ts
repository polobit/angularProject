import { TestBed, inject } from '@angular/core/testing';

import { SlaChartService } from './sla-chart.service';

describe('SlaChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SlaChartService]
    });
  });

  it('should be created', inject([SlaChartService], (service: SlaChartService) => {
    expect(service).toBeTruthy();
  }));
});

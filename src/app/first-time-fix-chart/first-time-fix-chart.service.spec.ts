import { TestBed, inject } from '@angular/core/testing';

import { FirstTimeFixChartService } from './first-time-fix-chart.service';

describe('FirstTimeFixChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirstTimeFixChartService]
    });
  });

  it('should be created', inject([FirstTimeFixChartService], (service: FirstTimeFixChartService) => {
    expect(service).toBeTruthy();
  }));
});

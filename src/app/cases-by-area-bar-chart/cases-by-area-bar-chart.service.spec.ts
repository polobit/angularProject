import { TestBed, inject } from '@angular/core/testing';

import { CasesByAreaBarChartService } from './cases-by-area-bar-chart.service';

describe('PhonefixDispatchBarChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CasesByAreaBarChartService]
    });
  });

  it('should be created', inject([CasesByAreaBarChartService], (service: CasesByAreaBarChartService) => {
    expect(service).toBeTruthy();
  }));
});

import { TestBed, inject } from '@angular/core/testing';

import { HighFrequencyStoresChartService } from './high-frequency-stores-chart.service';

describe('HighFrequencyStoresChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HighFrequencyStoresChartService]
    });
  });

  it('should be created', inject([HighFrequencyStoresChartService], (service: HighFrequencyStoresChartService) => {
    expect(service).toBeTruthy();
  }));
});

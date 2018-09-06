import { TestBed, inject } from '@angular/core/testing';

import { CashFlowChartService } from './cash-flow-chart.service';

describe('CashFlowChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CashFlowChartService]
    });
  });

  it('should be created', inject([CashFlowChartService], (service: CashFlowChartService) => {
    expect(service).toBeTruthy();
  }));
});

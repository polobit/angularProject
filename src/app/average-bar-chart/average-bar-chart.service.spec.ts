import { inject, TestBed } from '@angular/core/testing';

import { AverageBarChartService } from './average-bar-chart.service';

describe('AverageBarChartService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AverageBarChartService]
        });
    });

    it('should be created', inject([AverageBarChartService], (service: AverageBarChartService) => {
        expect(service).toBeTruthy();
    }));
});

import { inject, TestBed } from '@angular/core/testing';

import { OnSiteBarChartService } from './onsite-bar-chart.service';

describe('OnsiteBarChartService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [OnSiteBarChartService]
        });
    });

    it('should be created', inject([OnSiteBarChartService], (service: OnSiteBarChartService) => {
        expect(service).toBeTruthy();
    }));
});

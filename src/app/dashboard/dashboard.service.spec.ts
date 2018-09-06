import { inject, TestBed, flush } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

let dashboardService: DashboardService;
let mockHttp: HttpTestingController;
const customerFilter = ['ALL'];
const modelFilter = ['ALL'];

const averageHourOnsiteMockResponse = {
    'lastUpdatedDate': '05/07/2018',
    'previousDayDate': '05/06/2018',
    'lastUpdatedDayAverage': 1.71,
    'percentageChange': '5.76',
    'previousDayAverage': 1.62
};

const fisrtFixTimeMockResponse = {
    'earlierPercentage': 100,
    'latestDate': '05/05/2018',
    'percentageChange': '-100.00',
    'latestPercentage': '0.00',
    'earlierDate': '05/04/2018'
};

describe('DashboardService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DashboardService],
            imports: [HttpClientTestingModule]
        });
        dashboardService = TestBed.get(DashboardService);
        mockHttp = TestBed.get(HttpTestingController);
    });

    it('should be created', inject([DashboardService], (service: DashboardService) => {
        expect(service).toBeTruthy();
    }));

    it('should be verified', (done) => {
        dashboardService.getAverageHoursCardService(customerFilter, modelFilter)
            .subscribe((response) => {
                expect(response).toEqual(averageHourOnsiteMockResponse);
                done();
            });
            // flush(averageHourOnsiteMockResponse);
    });
});

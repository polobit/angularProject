import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IAverageBarChart, IAverageBarChartDetail } from '../app.interface';

@Injectable()
export class AverageBarChartService {

    constructor(private commonService: CommonService) {
    }

    getChartDataService(selectedCustomerList, selectedModelList, selectedPeriod, selectedFrequency): Observable<IAverageBarChart> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const serviceUrl = `${CommonService.serverUrl}/averagehoursspentonsite/${selectedPeriod}/${selectedFrequency}`
            + `/customer?name=${customerList}&model=${selectedModelList}`;
        return this.commonService.get(serviceUrl)
            .catch(err => this.commonService.handleError(err));
    }

    getDetailForEachBarService(selectedCustomerList, selectedModelList, frequency, fromDate, toDate): Observable<IAverageBarChartDetail> {
        let serviceUrl;
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        if (frequency === 'daily') {
            serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/`
                + `onDate?date=${fromDate}&name=${customerList}&model=${selectedModelList}`;
        } else {
            serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/betweenDates` +
                `?startDate=${fromDate}&endDate=${toDate}&name=${customerList}&model=${selectedModelList}`;
        }
        return this.commonService.get(serviceUrl)
            .catch(err => this.commonService.handleError(err));
    }
}

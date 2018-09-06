import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { ICasesByAreaChart, IOnsiteBarChartDetail } from '../app.interface';

@Injectable()
export class CasesByAreaBarChartService {

    constructor(private commonService: CommonService) {
    }

    getChartDataService(selectedCustomerList, selectedModelList, period, frequency, area): Observable<ICasesByAreaChart> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const serviceUrl = `${CommonService.serverUrl}/casesbyarea/${period}/${frequency}`
            + `/customer?name=${customerList}&model=${selectedModelList}&area=${area}`;
        return this.commonService.get(serviceUrl)
            .map(data => {
                const dates = [];
                data['chartData'] = data['chartData'].filter(value => {
                    if (dates.indexOf(value.caseDate) === -1) {
                        dates.push(value.caseDate);
                        return true;
                    }
                    return false;
                });
                return data;
            })
            .catch(err => this.commonService.handleError(err));
    }
    getDetailForEachBarService(
        selectedCustomerList, selectedModelList, frequency, fromDate, toDate, area, caseType): Observable<IOnsiteBarChartDetail> {
        let serviceUrl;
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        if (frequency === 'daily') {
            serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/`
                + `casebyarea?startDate=${fromDate}&name=${customerList}`
                + `&model=${selectedModelList}&area=${area}&caseType=${caseType}`;
        } else {
            serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/casebyarea/betweenDates`
                + `?startDate=${fromDate}&endDate=${toDate}&name=${customerList}`
                + `&model=${selectedModelList}&area=${area}&caseType=${caseType}`;
        }

        return this.commonService.get(serviceUrl)
            .catch(err => this.commonService.handleError(err));
    }
}

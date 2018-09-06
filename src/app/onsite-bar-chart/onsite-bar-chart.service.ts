import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IOnsiteBarChart, IOnsiteBarChartDetail } from '../app.interface';
import { AppConfiguration } from '../app.configuration';
import * as _ from 'lodash';

@Injectable()
export class OnSiteBarChartService {

    constructor(private commonService: CommonService) {
    }

    getChartDataService(selectedCustomerList, selectedModelList, selectedPeriod, selectedFrequency): Observable<IOnsiteBarChart> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const serviceUrl = `${CommonService.serverUrl}/casesbyonsitehours/${selectedPeriod}/${selectedFrequency}`
            + `/customer?name=${customerList}&model=${selectedModelList}`;
        return this.commonService.get(serviceUrl)
            .map(data => {
                const dates = [];
                data['chartData'] = data['chartData'].filter(value => {
                    if (dates.indexOf(value.caseDate) === -1) {
                        dates.push(value.caseDate);
                        return true;
                    }
                    return false;
                }).map(dataPercentage => {
                    AppConfiguration.onSiteTime.timePeriods.forEach(period => {
                        dataPercentage[period.key].percentage = dataPercentage[period.key].percentage ?
                            dataPercentage[period.key].percentage !== '' ?
                                _.toNumber(dataPercentage[period.key].percentage) : 0 : 0;
                        dataPercentage[period.key].number = dataPercentage[period.key].number ?
                            dataPercentage[period.key].number !== '' ?
                                _.toNumber(dataPercentage[period.key].number) : 0 : 0;
                    });
                    return dataPercentage;
                });
                return data;
            })
            .catch(err => this.commonService.handleError(err));
    }

    getDetailForEachBarService(
        selectedCustomerList,
        selectedModelList,
        frequency,
        fromDate,
        toDate,
        onSiteTimeSlot?
    ): Observable<IOnsiteBarChartDetail> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        let serviceUrl;
        if (frequency === 'daily') {
            serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/onsiteHours?startDate=${fromDate}`
                + `&name=${customerList}&model=${selectedModelList}&onsiteTime=${onSiteTimeSlot}`;
        } else {
            serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/onsiteHours/betweenDates?startDate=${fromDate}&endDate=${toDate}`
                + `&name=${customerList}&model=${selectedModelList}&onsiteTime=${onSiteTimeSlot}`;
        }
        return this.commonService.get(serviceUrl)
            .catch(err => this.commonService.handleError(err));
    }
}

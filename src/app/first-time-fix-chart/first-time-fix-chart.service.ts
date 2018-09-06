import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IFirstTimeFixChart, IOnsiteBarChartDetail } from '../app.interface';

@Injectable()
export class FirstTimeFixChartService {

  constructor(private commonService: CommonService) {
  }

  getChartDataService(selectedCustomerList, selectedModelList, period, frequency, caseType): Observable<IFirstTimeFixChart> {
    let serviceUrl;
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    if (period === 'daily') {
      serviceUrl = `${CommonService.serverUrl}/first-time-fix/charts/${period}/${frequency}`
        + `?name=${customerList}&model=${selectedModelList}&case_type=${caseType}`;
    } else {
      serviceUrl = `${CommonService.serverUrl}/first-time-fix/charts/${period}`
        + `/?name=${customerList}&model=${selectedModelList}&case_type=${caseType}`;
    }
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getDetailForEachBarService(
    selectedCustomerList, selectedModelList, frequency, fromDate, caseType, toDate?): Observable<IOnsiteBarChartDetail> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/first-time-fix`
      + `?startDate=${fromDate}&endDate=${toDate}&name=${customerList}`
      + `&model=${selectedModelList}&scope=${caseType}`;

    return this.commonService.get(serviceUrl)
      .catch(err => this.commonService.handleError(err));
  }
}

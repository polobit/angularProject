import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IFirstTimeFixChart, IOnsiteBarChartDetail, ISuccessRatio } from '../app.interface';

@Injectable()
export class UserExperienceReportService {

  constructor(private commonService: CommonService) { }
  getSuccessRatioAreaChartDataService(selectedCustomerList, selectedModelList, period, frequency, allData): Observable<ISuccessRatio> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    let serviceUrl;
    if (period === 'daily') {
      serviceUrl = `${CommonService.serverUrl}/user-experience/charts/userex/${period}/${frequency}`
        + `?name=${customerList}&model=${selectedModelList}&chartdata=${allData}`;
    } else {
      serviceUrl = `${CommonService.serverUrl}/user-experience/charts/userex/${period}/`
        + `?name=${customerList}&model=${selectedModelList}&chartdata=${allData}`;
    }

    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getSuccessRatioBarChartDataService(selectedCustomerList, selectedModelList,
    period, frequency, pageOffset, pageLimit ): Observable<ISuccessRatio> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/user-experience/charts/users/${frequency}`
      + `?name=${customerList}&model=${selectedModelList}&offset=${pageOffset}&limit=${pageLimit}`;
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IFirstTimeFixChart, IOnsiteBarChartDetail, ISuccessRatio } from '../app.interface';

@Injectable()
export class InterventionDriverService {

  constructor(private commonService: CommonService) { }

  getDowntimeRatioAreaChartDataService(selectedCustomerList, selectedModelList, period, frequency, allData): Observable<ISuccessRatio> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    let serviceUrl;
    if (period === 'daily') {
      serviceUrl = `${CommonService.serverUrl}/user-experience/charts/interventions/${period}/${frequency}`
        + `?name=${customerList}&model=${selectedModelList}&chartdata=${allData}`;
    } else {
      serviceUrl = `${CommonService.serverUrl}/user-experience/charts/interventions/${period}`
        + `?name=${customerList}&model=${selectedModelList}&chartdata=${allData}`;
    }

    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getInterventionByStoreChartDataService(
    selectedCustomerList, selectedModelList, period, frequency, pageOffset, pageLimit): Observable<ISuccessRatio> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/user-experience/charts/interventiondrivers/stores/${frequency}`
      + `?name=${customerList}&model=${selectedModelList}&offset=${pageOffset}&limit=${pageLimit}`;
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getInterventionByUserChartDataService(
    selectedCustomerList, selectedModelList, period, frequency, pageOffset, pageLimit): Observable<ISuccessRatio> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/user-experience/charts/interventiondrivers/users/${frequency}`
      + `?name=${customerList}&model=${selectedModelList}&offset=${pageOffset}&limit=${pageLimit}`;
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getInterventionByTransactionChartDataService(
    selectedCustomerList, selectedModelList, period, frequency, pageOffset, pageLimit): Observable<ISuccessRatio> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/user-experience/charts/interventiondrivers/transactiondetails/${frequency}`
      + `?name=${customerList}&model=${selectedModelList}&offset=${pageOffset}&limit=${pageLimit}`;
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }
}

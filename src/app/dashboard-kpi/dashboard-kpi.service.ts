import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import { IAverageHoursCard, IOnsiteTimeSpentCard, IFirstTimeFixCard, ICardsWithPeriod } from '../app.interface';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DashboardKpiService {

  constructor(private commonService: CommonService) {
  }

  getAverageHoursCardService(selectedCustomerList, selectedModelList, period, frequency): Observable<ICardsWithPeriod> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const url = `${CommonService.serverUrl}/averagehoursspentonsite/${period}/${frequency}/customer`
      + `?name=${customerList}&model=${selectedModelList}&chartdata=false`;
    return this.commonService.get(url)
      .catch(err => this.commonService.handleError(err));
  }

  getOnSiteTimeSpentCardService(selectedCustomerList, selectedModelList, period, frequency): Observable<ICardsWithPeriod> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const url = `${CommonService.serverUrl}/casesbyonsitehours/${period}/${frequency}/customer`
      + `?name=${customerList}&model=${selectedModelList}&chartdata=false`;
    return this.commonService.get(url)
      .map((data: IOnsiteTimeSpentCard[] | IOnsiteTimeSpentCard) => Array.isArray(data) ? data[0] : data)
      .catch(err => this.commonService.handleError(err));
  }

  getCasesByAreaCardService(selectedCustomerList, selectedArea, selectedModelList, period, frequency): Observable<IAverageHoursCard> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const url = `${CommonService.serverUrl}/casesbyarea/${period}/${frequency}/customer`
      + `?name=${customerList}&model=${selectedModelList}&area=${selectedArea}&chartdata=false`;
    return this.commonService.get(url)
      .map((data: IAverageHoursCard[] | IAverageHoursCard) => Array.isArray(data) ? data[0] : data)
      .catch(err => this.commonService.handleError(err));
  }

  getHighFrequencyStoresCardService(selectedCustomerList, selectedModelList, period, frequency): Observable<ICardsWithPeriod> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const url = `${CommonService.serverUrl}/highfrequencydispatchstores/${period}/${frequency}/customer`
      + `?name=${customerList}&model=${selectedModelList}&area=ALL&chartdata=false`;
    return this.commonService.get(url)
      .map((data) => Array.isArray(data) ? data[0] : data)
      .catch(err => this.commonService.handleError(err));
  }

  getCasesByHourCardService(selectedCustomerList, selectedModelList, period): Observable<IOnsiteTimeSpentCard> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const url = `${CommonService.serverUrl}`
      + `/casesbyhour/${period}/weekdays?name=${customerList}&model=${selectedModelList}&chartdata=false`;
    return this.commonService.get(url)
      .catch(err => this.commonService.handleError(err));
  }

  getCasesBySLACardService(selectedCustomerList, selectedModelList, seletedPeriod, seletedFrequency, selectedZone) {
    const url = `${CommonService.serverUrl}/servicelevelagreement/${seletedPeriod}/${seletedFrequency}/`
      + `customer?name=${selectedCustomerList}&model=${selectedModelList}&zone=${selectedZone}&chartData=false`;
    return this.commonService.get(url)
      .catch(err => this.commonService.handleError(err));
  }

  getFirstTimeFixService(selectedCustomerList, selectedModelList, seletedPeriod, seletedFrequency) {
    let url;
    if (seletedPeriod === 'daily') {
      url = `${CommonService.serverUrl}/first-time-fix/charts/${seletedPeriod}/${seletedFrequency}`
        + `?name=${selectedCustomerList}&model=${selectedModelList}&case_type=ALL&chartdata=false`;
    } else {
      url = `${CommonService.serverUrl}/first-time-fix/charts/${seletedPeriod}/`
        + `?name=${selectedCustomerList}&model=${selectedModelList}&case_type=ALL&chartdata=false`;
    }
    return this.commonService.get(url)
      .catch(err => this.commonService.handleError(err));
  }

}

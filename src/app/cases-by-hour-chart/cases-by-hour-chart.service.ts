import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { ICasesByHourChart, IOnsiteBarChartDetail, ICasesByHourChartValue } from '../app.interface';

@Injectable()
export class CasesByHourChartService {

  constructor(private commonService: CommonService) {
  }
  getChartDataService(selectedCustomerList, selectedModelList, period, frequency, weekDay): Observable<ICasesByHourChart> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/casesbyhour/${period}/${frequency}`
      + `/customer?name=${customerList}&model=${selectedModelList}&weekDay=${weekDay}`;
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getDetailForEachBarService(selectedCustomerList, selectedModelList, period, frequency,
    fromDate, toDate, day, hour): Observable<IOnsiteBarChartDetail> {
      const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/casesbyhours?startDate=${fromDate}` +
      `&endDate=${toDate}&name=${customerList}&model=${selectedModelList}&dayOfWeek=${day}&hour=${hour}`;
    return this.commonService.get(serviceUrl)
      .catch(err => this.commonService.handleError(err));
  }

  getDetailForAllDaysService(selectedCustomerList, selectedModelList, period): Observable<ICasesByHourChartValue> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/casesbyhour/${period}/weekdays?name=${customerList}&model=${selectedModelList}`;
    return this.commonService.get(serviceUrl)
      .catch(err => this.commonService.handleError(err));
  }
  getDetailForAllDaysEachBarService(selectedCustomerList, selectedModelList, period, frequency, hour): Observable<ICasesByHourChartValue> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/casesbyhour/${frequency}/${period}/` +
      `totalcases/customer?&name=${customerList}&model=${selectedModelList}&hour=${hour}`;
    return this.commonService.get(serviceUrl)
      .catch(err => this.commonService.handleError(err));
  }


}

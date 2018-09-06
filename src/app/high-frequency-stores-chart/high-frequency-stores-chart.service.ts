import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IHighFrequencyChart, IOnsiteBarChartDetail } from '../app.interface';


@Injectable()
export class HighFrequencyStoresChartService {

  constructor(private commonService: CommonService) {
  }

  getChartDataService(selectedCustomerList, selectedModelList, period, frequency, area): Observable<IHighFrequencyChart> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/highfrequencydispatchstores` +
      `/${period}/${frequency}/customer?name=${customerList}&model=${selectedModelList}&area=${area}`;

    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getDetailForEachBarService(
    selectedCustomerList, selectedModelList, frequency, fromDate, toDate, area, machineId): Observable<IOnsiteBarChartDetail> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl =
      `${CommonService.serverUrl}/casedata/casedetails/highfrequencydispatch`
      + `?startDate=${fromDate}&endDate=${toDate}&name=${customerList}`
      + `&model=${selectedModelList}&area=${area}&machineId=${machineId}`;

    return this.commonService.get(serviceUrl)
      .catch(err => this.commonService.handleError(err));
  }

}

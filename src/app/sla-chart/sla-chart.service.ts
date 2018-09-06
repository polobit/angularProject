import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { ICasesByZoneChart, IOnsiteBarChartDetail } from '../app.interface';

@Injectable()
export class SlaChartService {

  constructor(private commonService: CommonService) { }

  getChartDataService(selectedCustomerList, selectedModelList, period, frequency, zone): Observable<ICasesByZoneChart> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/servicelevelagreement/${period}/${frequency}`
      + `/customer?name=${customerList}&model=${selectedModelList}&zone=${zone}`;

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
    selectedCustomerList, selectedModelList, frequency, fromDate, toDate, zone, slaTime): Observable<IOnsiteBarChartDetail> {
      const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    let serviceUrl;
    if (frequency === 'daily') {
      serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/casesbyzone`
        + `?startDate=${fromDate}&name=${customerList}&model=${selectedModelList}&zone=${zone}&slaTime=${slaTime}`;
    } else {
      serviceUrl =
        `${CommonService.serverUrl}/casedata/casedetails/casesbyzone/betweenDates` +
        `?startDate=${fromDate}&endDate=${toDate}&name=${customerList}&model=${selectedModelList}&zone=${zone}&slaTime=${slaTime}`;
    }

    return this.commonService.get(serviceUrl)
      .catch(err => this.commonService.handleError(err));
  }
}

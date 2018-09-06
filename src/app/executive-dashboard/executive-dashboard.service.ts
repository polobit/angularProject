import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import {
  IDashboardTiles,
  IPieChartResponse,
  IUnitLifeSummary,
  IDispatchDataArray,
  ISuccessRatio
} from './../app.interface';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExecutiveDashboardService {

  constructor(private commonService: CommonService) { }

  getDashboardTiles(selectedCustomerList, selectedModelList, startDate, endDate, frequency): Observable<IDashboardTiles> {
    const url = `${CommonService.serverUrl}/user-server/executive/tileinfo?startDate=${startDate}&endDate=${endDate}`
      + `&name=${selectedCustomerList}&model=${selectedModelList}&days=${frequency}`;
    return this.commonService.get(url)
      .catch(err => this.commonService.handleError(err));
  }

  getPieChartDetails(selectedCustomerList, selectedModelList, startDate, endDate): Observable<IPieChartResponse[]> {
    const url = `${CommonService.serverUrl}/casedata/casedetails/dispatchcases?startDate=${startDate}&endDate=${endDate}`
      + `&customer=${selectedCustomerList}&models=${selectedModelList}`;
    return this.commonService.get(url)
      .catch(err => this.commonService.handleError(err));
  }

  getUnitLifeSummary(selectedCustomerList, selectedModelList): Observable<IUnitLifeSummary> {
    const url = `${CommonService.serverUrl}/unit-life-data/units/unitlifesummary`
      + `?customers=${selectedCustomerList}&models=${selectedModelList}`;
    return this.commonService.get(url)
      .catch(err => this.commonService.handleError(err));
  }

  getInterventionTableDataService(frequency, customerList, modelList, sortOrder): Observable<ISuccessRatio> {
    const serviceUrl = `${CommonService.serverUrl}/user-experience/charts/interventiondrivers/stores/`
      + `${frequency}?&name=${customerList}&model=${modelList}&offset=0&limit=5&sortOrder=${sortOrder}`;
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getDispatchTableDataService(startDate, endDate, customerList, modelList, sortOrder): Observable<IDispatchDataArray> {
    const serviceUrl = `${CommonService.serverUrl}/user-server/executive/dispatch`
      + `?startDate=${startDate}&endDate=${endDate}&name=${customerList}&model=${modelList}&sort=${sortOrder}&limit=5`;
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }
}

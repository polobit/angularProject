import { Injectable } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Observable } from 'rxjs/Observable';
import { IUnitData, ICase } from 'app/app.interface';
import * as _ from 'lodash';

@Injectable()
export class UnitLifeService {
  private unitLifeData: IUnitData;
  constructor(private commonService: CommonService) { }

  getUnitLifeData(customerList, modelList, pageOffset, pageLimit, threshold?): Observable<IUnitData> {
     const customers = this.commonService.customerListInterceptor(customerList);
     const serviceUrl = `${CommonService.serverUrl}/unit-life-data/units/`
      + `?customers=${customers}&models=${modelList}&offset=${pageOffset}&limit=${pageLimit}&priority=${threshold}`;
    return this.commonService.get(serviceUrl)
      .map((data: IUnitData) => {
        this.unitLifeData = data;
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getUnitLifeDataSpecific(machineId, selectedCustomerList, selectedModelList, pageOffset, pageLimit) {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/unit-life-data/units/`
      + `?customers=${customerList}&models=${selectedModelList}&offset=${pageOffset}&limit=${pageLimit}&priority=ALL`;
    return this.commonService.get(serviceUrl)
      .map((response: IUnitData) => {
        return response;
      })
      .catch(err => this.commonService.handleError(err));
  }

  getUnitCaseHistory(machineId: String): Observable<ICase[]> {
    const serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/unit-life-data`
      + `?machineId=${machineId}`;
    return this.commonService.get(serviceUrl)
      .map((data: any) => {
        return data.caseDetails;
      })
      .catch(err => this.commonService.handleError(err));
  }
}

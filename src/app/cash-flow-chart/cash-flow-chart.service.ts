import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { ICashFLowChart } from '../app.interface';

@Injectable()
export class CashFlowChartService {

  constructor(private commonService: CommonService) { }

  getChartDataService(selectedCustomerList, selectedModelList, period): Observable<ICashFLowChart> {
    const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
    const serviceUrl = `${CommonService.serverUrl}/cashflowinnovation/`
      + `reliabilitytree/${period}/customer?name=${customerList}&model=${selectedModelList}`;
    return this.commonService.get(serviceUrl)
      .map(data => {
        return data;
      })
      .catch(err => this.commonService.handleError(err));
  }
}

import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ICaseHistory, ICaseDetailsHistory } from '../app.interface';
@Injectable()
export class CaseHistoryService {

  constructor(private commonService: CommonService) { }
  getCaseHistoryService(id): Observable<ICaseDetailsHistory> {
    const serviceUrl = `${CommonService.serverUrl}/casedata/casedetails/unit-life-data?machineId=${id}`;
    return this.commonService.get(serviceUrl)
    .catch(err => this.commonService.handleError(err));
  }

}

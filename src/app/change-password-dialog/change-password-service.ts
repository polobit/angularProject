
import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IPasswordDetails } from '../app.interface';
@Injectable()
export class ChangePasswordService {
  public responseStatus: number;
  constructor(private commonService: CommonService, private http: Http) { }

  updatePasswordService(data): Observable<IPasswordDetails[]> {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/user/resetpassword`;
    return this.commonService.put(serviceUrl, data);
        // .catch(err => this.commonService.handleError(err));
}
}

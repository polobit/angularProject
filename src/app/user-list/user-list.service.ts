import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IUserList, ICustListDetails } from '../app.interface';
import { Http } from '@angular/http';

@Injectable()
export class UserListService {

  constructor(private commonService: CommonService,
    private http: Http) { }

  getUserListService(userType): Observable<IUserList> {
    const serviceUrl = `${CommonService.serverUrl}/user-server/admin/usertype?usertype=${userType}`;
    return this.commonService.get(serviceUrl)
      .catch(err => this.commonService.handleError(err));
  }

  deleteUserService(id): Observable<any> {
    const serviceUrl = `${CommonService.serverUrl}/user-server/admin/deleteuser/${id}`;
    return this.commonService.delete(serviceUrl);
      // .catch(err => this.commonService.handleError(err));
  }

  // deleteCustomerService(id): Observable<IUserList> {
  //   const serviceUrl = `http://192.168.2.242:8079/api/user-server/customeradmin/deletecustomer/${id}`;
  //   return this.commonService.delete(serviceUrl);
  //     // .catch(err => this.commonService.handleError(err));
  // }
  getCustomerListInfoService(): Observable<ICustListDetails> {
    const serviceUrl = `${CommonService.serverUrl}/user-server/customeradmin/getcustomers`;
    return this.commonService.get(serviceUrl)
      .catch(err => this.commonService.handleError(err));
  }
}

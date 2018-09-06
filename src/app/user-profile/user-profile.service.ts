import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IUserInfo, IUserCount, IUserPermission, ICustListDetails, ICustomerPermission, ICustomerList  } from '../app.interface';

@Injectable()
export class UserProfileService {

  constructor(private commonService: CommonService) { }

  getUserInfoService(): Observable<IUserInfo> {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/user/profile`;
    return this.commonService.get(serviceUrl);
      // .catch(err => this.commonService.handleError(err));
  }

  getUserPermissionService(userType): Observable<any> {
    // let serviceUrl = `${CommonService.serverUrl}`;
    // serviceUrl += userType === 'admin' || userType === 'super-admin' ? '/user-server/admin/user/getpermission'
    //   : '/user-server/users/user/getpermission';
    // return this.commonService.get(serviceUrl)
    return this.commonService.getUserPermission()
    .map((response) => {
      return response;
    });
      // .catch(err => this.commonService.handleError(err));
  }

  getSelectedUserInfoService(id): Observable<IUserInfo> {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/getuser/${id}`;
    return this.commonService.get(serviceUrl)
    .map((response) => {
      return response;
    });
      // .catch(err => this.commonService.handleError(err));
  }

  getUserCountService(): Observable<IUserCount> {
    const serviceUrl = `${CommonService.serverUrl}/user-server/admin/getuserscount`;
    return this.commonService.get(serviceUrl)
    .map((response) => {
      return response;
    });
      // .catch(err => this.commonService.handleError(err));
  }

  getSelectedUserPermissionService(id): Observable<IUserPermission> {
    return this.commonService.getAdminPermissionById(id)
    .map((response) => {
      return response;
    });
      // .catch(err => this.commonService.handleError(err));
  }

  getSelectedCustomerPermissionService(id): Observable<ICustomerPermission> {
    return this.commonService.getCustomerAdminPermissionsById(id)
    .map((response) => {
      return response;
    });
      // .catch(err => this.commonService.handleError(err));
  }

  updatePermissionService(id, data, anotherUser) {
    const serviceUrl = anotherUser === false ? `${CommonService.serverUrl}`
      + `/user-server/admin/updatepermission` : `${CommonService.serverUrl}`
      + `/user-server/admin/updatepermissions/${id}`;
    return this.commonService.put(serviceUrl, data)
    .map((response) => {
      return response;
    });
      // .catch(err => this.commonService.handleError(err));
  }

  updateCustomerPermissionService(id, data, anotherUser) {
    const serviceUrl = `${CommonService.serverUrl}`
      + `/user-server/admin/updatepermissions/${id}`;
    return this.commonService.put(serviceUrl, data)
    .map((response) => {
      return response;
    });
      // .catch(err => this.commonService.handleError(err));
  }

  getStoreDetails() {
    const serviceUrl = `${CommonService.serverUrl}/user-server/customeradmin/getstoredetails`;
    return this.commonService.get(serviceUrl)
    .map((response) => {
      return response;
    });
      // .catch(err => this.commonService.handleError(err));
    }

    getLoginPermissionService(): Observable<IUserPermission> {
      return this.commonService.getUserPermission()
      .map((response) => {
        return response;
      });
      // .catch(err => this.commonService.handleError(err));
    }

}

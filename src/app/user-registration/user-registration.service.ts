import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserRegistrationService {
  public responseStatus: number;
  constructor(private commonService: CommonService) { }

  registerUserService(data, registerToken) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/createuser/${registerToken}`;
    return this.commonService.post(serviceUrl, data, this.commonService.options)
      .catch(err => { throw err; });
  }

  getInvitedUserInfoService(registerToken) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/getinviteduserinfo/${registerToken}`;
    return this.commonService.get(serviceUrl)
      .catch(err => {
        throw err;
      });
  }
  isStoreNumberService(store, inviteId) {
    const serviceUrl =  `${CommonService.serverUrl}/user-server/users/isstoreexists?storeNumbers=${store}&id=${inviteId}`;
    return this.commonService.getResponseWithHeader(serviceUrl);
  }
}

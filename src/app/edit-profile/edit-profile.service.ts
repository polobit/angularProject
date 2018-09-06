import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../services/common.service';
import { IUserInfo, IUserCount, IUserPermission, ICustListDetails, ICustomerPermission  } from '../app.interface';

@Injectable()
export class EditProfileService {

  constructor(private commonService: CommonService) { }

  updateCustomerProfile(data) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/user`;
    return this.commonService.put(serviceUrl, data);
  }

  isStoreNumberService(data) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/user`;
    return this.commonService.putResponseWithHeader(serviceUrl, data);
  }
}

import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';

@Injectable()
export class ResetPasswordService {

  constructor(private commonService: CommonService) { }

  resetPasswordService(data, resetId) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/resetpassword?id=${resetId}`;
    return this.commonService.put(serviceUrl, data)
      .catch(err => { throw err; });
  }

  getUrlStatusService(resetId) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/resetpassword/status?id=${resetId}`;
    return this.commonService.getResponseWithHeader(serviceUrl)
      .catch(err => { throw err; });
  }

}

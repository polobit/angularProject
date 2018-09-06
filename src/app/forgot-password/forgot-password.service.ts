import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';


@Injectable()
export class ForgotPasswordService {

  constructor(private commonService: CommonService) { }

  sendLinkService(email) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/forgotpassword?email=${email}`;
    return this.commonService.getResponseWithHeader(serviceUrl)
      .catch(err => { throw err; });
  }

}

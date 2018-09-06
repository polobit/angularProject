import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import { Headers, RequestOptions, Response } from '@angular/http';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EmailInviteService {

  constructor(private commonService: CommonService, private http: HttpClient) { }

  sendEmailService(data) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/registration/inviteuser`;
    return this.commonService.post(serviceUrl, data)
      .catch(err => {
        throw err;
      });
  }
}

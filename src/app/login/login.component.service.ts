import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import { Headers, RequestOptions, Response } from '@angular/http';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoginComponentService {

  constructor(private commonService: CommonService, private http: HttpClient) { }

  getAccessService(data) {
    const serviceUrl = `${CommonService.serverUrl}/user-server/users/requestaccess`;
    return this.commonService.postResponseWithHeader(serviceUrl, data)
      .catch(err => {
        throw err;
      });
  }
}

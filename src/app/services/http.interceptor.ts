import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
    constructor(public auth: AuthService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = this.auth.getAccessToken();
            request = request.clone({
                setHeaders: {
                    Authorization: authToken !== null ? `Bearer ${this.auth.getAccessToken()}` : ''
                }
            });
        return next.handle(request);
    }
}


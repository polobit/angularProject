import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, Headers, RequestOptions } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Store } from '@ngrx/store';
import { Router} from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { OAuthService, ReceivedTokens } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { PARAMETERS } from '@angular/core/src/util/decorators';
import { OAuthEvent } from 'angular-oauth2-oidc/events';
import { AppConfiguration } from '../app.configuration';
import { CommonService } from '../services/common.service';

const PROFILE_URL = 'users/profile';

@Injectable()
export class AuthService {
    static readonly authServerUrl = AppConfiguration.authUrl;
    authInitiated: Boolean = false;

    loggedIn$ = new BehaviorSubject<boolean>(false);

    loggedIn = false;

    profile = null;

    user = null;

    // user$ = new BehaviorSubject<User>(null);

    jwtHelper = new JwtHelper();

    constructor(private http: HttpClient,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private oauthService: OAuthService) {
        this.oauthService.loginUrl = this.getAuthLoginUrl();
        this.oauthService.redirectUri = window.location.origin + '/home';
        this.oauthService.clientId = AppConfiguration.oAuth.clientId;
        this.oauthService.requireHttps = false;
        this.oauthService.oidc = false;
        this.oauthService.scope = 'read write';
        this.oauthService.setStorage(sessionStorage);
        this.oauthService.tryLogin().then((function (result) {
            location.hash = '';
            if (this.isAuthenticated() ) {
                this.router.navigate(['/home']);
            }
          }).bind(this));
    }

    public intiflow() {
        this.oauthService.initImplicitFlow();
    }

    getLogoutUrl() {
        return `${AuthService.authServerUrl}/logout`;
    }

    loginRedirect() {
        return `${AuthService.authServerUrl}/login`;
    }

    getAuthLoginUrl(): string {
        return `${AuthService.authServerUrl}/oauth/authorize?response_type=token&client_id=${AppConfiguration.oAuth.clientId}`;
    }

    triggerOAuth(): Observable<any> {
        if (this.isAuthInitiated()) {
            return;
        }
        sessionStorage.setItem('AuthInitiated', 'true');
        this.oauthService.initImplicitFlow();
    }

    logout() {
        sessionStorage.setItem('AuthInitiated', 'false');
        sessionStorage.removeItem('nonce');
        sessionStorage.removeItem('access_token');
        this.loggedIn$.next(false);
        this.http.post(this.getLogoutUrl(), {}, { withCredentials: true, responseType: 'text' })
            .subscribe(() => {
                this.loggedIn$.next(false);
                window.location.replace(this.loginRedirect());
                console.log('Logged out');
            }, error => {
                // temporary fix for firefox
                this.loggedIn$.next(false);
                window.location.replace(this.loginRedirect());
                console.log('Logged out');
            });
    }

    isAuthInitiated() {
        return sessionStorage.getItem('AuthInitiated') === 'true';
    }

    isAuthenticated(): boolean {
        const token = this.oauthService.getAccessToken();
        return !(token ? this.isExpired(token) : true);
    }

    isExpired(token): boolean {
        return this.jwtHelper.isTokenExpired(token);
    }

    getAccessToken(): string {
        return this.oauthService.getAccessToken();
    }

    public trylogin(): Promise<void> {
        return this.oauthService.tryLogin();
    }

    public isLoggedIn(): Observable<boolean> {
        // if already token extracted need not tryLogin
        if (this.isAuthenticated()) {
            this.loggedIn$.next(true);
            return this.loggedIn$;
        }
        this.oauthService.tryLogin().then ((function (result) {
            location.hash = '';
            if (this.authenticated) {
                this.loggedIn$.next(true);
                sessionStorage.setItem('AuthInitiated', 'false');
            } else {
                this.triggerOAuth();
            }
        }).bind(this));
        return this.loggedIn$;
    }

}

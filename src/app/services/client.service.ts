import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRouteSnapshot } from '@angular/router';

import { ICustomerList, IModelList, INotificationList, INotifiedUserInfo, IPasswordDetails, IUserPermission } from '../app.interface';
import { CommonService } from './common.service';
import {Http} from '@angular/http';
@Injectable()
export class ClientService {
    // Need to create UserService
    private userPermissions: IUserPermission ;
    constructor(private commonService: CommonService, private http: Http) {
        this.setUserPermission()
        .forEach(user => {
            this.userPermissions = user;
        });
    }

    setUserPermission(): Observable<IUserPermission> {
        return this.commonService.getUserPermission().
        map((e: IUserPermission ) => {
             return e;
        });
    }

    isUserActiveForRoute(route: ActivatedRouteSnapshot) {
        const path: string = route.routeConfig.path;
        if (path.startsWith('cashFlow') ) {
            return this.userPermissions.cashFlowInnovation;
        }

        if (path.startsWith('casesByHour') ) {
            return this.userPermissions.casesByHour;
        }

        if (path.startsWith('first-time-fix') ) {
            return this.userPermissions.firstTimeFix;
        }

        if (path.startsWith('casesByArea') ) {
            return this.userPermissions.casesByArea;
        }

        if (path.startsWith('sla') ) {
            return this.userPermissions.serviceLevelAgreement;
        }

        if (path.startsWith('onsitetime') ) {
            return this.userPermissions.casesByOnsiteHours;
        }

        if (path.startsWith('high-frequency-stores') ) {
            return this.userPermissions.highFrequencyDispatch;
        }

        if (path.startsWith('averageHours') ) {
            return this.userPermissions.averageHoursSpentOnsite;
        }

        if (path.startsWith('user-exp') ) {
            return this.userPermissions.userExperience;
        }

        if (path.startsWith('unit-life') ) {
            return this.userPermissions.unitLifeData;
        }

        if (path.startsWith('alert') ) {
            return !this.isCustomerUser();
        }
        return true;
    }

    public isCustomerUser() {
        if ( this.userPermissions) {
            return (this.userPermissions.userType === 'customer' || this.userPermissions.userType === 'customer-admin');
        }
        return true;
    }
    getUserPermission(): IUserPermission {
        return this.userPermissions;
    }

    getCustomerList(): Observable<ICustomerList[]> {
        return this.commonService.getCustomerListForLoggedInUser();
    }

    getAllCustomersList(): Observable<ICustomerList[]> {
        return this.commonService.getAllCustomersList();
    }

    getModelList(): Observable<IModelList[]> {
        const serviceUrl = `${CommonService.serverUrl}/modelinfo/models/`;
        return this.commonService.get(serviceUrl);
            // .catch(err => this.commonService.handleError(err));
    }

    getNotifications(): Observable<INotificationList[]> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/users/getunreadnotifications`;
        return this.commonService.get(serviceUrl);
            // .catch(err => this.commonService.handleError(err));
    }

    updateNotificationService(data): Observable<INotificationList[]> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/users/updatenotification`;
        return this.commonService.put(serviceUrl, data);
            // .catch(err => this.commonService.handleError(err));
    }

    getNotificationInfo(data): Observable<INotifiedUserInfo[]> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/admin/getuserid/${data.id}`;
        return this.commonService.get(serviceUrl, data);
    }

    updatePasswordService(data): Observable<IPasswordDetails[]> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/users/user/resetpassword`;
        return this.commonService.put(serviceUrl, data);
            // .catch(err => this.commonService.handleError(err));
    }

    getTimeStampService() {
        const serviceUrl = `${CommonService.serverUrl}/casedata/lastupdated/`;
        return this.commonService.get(serviceUrl)
          .map(data => {
            return data;
          })
          .catch(err => this.commonService.handleError(err));
    }

    scrollToElement(id) {
        const el = document.getElementById(`${id}`);
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

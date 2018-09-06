import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/operator/take';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserProfileService } from 'app/user-profile/user-profile.service';
import { IUserPermission } from 'app/app.interface';
import { ClientService } from 'app/services/client.service';

@Injectable()
export class KPIAuthGaurd implements CanActivate {

    constructor(private clientService: ClientService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
         return this.clientService.isUserActiveForRoute(route);
    }
}

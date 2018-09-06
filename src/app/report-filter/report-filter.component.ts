import { Component, OnInit, Input } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import * as _ from 'lodash';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {UserProfileService} from '../user-profile/user-profile.service';
import { IUserPermission} from '../app.interface';
@Component({
  selector: 'app-report-filter',
  templateUrl: './report-filter.component.html',
  styleUrls: ['./report-filter.component.scss'],
  providers: [UserProfileService]
})
export class ReportFilterComponent implements OnInit {
  public reportList = AppConfiguration.reportList;
  public selectedReport ;
  public Languages = Languages;
  public AppConfiguration = AppConfiguration;
  public permission: IUserPermission;
  public currentRoute;
  public reportlabeluser;
  public reportlabeldriver;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public userprofileService: UserProfileService
  ) {
    this.userprofileService.getLoginPermissionService()
    .forEach((permission: IUserPermission) => {
      this.permission = permission;
      if (this.permission.userExperience) {
        this.reportlabeluser = true ;
      }
      if (this.permission.interventionDriver) {
        this.reportlabeldriver = true;
      }
    });
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = {
          full: router.url,
          base: `/${router.url.split('/')[1]}`
        };
        if (this.currentRoute.base === '/user-exp') {
          this.selectedReport = 'user-exp';
        } else if (this.currentRoute.base === '/intervention') {
          this.selectedReport = 'intervention';
        }
      }
    });
  }

  ngOnInit() {
  }

  public change(routeLink) {
    this.router.navigate([`/${routeLink}`]);
  }
}

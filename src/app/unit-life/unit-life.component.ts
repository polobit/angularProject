import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material';
import { ISubscription } from 'rxjs/Subscription';
import { FilterService } from '../services/filter.service';
import { SecurePipe } from '../services/securepipe';
import { ClientService } from 'app/services/client.service';
import { AuthService } from './../auth/auth.service';
import { AppConfiguration, Languages } from '../app.configuration';
import { UnitLifeService } from 'app/unit-life/unit-life.component.service';
import { IUnitData, ICase, IUnitDataValue, ITimeStamp } from 'app/app.interface';
import { UserExperienceReportService } from '../user-experience-report/user-experience-report.service';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
  selector: 'app-unit-life',
  templateUrl: './unit-life.component.html',
  styleUrls: ['./unit-life.component.scss'],
  providers: [UnitLifeService, UserExperienceReportService]
})
export class UnitLifeComponent implements OnDestroy {
  @Input('isDashboard') isDashboard = false;
  public kpiTimeStampLabel = AppConfiguration.kpiList[8].timeStampKey;
  public unitData: IUnitDataValue[] = [];
  public caseHistory: ICase[] = [];
  public headers = ['customer', 'model', 'serial', 'path'];
  public caseHeaders = ['caseNumber', 'caseDate', 'jobType', 'description', 'phoneFix', 'status', 'comments'];
  public selectedCustomerList = [];
  public selectedModelList = [];
  public AppConfiguration = AppConfiguration;
  public moment = moment;
  public Languages = Languages;
  public customerChips: { removable: boolean, text: string }[] = [];
  public modelChips: { removable: boolean, text: string }[] = [];
  public thresholdList = AppConfiguration.global.threshold;
  public selectedThreshold = 'ALL';
  public itemsPerPage = 30;
  public pageSizeOptions = [10, 20, 30, 40, 50];
  public dataLength: number;
  public timeStamp: string;
  public notAvailable = Languages.get('global.notAvailable', 'upper');
  public pageIndex: number;
  public userType: string;

  private filterSubscription: ISubscription;
  private machineId: string;
  private pageOffset = 0;
  private pageLimit = 30;

  constructor(
    private router: Router,
    private filterService: FilterService,
    private clientService: ClientService,
    private unitLifeService: UnitLifeService,
    private authService: AuthService,
    private matPaginatorIntl: MatPaginatorIntl,
    private securePipe: SecurePipe,
    private userExperienceReportService: UserExperienceReportService
  ) {
    this.getTimeStampData();
    this.matPaginatorIntl.itemsPerPageLabel = Languages.get('global.itemsPerPage', 'start');
    this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
      this.selectedCustomerList = [];
      this.selectedModelList = [];
      this.selectedCustomerList.push(updatedFilter.customer);
      this.selectedModelList.push(updatedFilter.model);
      updatedFilter.customer.forEach(element => {
        this.customerChips.push({
          removable: element !== 'ALL',
          text: element
        });
      });
      updatedFilter.model.forEach(element => {
        this.modelChips.push({
          removable: element !== 'ALL',
          text: element
        });
      });
      this.getUnitLifeData();

      this.authService.loggedIn$
        .subscribe(e => {
          if (e) {
            this.clientService.setUserPermission()
              .subscribe(userp => {
                if (userp && userp.userType) {
                  this.userType = userp.userType;
                }
              });
          }
        });
    });
  }



  getUnitLifeData() {
    this.pageLimit = this.isDashboard ? 3 : this.pageLimit;
    // this.selectedThreshold = this.isDashboard ? 'HIGH' : this.selectedThreshold;
    this.unitLifeService.getUnitLifeData(
      this.selectedCustomerList,
      this.selectedModelList,
      this.pageOffset,
      this.pageLimit,
      this.selectedThreshold
    ).subscribe((unitDataResponse: IUnitData) => {
      if (unitDataResponse && unitDataResponse.units && unitDataResponse.units.length > 0) {
        if (this.dataLength !== unitDataResponse.totalDocuments) {
          this.pageIndex = 0;
        }
        this.dataLength = unitDataResponse.totalDocuments;
        this.unitData = unitDataResponse.units;
        if (this.isDashboard) {
          this.unitData = this.unitData.slice(0, 3);
        }
        this.unitData.forEach(element => {
          element.path = `${AppConfiguration.url}/modelinfo/model/?path=${element.path}`;
        });
      } else {
        this.unitData = [];
        this.dataLength = 0;
      }
    });
  }

  getMachineDetail(id) {
    if (this.userType !== 'customer-admin' && this.userType !== 'customer') {
      this.machineId = id;
      this.router.navigate(['/case-history', this.pageOffset, this.pageLimit, this.machineId]);
    }
  }

  change() {
    this.getUnitLifeData();
  }

  onPageChange(e) {
    this.pageOffset = e.pageIndex * e.pageSize;
    this.pageLimit = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getUnitLifeData();
  }

  getTimeStampData() {
    this.clientService.getTimeStampService()
      .subscribe((timeStampResponse: ITimeStamp[]) => {
        timeStampResponse.forEach(element => {
          if (element._id === this.kpiTimeStampLabel) {
            this.timeStamp = element.lastUpdateDate;
          }
        });
      });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }
}

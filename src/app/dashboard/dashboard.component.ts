import { ClientService } from './../services/client.service';
import { Component, ElementRef, OnDestroy, AfterViewChecked, ChangeDetectorRef, OnInit, Inject } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { FilterService } from '../services/filter.service';
import { AppConfiguration, Languages } from '../app.configuration';
import { IAverageHoursCard, IOnsiteTimeSpentCard, IFirstTimeFixCard, IUserPermission } from '../app.interface';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { UserProfileService } from 'app/user-profile/user-profile.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [DashboardService]
})

export class DashboardComponent implements OnDestroy, AfterViewChecked, OnInit {
    public averageTimeSpentOnSiteData: IAverageHoursCard;
    public onSiteTimeSpentData: IOnsiteTimeSpentCard;
    public casesByAreaData: IAverageHoursCard[] = new Array(AppConfiguration.casesByArea.areas.length);
    public casesBySLAData: IAverageHoursCard[] = new Array(AppConfiguration.casesByZones.zones.length);
    public highFrequencyDispatchStoresData;
    public casesByHourData;
    public moment = moment;
    public Languages = Languages;
    public AppConfiguration = AppConfiguration;
    public showAlertsOnly = false;
    public noAlerts: boolean;
    public selectedCustomerList = [];
    public selectedModelList = [];
    public firstTimeFixData;
    public permission: IUserPermission;
    public isDashboardLoaded = false;
    public notAvailable = Languages.get('global.notAvailable', 'upper');
    private filterSubscription: Subscription;
    // tslint:disable-next-line:member-ordering

    constructor(private dashboardService: DashboardService,
        private cdRef: ChangeDetectorRef,
        private userprofileService: UserProfileService,
        private filterService: FilterService,
        private clientService: ClientService,
        public route: ActivatedRoute,
        public elementRef: ElementRef) {
        this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
            this.selectedCustomerList = [];
            this.selectedModelList = [];
            this.selectedCustomerList.push(updatedFilter.customer);
            this.selectedModelList.push(updatedFilter.model);
            this.getAverageHourSpentOnSite(this.selectedCustomerList, this.selectedModelList);
            this.getOnSiteTimeSpentByTimeSlot(this.selectedCustomerList, this.selectedModelList);
            this.getCasesByArea(this.selectedCustomerList, this.selectedModelList);
            this.getHighFrequencyDispatchStores(this.selectedCustomerList, this.selectedModelList);
            this.getCasesByHour(this.selectedCustomerList, this.selectedModelList);
            this.getCasesByZone(this.selectedCustomerList, this.selectedModelList);
            this.getFirstTimeFix(this.selectedCustomerList, this.selectedModelList);
            this.userprofileService.getLoginPermissionService()
                .forEach((permission: IUserPermission) => {
                    this.permission = permission;
                    this.isDashboardLoaded = true;
                });
        });
        if (this.route.snapshot.data[0]['displayAlertsOnly'] === true) {
            this.showAlertsOnly = true;
        }
    }

    ngAfterViewChecked() {
        if (!this.elementRef.nativeElement.querySelectorAll('app-dashboard-card').length) {
            this.noAlerts = true;
        } else {
            this.noAlerts = false;
        }
        this.cdRef.detectChanges();
    }

    ngOnInit() {
        this.clientService.scrollToElement('card-container');
    }

    ngOnDestroy() {
        this.filterSubscription.unsubscribe();
    }

    getAverageHourSpentOnSite(selectedCustomerList, selectedModelList) {
        this.dashboardService.getAverageHoursCardService(selectedCustomerList, selectedModelList)
            .subscribe(averageTimeSpentOnSiteResponse => {
                this.averageTimeSpentOnSiteData = averageTimeSpentOnSiteResponse;
            });
    }

    getOnSiteTimeSpentByTimeSlot(selectedCustomerList, selectedModelList) {
        this.dashboardService.getOnSiteTimeSpentCardService(selectedCustomerList, selectedModelList)
            .subscribe((OnSiteTimeSpentByTimeSlotResponse: IOnsiteTimeSpentCard) => {
                this.onSiteTimeSpentData = OnSiteTimeSpentByTimeSlotResponse;
            });
    }

    getCasesByArea(selectedCustomerList, selectedModelList) {
        _.forEach(this.AppConfiguration.casesByArea.areas, (area, index) => {
            this.dashboardService.getCasesByAreaCardService(selectedCustomerList, area.apiKey, selectedModelList)
                .subscribe((casesByAreaResponse: IAverageHoursCard) => {
                    this.casesByAreaData[index] = casesByAreaResponse;
                });
        });
    }

    getHighFrequencyDispatchStores(selectedCustomerList, selectedModelList) {
        this.dashboardService.getHighFrequencyStoresCardService(selectedCustomerList, selectedModelList)
            .subscribe((response: IAverageHoursCard) => {
                this.highFrequencyDispatchStoresData = response;
            });
    }

    getCasesByHour(selectedCustomerList, selectedModelList) {
        this.dashboardService.getCasesByHourCardService(selectedCustomerList, selectedModelList)
            .subscribe((response: IOnsiteTimeSpentCard) => {
                this.casesByHourData = response;
            });
    }

    getCasesByZone(selectedCustomerList, selectedModelList) {
        _.forEach(this.AppConfiguration.casesByZones.zones, (zone, index) => {
            this.dashboardService.getCasesBySLACardService(selectedCustomerList, zone.apiKey, selectedModelList)
                .subscribe((casesBySLAResponse: IAverageHoursCard) => {
                    this.casesBySLAData[index] = casesBySLAResponse;
                });
        });
    }

    getFirstTimeFix(selectedCustomerList, selectedModelList) {
        this.dashboardService.getFirstTimeFixService(selectedCustomerList, selectedModelList)
            .subscribe((response: IFirstTimeFixCard) => {
                this.firstTimeFixData = response;
            });
    }

    hasKpiView(kpiName: String) {
        if (this.permission) {
            switch (kpiName) {
                case 'averageHoursSpentOnsite':
                    return this.permission.averageHoursSpentOnsite;
                case 'casesByArea':
                    return this.permission.casesByArea;
                case 'highFrequencyDispatch':
                    return this.permission.highFrequencyDispatch;
                case 'casesByHour':
                    return this.permission.casesByHour;
                case 'serviceLevelAgreement':
                    return this.permission.serviceLevelAgreement;
                case 'casesByOnsiteHours':
                    return this.permission.casesByOnsiteHours;
                case 'firstTimeFix':
                    return this.permission.firstTimeFix;
                default:
                    return true;
            }
        }
        return false;
    }

    slaIsAlertValidation(casesBySLAData, averageTarget) {
        if (casesBySLAData && casesBySLAData.lastUpdatedDayAverage === 0) {
            if (casesBySLAData.total !== 0) {
                return true;
            } else {
                return false;
            }
        } else if (casesBySLAData && _.toNumber(casesBySLAData.lastUpdatedDayAverage) < averageTarget) {
            return true;
        } else {
            return false;
        }
    }

    firstTimeFixIsAlertValidation(firstTimeFixData, averageTarget) {
        if (firstTimeFixData && firstTimeFixData.latestPercentage === '0.00') {
            if (firstTimeFixData.total !== 0) {
                return true;
            } else {
                return false;
            }
        } else if (firstTimeFixData && _.toNumber(firstTimeFixData.latestPercentage) < averageTarget) {
            return true;
        } else {
            return false;
        }
    }
}


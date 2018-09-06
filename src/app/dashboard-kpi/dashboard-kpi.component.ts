import { Component, Input, OnDestroy } from '@angular/core';
import { UserProfileService } from 'app/user-profile/user-profile.service';
import { Languages, AppConfiguration } from '../app.configuration';
import {
  IUserPermission, IAverageHoursCard,
  IOnsiteTimeSpentCard, IFirstTimeFixCard,
  IAlertCard, ICardsWithPeriod,
  ITimeStamp, IFirstTimeFixAllCase, ISlaAllZone
} from 'app/app.interface';
import { FilterService } from './../services/filter.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { ISubscription } from 'rxjs/Subscription';
import * as moment from 'moment';
import * as _ from 'lodash';
import { CommonService } from '../services/common.service';
import { DashboardKpiService } from './dashboard-kpi.service';
import { ClientService } from '../services/client.service';
@Component({
  selector: 'app-dashboard-kpi',
  templateUrl: './dashboard-kpi.component.html',
  styleUrls: ['./dashboard-kpi.component.scss'],
  providers: [UserProfileService, DashboardService, DashboardKpiService]
})
export class DashboardKpiComponent implements OnDestroy {
  @Input('userType') userType;
  public Languages = Languages;
  public AppConfiguration = AppConfiguration;
  public selectedCustomerList = [];
  public selectedModelList = [];
  public selectedPeriod;
  public selectedFrequency;
  public permission: IUserPermission;
  public averageTimeSpentOnSiteData: IAverageHoursCard;
  public onSiteTimeSpentData: IOnsiteTimeSpentCard;
  public casesByAreaData: IAverageHoursCard[] = new Array(AppConfiguration.casesByArea.areas.length);
  public casesBySLAData: IAverageHoursCard[] = new Array(AppConfiguration.casesByZones.zones.length);
  public highFrequencyDispatchStoresData: IAverageHoursCard;
  public casesByHourData;
  public firstTimeFixData: IFirstTimeFixCard;
  public kpiList = AppConfiguration.kpiList;
  public alertCount = 0;
  public alertCard: IAlertCard;
  public dashboardCard: IAlertCard;
  public dashboardCount = 0;
  public customerList = [];
  public noAlerts;
  public lastUpdatedAverageHour = AppConfiguration.kpiList[0].timeStampKey;
  public lastUpdatedOnsiteTime = AppConfiguration.kpiList[1].timeStampKey;
  public lastUpdatedCasesByArea = AppConfiguration.kpiList[2].timeStampKey;
  public lastUpdatedSla = AppConfiguration.kpiList[3].timeStampKey;
  public lastUpdatedHighFrequency = AppConfiguration.kpiList[4].timeStampKey;
  public lastUpdatedCasesByHour = AppConfiguration.kpiList[5].timeStampKey;
  public lastUpdatedfirstTimeFix = AppConfiguration.kpiList[7].timeStampKey;
  public notAvailable = Languages.get('global.notAvailable', 'upper');
  private filterSubscription: ISubscription;

  constructor(private userprofileService: UserProfileService,
    private filterService: FilterService,
    private clientService: ClientService,
    private dashboardKpiService: DashboardKpiService,
    private dashboardService: DashboardService,
    private commonService: CommonService) {
    this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
      this.selectedCustomerList = [];
      this.selectedModelList = [];
      this.selectedCustomerList.push(updatedFilter.customer);
      this.selectedModelList.push(updatedFilter.model);
      this.selectedPeriod = updatedFilter.period;
      this.selectedFrequency
        = this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(updatedFilter.period)];
      this.customerList = this.commonService.customerListInterceptor(this.selectedCustomerList);
      this.getTimeStamp();
      this.userprofileService.getLoginPermissionService()
        .forEach((permission: IUserPermission) => {
          this.permission = permission;
          this.getDashboard();
        });
    });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  onsiteCheck(data): Boolean {
    return data.twoToFourHoursAverage > 0 || data.fourToTwelveHoursAverage > 0 || data.twelveToTwentyFourHoursAverage > 0;
  }

  getDashboard() {
    this.alertCount = 0;
    this.dashboardCount = 0;

    if (this.permission) {
      this.alertCard = undefined;
      this.dashboardCard = undefined;
      if (this.permission.averageHoursSpentOnsite) {
        this.dashboardKpiService.getAverageHoursCardService(
          this.customerList,
          this.selectedModelList,
          this.selectedPeriod,
          this.selectedFrequency
        )
          .subscribe(averageTimeSpentOnSiteResponse => {
            if (averageTimeSpentOnSiteResponse) {
              this.dashboardCount = this.dashboardCount + 1;
              if (averageTimeSpentOnSiteResponse.aggregateAverageHours !== 0 && averageTimeSpentOnSiteResponse.aggregateAverageHours > 2
                && averageTimeSpentOnSiteResponse.aggregateAverageHours !== 0) {
                if (this.alertCard === undefined) {
                  this.alertCard = {
                    kpiName: 'averageHoursSpentOnsite',
                    link: '/averageHours/report',
                    title: Languages.get(`kpi.averageNumberOfHoursOnSite`, 'start'),
                    lastUpdated: this.lastUpdatedAverageHour,
                    kpiUnit: '',
                    kpiUnitType: Languages.get('global.hours', 'upper'),
                    kpiValue: averageTimeSpentOnSiteResponse.aggregateAverageHours
                    // previousAverage: averageTimeSpentOnSiteResponse.previousDayAverage,
                    // previousAverageUnit: Languages.get('global.hours', 'start'),
                    // percentageChange: averageTimeSpentOnSiteResponse.percentageChange,
                    // previousDayDate: averageTimeSpentOnSiteResponse.previousDayDate
                  };
                }
                this.alertCount = this.alertCount + 1;
              } else {
                if (this.dashboardCard === undefined) {
                  this.dashboardCard = {
                    kpiName: 'averageHoursSpentOnsite',
                    link: '/averageHours/report',
                    title: Languages.get(`kpi.averageNumberOfHoursOnSite`, 'start'),
                    lastUpdated: this.lastUpdatedAverageHour,
                    kpiUnit: '',
                    kpiUnitType: Languages.get('global.hours', 'upper'),
                    kpiValue: averageTimeSpentOnSiteResponse.aggregateAverageHours === 0 ? this.notAvailable
                      : averageTimeSpentOnSiteResponse.aggregateAverageHours
                    // previousAverage: averageTimeSpentOnSiteResponse.previousDayAverage,
                    // previousAverageUnit: Languages.get('global.hours', 'start'),
                    // percentageChange: averageTimeSpentOnSiteResponse.percentageChange,
                    // previousDayDate: averageTimeSpentOnSiteResponse.previousDayDate
                  };
                }
              }
            }
          });
      }
      if (this.permission.casesByOnsiteHours) {
        this.dashboardKpiService.getOnSiteTimeSpentCardService(
          this.customerList,
          this.selectedModelList,
          this.selectedPeriod,
          this.selectedFrequency)
          .subscribe((OnSiteTimeSpentByTimeSlotResponse: ICardsWithPeriod) => {
            if (OnSiteTimeSpentByTimeSlotResponse) {
              this.dashboardCount = this.dashboardCount + 4;
              if (this.alertCard === undefined && this.onsiteCheck(OnSiteTimeSpentByTimeSlotResponse)) {
                this.alertCard = {
                  kpiName: 'casesByOnsiteHours',
                  link: '',
                  title: '',
                  lastUpdated: this.lastUpdatedOnsiteTime,
                  kpiUnit: '',
                  kpiUnitType: Languages.get('global.cases', 'start'),
                  kpiValue: '',
                  onsiteSlot: 2
                  // previousAverage: '',
                  // previousAverageUnit: Languages.get('global.hours', 'start'),
                  // percentageChange: '',
                  // previousDayDate: '',
                };
                if (OnSiteTimeSpentByTimeSlotResponse.twoToFourHoursAverage > 0) {
                  this.alertCard.title = Languages.get('kpi.onSiteTimeSpent', 'start') + '<br>' + Languages.get('filter.2-4hrs');
                  this.alertCard.link = '/onsitetime/2';
                  this.alertCard.onsiteSlot = 2;
                  this.alertCard.kpiValue = OnSiteTimeSpentByTimeSlotResponse.twoToFourHoursAverage;
                  this.alertCount = this.alertCount + 1;
                }
                if (OnSiteTimeSpentByTimeSlotResponse.fourToTwelveHoursAverage > 0) {
                  this.alertCard.title = Languages.get('kpi.onSiteTimeSpent', 'start') + '<br>' + Languages.get('filter.4-12hrs');
                  this.alertCard.link = '/onsitetime/3';
                  this.alertCard.onsiteSlot = 3;
                  this.alertCard.kpiValue = OnSiteTimeSpentByTimeSlotResponse.fourToTwelveHoursAverage;
                  this.alertCount = this.alertCount + 1;
                }
                if (OnSiteTimeSpentByTimeSlotResponse.twelveToTwentyFourHoursAverage > 0) {
                  this.alertCard.title = Languages.get('kpi.onSiteTimeSpent', 'start') + '<br>' + Languages.get('filter.12-24hrs');
                  this.alertCard.link = '/onsitetime/4';
                  this.alertCard.onsiteSlot = 4;
                  this.alertCard.kpiValue = OnSiteTimeSpentByTimeSlotResponse.twelveToTwentyFourHoursAverage;
                  this.alertCount = this.alertCount + 1;
                }
              } else {
                if (this.dashboardCard === undefined) {
                  this.dashboardCard = {
                    kpiName: 'casesByOnsiteHours',
                    link: '/onsitetime/1',
                    title: Languages.get('kpi.onSiteTimeSpent', 'start') + '<br>' + Languages.get('filter.0-2hrs'),
                    lastUpdated: this.lastUpdatedOnsiteTime,
                    kpiUnit: '',
                    kpiUnitType: Languages.get('global.cases', 'start'),
                    kpiValue: OnSiteTimeSpentByTimeSlotResponse.zeroToTwoHoursAverage
                    // previousAverage: '',
                    // previousAverageUnit: Languages.get('global.hours', 'start'),
                    // percentageChange: '',
                    // previousDayDate: ''
                  };
                }
              }
            }
          });
      }
      if (this.permission.casesByArea) {
        _.forEach(this.AppConfiguration.casesByArea.areas, (area, index) => {
          this.dashboardKpiService.getCasesByAreaCardService(
            this.customerList,
            area.apiKey,
            this.selectedModelList,
            this.selectedPeriod,
            this.selectedFrequency)
            .subscribe((casesByAreaResponse: IAverageHoursCard) => {
              this.casesByAreaData[index] = casesByAreaResponse;
              if (this.casesByAreaData.length > 0) {
                if (casesByAreaResponse.totalCases !== undefined) {
                  this.dashboardCount = this.dashboardCount + 1;
                  if (casesByAreaResponse.totalCases > area.averageTarget) {
                    if (this.alertCard === undefined) {
                      this.alertCard = {
                        kpiName: 'casesByArea',
                        link: '/casesByArea/' + area.name,
                        area: area.name,
                        title: Languages.get('kpi.numberOfCases', 'start') + '<br>'
                          + Languages.get('filter.' + area.name, 'capitalizeFirst'),
                        lastUpdated: this.lastUpdatedCasesByArea,
                        kpiUnit: Languages.get('global.cases', 'upper'),
                        kpiUnitType: Languages.get('global.cases', 'start'),
                        kpiValue: casesByAreaResponse.totalCases
                        // previousAverage: casesByAreaResponse[index].previousDayAverage,
                        // previousAverageUnit: Languages.get('global.cases', 'start'),
                        // percentageChange: casesByAreaResponse[index].percentageChange,
                        // previousDayDate: casesByAreaResponse[index].previousDayDate
                      };
                    }
                    this.alertCount = this.alertCount + 1;
                  } else {
                    if (this.dashboardCard === undefined) {
                      this.dashboardCard = {
                        kpiName: 'casesByArea',
                        link: '/casesByArea/' + area.name,
                        title: Languages.get('kpi.numberOfCases', 'start') + '<br>'
                          + Languages.get('filter.' + area.name, 'capitalizeFirst'),
                        lastUpdated: this.lastUpdatedCasesByArea,
                        kpiUnit: Languages.get('global.cases', 'upper'),
                        kpiUnitType: Languages.get('global.cases', 'start'),
                        kpiValue: casesByAreaResponse.totalCases
                        // previousAverage: casesByAreaResponse[index].previousDayAverage,
                        // previousAverageUnit: Languages.get('global.cases', 'start'),
                        // percentageChange: casesByAreaResponse[index].percentageChange,
                        // previousDayDate: casesByAreaResponse[index].previousDayDate
                      };
                    }
                  }
                }
              }
            });
        });
      }
      if (this.permission.highFrequencyDispatch) {
        this.dashboardKpiService.getHighFrequencyStoresCardService(
          this.customerList,
          this.selectedModelList,
          this.selectedPeriod,
          this.selectedFrequency
        )
          .subscribe((highFrequencyDispatchResponse: ICardsWithPeriod) => {
            this.dashboardCount = this.dashboardCount + 1;
            if (highFrequencyDispatchResponse && highFrequencyDispatchResponse.totalStores > 3) {
              if (this.alertCard === undefined) {
                this.alertCard = {
                  kpiName: 'highFrequencyDispatch',
                  link: '/high-frequency-stores',
                  title: Languages.get('kpi.highFrequencyDispatch', 'start'),
                  lastUpdated: this.lastUpdatedHighFrequency,
                  kpiUnit: Languages.get('global.stores', 'start'),
                  kpiUnitType: '',
                  kpiValue: highFrequencyDispatchResponse.totalStores
                  // previousAverage: '',
                  // previousAverageUnit: '',
                  // percentageChange: '',
                  // previousDayDate: ''
                };
              }
              this.alertCount = this.alertCount + 1;
            } else {
              if (this.dashboardCard === undefined) {
                this.dashboardCard = {
                  kpiName: 'highFrequencyDispatch',
                  link: '/high-frequency-stores',
                  title: Languages.get('kpi.highFrequencyDispatch', 'start'),
                  lastUpdated: this.lastUpdatedHighFrequency,
                  kpiUnit: Languages.get('global.stores', 'start'),
                  kpiUnitType: '',
                  kpiValue: highFrequencyDispatchResponse.totalStores
                  // previousAverage: '',
                  // previousAverageUnit: '',
                  // percentageChange: '',
                  // previousDayDate: ''
                };
              }
            }
          });
      }
      if (this.permission.casesByHour) {
        this.dashboardKpiService.getCasesByHourCardService(
          this.customerList,
          this.selectedModelList,
          this.selectedPeriod
        )
          .subscribe(casesByHourResponse => {
            this.dashboardCount = this.dashboardCount + 1;
            if (this.dashboardCard === undefined) {
              if (casesByHourResponse[0].totalCases) {
                this.dashboardCard = {
                  kpiName: 'casesByHour',
                  link: '/casesByHour',
                  title: Languages.get('kpi.casesByHour', 'start'),
                  lastUpdated: this.lastUpdatedCasesByHour,
                  kpiUnit: Languages.get('global.hours', 'start'),
                  kpiUnitType: '',
                  kpiValue: casesByHourResponse[0].totalCases
                };
              }
            }
          });
      }
      if (this.permission.serviceLevelAgreement) {
        _.forEach(this.AppConfiguration.casesByZones.zones, (zone, index) => {
          this.dashboardKpiService.getCasesBySLACardService(
            this.customerList,
            this.selectedModelList,
            this.selectedPeriod,
            this.selectedFrequency,
            zone.apiKey,
          )
            .subscribe((casesBySLAResponse: ISlaAllZone) => {
              if (casesBySLAResponse.inTimePercentage) {
                this.dashboardCount = this.dashboardCount + 1;
                if (casesBySLAResponse.inTimePercentage !== 0
                  && casesBySLAResponse.inTimePercentage < zone.averageTarget
                  && casesBySLAResponse.total !== 0) {
                  if (this.alertCard === undefined) {
                    this.alertCard = {
                      kpiName: 'serviceLevelAgreement',
                      link: '/sla/' + zone.apiKey,
                      zone: zone.apiKey,
                      title: Languages.get('kpi.serviceLevelAgreement', 'start') + '<br>'
                        + Languages.get('filter.' + zone.key, 'capitalizeFirst'),
                      lastUpdated: this.lastUpdatedSla,
                      kpiUnit: Languages.get('global.cases', 'upper'),
                      kpiUnitType: 'percentage',
                      kpiValue: casesBySLAResponse.inTimePercentage
                      // previousAverage: casesBySLAResponse[index].previousDayAverage,
                      // previousAverageUnit: Languages.get('global.percentUnit'),
                      // percentageChange: casesBySLAResponse[index].percentageChange,
                      // previousDayDate: casesBySLAResponse[index].previousDayDate
                    };
                  }
                  this.alertCount = this.alertCount + 1;
                } else {
                  if (this.dashboardCard === undefined) {
                    this.dashboardCard = {
                      kpiName: 'serviceLevelAgreement',
                      link: '/sla/' + zone.apiKey,
                      title: Languages.get('kpi.serviceLevelAgreement', 'start') + '<br>'
                        + Languages.get('filter.' + zone.key, 'capitalizeFirst'),
                      lastUpdated: this.lastUpdatedSla,
                      kpiUnit: Languages.get('global.cases', 'upper'),
                      kpiUnitType: 'percentage',
                      kpiValue: casesBySLAResponse.total === 0 ? this.notAvailable
                        : casesBySLAResponse.inTimePercentage
                      // previousAverage: casesBySLAResponse[index].previousDayAverage,
                      // previousAverageUnit: Languages.get('global.percentUnit'),
                      // percentageChange: casesBySLAResponse[index].percentageChange,
                      // previousDayDate: casesBySLAResponse[index].previousDayDate
                    };
                  }
                }
              }
            });
        });
      }
      if (this.permission.firstTimeFix) {
        this.dashboardKpiService.getFirstTimeFixService(
          this.customerList,
          this.selectedModelList,
          this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)],
          this.AppConfiguration.global.periods.reportFrequency
          [this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)])
          .subscribe((firstTimeFixResponse: IFirstTimeFixAllCase) => {
            this.dashboardCount = this.dashboardCount + 1;
            if (firstTimeFixResponse && _.toNumber(firstTimeFixResponse.percentage) !== 0
              && _.toNumber(firstTimeFixResponse.percentage) < AppConfiguration.firstTimeFix.alertTarget
              && _.toNumber(firstTimeFixResponse.total) !== 0) {
              if (this.alertCard === undefined) {
                this.alertCard = {
                  kpiName: 'firstTimeFix',
                  link: '/first-time-fix',
                  title: Languages.get('kpi.firstTimeFix', 'start'),
                  lastUpdated: this.lastUpdatedfirstTimeFix,
                  kpiUnit: '',
                  kpiUnitType: 'percentage',
                  kpiValue: _.toNumber(firstTimeFixResponse.percentage)
                  // previousAverage: firstTimeFixResponse.earlierCases,
                  // previousAverageUnit: Languages.get('global.cases', 'start'),
                  // percentageChange: firstTimeFixResponse.percentageChange,
                  // previousDayDate: firstTimeFixResponse.earlierDate
                };
              }
              this.alertCount = this.alertCount + 1;
            } else {
              if (this.dashboardCard === undefined) {
                this.dashboardCard = {
                  kpiName: 'firstTimeFix',
                  link: '/first-time-fix',
                  title: Languages.get('kpi.firstTimeFix', 'start'),
                  lastUpdated: this.lastUpdatedfirstTimeFix,
                  kpiUnit: '',
                  kpiUnitType: 'percentage',
                  kpiValue: _.toNumber(firstTimeFixResponse.total) === 0 ? this.notAvailable
                    : _.toNumber(firstTimeFixResponse.percentage)
                  // previousAverage: firstTimeFixResponse.earlierCases,
                  // previousAverageUnit: Languages.get('global.cases', 'start'),
                  // percentageChange: firstTimeFixResponse.percentageChange,
                  // previousDayDate: firstTimeFixResponse.earlierDate
                };
              }
            }
          });
      }
    }
  }

  getTimeStamp() {
    this.clientService.getTimeStampService()
      .subscribe((timeStampResponse: ITimeStamp[]) => {
        timeStampResponse.forEach(element => {
          if (element._id === this.lastUpdatedAverageHour) {
            this.lastUpdatedAverageHour = moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          } else if (element._id === this.lastUpdatedOnsiteTime) {
            this.lastUpdatedOnsiteTime = moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          } else if (element._id === this.lastUpdatedHighFrequency) {
            this.lastUpdatedHighFrequency =
              moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          } else if (element._id === this.lastUpdatedCasesByHour) {
            this.lastUpdatedCasesByHour = moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          } else if (element._id === this.lastUpdatedSla) {
            this.lastUpdatedSla = moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          } else if (element._id === this.lastUpdatedCasesByArea) {
            this.lastUpdatedCasesByArea = moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          } else if (element._id === this.lastUpdatedfirstTimeFix) {
            this.lastUpdatedfirstTimeFix = moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          }
        });
      });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Languages, AppConfiguration } from '../app.configuration';
import { ISubscription } from 'rxjs/Subscription';
import { FilterService } from '../services/filter.service';
import { CommonService } from 'app/services/common.service';
import { DashboardKpiService } from './../dashboard-kpi/dashboard-kpi.service';
import { UserExperienceReportService } from '../user-experience-report/user-experience-report.service';
import { InterventionDriverService } from '../intervention-driver/intervention-driver.service';
import { ExecutiveDashboardService } from './executive-dashboard.service';
import { ClientService } from '../services/client.service';
import { AuthService } from '../auth/auth.service';
import {
  IDonutChart,
  IDashboardTiles,
  IPieChart,
  IPieChartResponse,
  IUnitLifeSummary,
  IDispatchDataArray,
  ISuccessRatio,
  ITimeStamp,
  ISlaAllZone,
  IFirstTimeFixAllCase,
  IAverageOnsiteTimeSpentCardAllSlot
} from '../app.interface';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-executive-dashboard',
  templateUrl: './executive-dashboard.component.html',
  styleUrls: ['./executive-dashboard.component.scss'],
  providers: [DashboardKpiService, UserExperienceReportService, InterventionDriverService, ExecutiveDashboardService]
})
export class ExecutiveDashboardComponent implements OnInit, OnDestroy {
  public selectedCustomerList = [];
  public selectedModelList = [];
  public customerList = [];
  public customerChips: { removable: boolean, text: string }[] = [];
  public modelChips: { removable: boolean, text: string }[] = [];
  public periodChips: { removable: boolean, text: string };
  public Languages = Languages;
  public AppConfiguration = AppConfiguration;
  public selectedPeriod;
  public selectedFrequency;
  public userExperinceChart: IDonutChart[];
  public interventionChart: IDonutChart[];
  public userExperinceChartValue: string;
  public interventionChartValue: string;
  public userExperienceSubTitle = Languages.get('global.successRatio', 'start');
  public interventionSubTitle = Languages.get('global.interventionRatioTitle', 'start');
  public tilesData: IDashboardTiles;
  public pieChartData: IPieChart[];
  public pieChartResponse: IPieChartResponse[];
  public slaZoneData: ISlaAllZone;
  public averageOnsiteData: number;
  public firstTimeFixData: IFirstTimeFixAllCase;
  public unitLifeSummary: IUnitLifeSummary;
  public dispatchTableData = [];
  public interventionTableData = [];
  public sortOrder;
  public selectedDispatchValue = 'topFive';
  public selectedInterventionValue = 'topFive';
  public values = [
    { code: 'bottomFive', name: 'High Performers' },
    { code: 'topFive', name: 'Low Performers' }
  ];
  public interventionColumns = ['store', 'interventionCount'];
  public dispatchColumns = ['store', 'dispatch'];
  public titleColor: string;
  public userType: string;
  public slaTimeStamp: string;
  public firstTimeFixTimeStamp: string;
  public averageOnsiteTimeLastUpdated: string;
  public round = _.round;
  public notAvailable = Languages.get('global.notAvailable', 'upper');

  private startDate;
  private endDate;
  private filterSubscription: ISubscription;
  private slaLabel = AppConfiguration.kpiList[3].timeStampKey;
  private firstTimeFixLabel = AppConfiguration.kpiList[7].timeStampKey;
  private averageOnsiteTimeLabel = AppConfiguration.kpiList[0].timeStampKey;


  constructor(private filterService: FilterService,
    private commonService: CommonService,
    private clientService: ClientService,
    private authService: AuthService,
    private dashboardKpiService: DashboardKpiService,
    private userExperienceReportService: UserExperienceReportService,
    private interventionDriverService: InterventionDriverService,
    private executiveDashboardService: ExecutiveDashboardService) {
    this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
      this.selectedCustomerList = [];
      this.selectedModelList = [];
      this.selectedCustomerList.push(updatedFilter.customer);
      this.selectedModelList.push(updatedFilter.model);
      this.selectedPeriod = updatedFilter.period;
      this.selectedFrequency
        = this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(updatedFilter.period)];

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

      this.periodChips = {
        removable: updatedFilter.period !== 'pastthirtydays',
        text: updatedFilter.period
      };

      this.customerList = this.commonService.customerListInterceptor(this.selectedCustomerList);
      let loggedIn = false;
      this.authService.loggedIn$
        .subscribe(e => {
          if (e) {
            this.clientService.setUserPermission()
              .subscribe(userp => {
                if (userp) {
                  this.userType = userp.userType;
                  if (loggedIn) {
                    return;
                  }
                  if (this.userType !== 'customer' && this.userType !== 'customer-admin') {
                    this.getSlaCardDetails();
                  } else if (this.userType === 'customer' || this.userType === 'customer-admin') {
                    this.getAverageOnsiteCardDetails();
                  }
                  this.getTimeStamp();
                  this.getDates();
                  this.getSuccessRatio();
                  this.getInterventionRatio();
                  this.getFirstTimeFix();
                  this.getUnitLifeSummary();
                  this.changeDispatch();
                  this.changeIntervention();
                  this.getInterventionTableData();
                  loggedIn = true;
                }
              });
          }
        });
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  getDates() {
    this.endDate = moment().subtract(1, 'days').format('MM/DD/YYYY');
    this.startDate = '';
    if (this.selectedFrequency === 'weekly') {
      this.startDate = moment().subtract(181, 'day').format('MM/DD/YYYY');
    } else if (this.selectedFrequency === 'monthly') {
      this.startDate = moment().subtract(366, 'day').format('MM/DD/YYYY');
    } else {
      if (this.selectedPeriod === 'pastthirtydays') {
        this.startDate = moment(this.endDate).subtract(30, 'day').format('MM/DD/YYYY');
      } else {
        this.startDate = moment(this.endDate).subtract(7, 'day').format('MM/DD/YYYY');
      }
    }
    this.getDashboardTiles(this.startDate, this.endDate);
    this.getPieChart(this.startDate, this.endDate);
    this.getDispatchTableData(this.startDate, this.endDate);
  }

  getDashboardTiles(startDate, endDate) {
    this.executiveDashboardService.getDashboardTiles(
      this.customerList, this.selectedModelList, startDate, endDate, this.AppConfiguration.global.periods.reportFrequency
      [this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)])
      .subscribe(tilesResponse => {
        this.tilesData = tilesResponse;
      });
  }

  getSuccessRatio() {
    this.userExperienceReportService.getSuccessRatioAreaChartDataService(
      this.customerList, this.selectedModelList,
      this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)],
      this.AppConfiguration.global.periods.reportFrequency
      [this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)], false)
      .subscribe((response) => {
        const successRatio = _.round(_.toNumber(response.totalSuccessRatio), 2);
        let colorCode;
        if (successRatio < 99.30) {
          colorCode = '#EA4646';
        } else if (successRatio >= 99.30 && successRatio < 99.50) {
          colorCode = '#B3B3B3';
        } else if (successRatio >= 99.50) {
          colorCode = '#0A9729';
        }

        this.userExperinceChart = [
          {
            count: successRatio,
            color: colorCode
          },
          {
            count: 100 - successRatio,
            color: '#ccc'
          }
        ];
        this.titleColor = colorCode;
        this.userExperinceChartValue = `${successRatio}%`;
      });
  }

  getInterventionRatio() {
    this.interventionDriverService.getDowntimeRatioAreaChartDataService(
      this.customerList, this.selectedModelList,
      this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)],
      this.AppConfiguration.global.periods.reportFrequency
      [this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)], false)
      .subscribe((response) => {
        this.interventionChart = [
          {
            count: _.toNumber(response.totalInterventionRatio),
            color: '#FF9106'
          },
          {
            count: 100 - _.toNumber(response.totalInterventionRatio),
            color: '#ccc'
          }
        ];
        this.interventionChartValue = `${response.totalInterventionRatio}%`;
      });
  }

  getPieChart(startDate, endDate) {
    startDate = moment(startDate).subtract(7, 'day').format('MM/DD/YYYY');
    endDate = moment(endDate).subtract(7, 'day').format('MM/DD/YYYY');
    this.executiveDashboardService.getPieChartDetails(this.customerList, this.selectedModelList, startDate, endDate)
      .subscribe((pieChartResponse: IPieChartResponse[]) => {
        this.pieChartResponse = pieChartResponse;
        const TOTAL = _.sumBy(this.pieChartResponse, 'count');
        if (!_.isEmpty(this.pieChartResponse)) {
          pieChartResponse.forEach((element, i) => {
            if (i === 2) {
              element.count = element.count + pieChartResponse[4].count;
            }
          });
          pieChartResponse = pieChartResponse.slice(0, 4);

          this.pieChartData = _.map(pieChartResponse, (data) => (
            {
              label: data._id,
              value: data.count,
              percent: _.round((data.count * 100) / TOTAL, 2),
              color:
                _.toLower(data._id.substr(0, 8)) === 'in scope'
                  ? _.toLower(data._id) === 'in scope without part'
                    ? '#FFCF75' : '#FF8000' : _.toLower(data._id) === 'out of scope without part'
                    ? '#CC0000' : '#ff5050'
            }));
        }
      });
  }

  getUnitLifeSummary() {
    this.executiveDashboardService.getUnitLifeSummary(this.customerList, this.selectedModelList)
      .subscribe((unitLifeSummaryResponse: IUnitLifeSummary) => {
        this.unitLifeSummary = unitLifeSummaryResponse;
        this.unitLifeSummary.averageNotesCount = _.round(unitLifeSummaryResponse.averageNotesCount, 2);
      });
  }

  getAverageOnsiteCardDetails() {
    this.dashboardKpiService.getAverageHoursCardService(this.customerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)])
      .subscribe((averageOnsiteCardResponse: IAverageOnsiteTimeSpentCardAllSlot) => {
        this.averageOnsiteData = _.round(averageOnsiteCardResponse.aggregateAverageHours, 2);
      });
  }

  getSlaCardDetails() {
    this.dashboardKpiService.getCasesBySLACardService(this.customerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)], 'ALL')
      .subscribe((casesBySLAResponse: ISlaAllZone) => {
        this.slaZoneData = casesBySLAResponse;
      });
  }

  getFirstTimeFix() {
    this.dashboardKpiService.getFirstTimeFixService(this.customerList,
      this.selectedModelList,
      this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)],
      this.AppConfiguration.global.periods.reportFrequency
      [this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)])
      .subscribe((response: IFirstTimeFixAllCase) => {
        this.firstTimeFixData = response;
      });
  }

  getDispatchTableData(startDate, endDate) {
    this.executiveDashboardService.getDispatchTableDataService(
      startDate,
      endDate,
      this.customerList,
      this.selectedModelList,
      this.sortOrder)
      .subscribe((dispatchDataResponse: IDispatchDataArray) => {
        if (dispatchDataResponse.caseDetails.length > 0) {
          this.dispatchTableData = dispatchDataResponse.caseDetails;
        } else {
          this.dispatchTableData = [];
        }
      });
  }

  getInterventionTableData() {
    this.executiveDashboardService.getInterventionTableDataService(
      this.AppConfiguration.global.periods.reportFrequency
      [this.AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)],
      this.customerList,
      this.selectedModelList,
      this.sortOrder)
      .subscribe((interventionDataResponse: ISuccessRatio) => {
        if (interventionDataResponse.chartData.length > 0) {
          this.interventionTableData = interventionDataResponse.chartData;
        } else {
          this.interventionTableData = [];
        }
      });
  }

  public changeIntervention() {
    if (this.selectedInterventionValue === 'topFive') {
      this.sortOrder = 'desc';
    } else if (this.selectedInterventionValue === 'bottomFive') {
      this.sortOrder = 'asc';
    }
    this.getInterventionTableData();
  }

  public changeDispatch() {
    if (this.selectedDispatchValue === 'topFive') {
      this.sortOrder = 'desc';
    } else if (this.selectedDispatchValue === 'bottomFive') {
      this.sortOrder = 'asc';
    }
    this.getDispatchTableData(this.startDate, this.endDate);
  }

  getTimeStamp() {
    this.clientService.getTimeStampService()
      .subscribe((timeStampResponse: ITimeStamp[]) => {
        timeStampResponse.forEach(element => {
          if (element._id === this.slaLabel) {
            this.slaTimeStamp = moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          } else if (element._id === this.firstTimeFixLabel) {
            this.firstTimeFixTimeStamp = moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          } else if (element._id === this.averageOnsiteTimeLabel) {
            this.averageOnsiteTimeLastUpdated =
              moment(element.lastUpdateDate).subtract(1, 'days').format(AppConfiguration.global.apiTimeFormat);
          }
        });
      });
  }
}

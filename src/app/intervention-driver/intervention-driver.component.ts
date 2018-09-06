import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { AppConfiguration, Languages } from '../app.configuration';
import { ISuccessRatio, ISuccessRatioData, IChartData, ITimeStamp, IDonutChart } from './../app.interface';
import { InterventionDriverService } from './intervention-driver.service';
import { FilterService } from '../services/filter.service';
import { ClientService } from 'app/services/client.service';
import { UserExperienceReportService } from '../user-experience-report/user-experience-report.service';
import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
  selector: 'app-intervention-driver',
  templateUrl: './intervention-driver.component.html',
  styleUrls: ['./intervention-driver.component.scss'],
  providers: [InterventionDriverService, UserExperienceReportService]
})
export class InterventionDriverComponent implements OnDestroy {
  @Input('width') width;
  @Input('height') height;
  @ViewChild('infoTable') infoTable;
  @ViewChild('infoTable2') infoTable2;
  @ViewChild('infoTable3') infoTable3;
  public kpiTimeStampLabel = AppConfiguration.kpiList[10].timeStampKey;
  public selectedPeriod;
  public selectedFrequency;
  public selectedCustomerList = [];
  public selectedModelList = [];
  public selectedCase = 'number';
  public selectedCaseType = 'ALL';
  public Languages = Languages;
  public AppConfiguration = AppConfiguration;
  public Location = Location;
  public customerChips: { removable: boolean, text: string }[] = [];
  public modelChips: { removable: boolean, text: string }[] = [];
  public periodChips: { removable: boolean, text: string };
  public interventionByUsedonutChartData: IDonutChart[];
  public donutCenterTitle: string;
  public donutCenterSubTitle = Languages.get('global.intervention', 'capitalize');
  public percentageChange: ISuccessRatioData;
  public interventionRatioData: any;
  public moment = moment;
  public isNumber = _.isNumber;
  public toNumber = _.toNumber;
  public round = _.round;
  public storeChartResponse: IChartData[];
  public userChartResponse: IChartData[];
  public transChartResponse: IChartData[];
  public chartData: IChartData[];
  public barChartData: IChartData[];
  public interventionByUserChartData: IChartData[];
  public interventionByStoreChartData: IChartData[];
  public interventionByTransChartData: IChartData[];
  public interventionByUserLength: number;
  public interventionByStoreLength: number;
  public interventionByTransLength: number;
  public interventionByUsertableData = [];
  public interventionByStoretableData = [];
  public interventionByTranstableData = [];
  public userColumnList = ['user', 'store', 'interventionCount', 'financialTransactions', 'interventionRatio'];
  public transColumnList = ['txdetail', 'interventionCount', 'interventionRatio'];
  public storeColumnList = ['store', 'interventionCount', 'financialTransactions', 'successRatio'];
  public titleColor: string;
  public timeStamp: string;
  public noData = false;
  private filterSubscription: ISubscription;
  private storebar = { lastIndex: -1, data: [] };
  private userbar = { lastIndex: -1, data: [] };
  private txbar = { lastIndex: -1, data: [] };
  private pageOffset = 0;
  private pageLimit = 30;

  constructor(
    private interventionDriverService: InterventionDriverService,
    private route: ActivatedRoute,
    private filterService: FilterService,
    private clientService: ClientService,
    private userExperienceReportService: UserExperienceReportService
  ) {
    this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
      this.selectedCustomerList = [];
      this.selectedModelList = [];
      this.selectedCustomerList.push(updatedFilter.customer);
      this.selectedModelList.push(updatedFilter.model);
      this.selectedPeriod
        = this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(updatedFilter.period)];
      this.selectedFrequency
        = this.AppConfiguration.global.periods.reportFrequency
        [this.AppConfiguration.global.periods.values.indexOf(updatedFilter.period)];
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
      this.getTimeStampData();
      this.getInterventionAreaChartData();
      this.getInterventionByStoreBarChartData();
      this.getInterventionByUserBarChartData();
      this.getInterventionByTransactionBarChartData();
    });

    this.width = route.snapshot.data['width'] || this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
    this.height = route.snapshot.data['height'] || this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  getInterventionAreaChartData() {
    this.interventionDriverService.getDowntimeRatioAreaChartDataService(
      this.selectedCustomerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.selectedFrequency,
      true)
      .subscribe((interventionRatioResponse: ISuccessRatio) => {
        if (interventionRatioResponse.chartData.length > 0) {
          interventionRatioResponse.chartData = _.sortBy(interventionRatioResponse.chartData, data => data.index);

          if (this.selectedPeriod === 'weekly') {
            this.chartData = _.map(interventionRatioResponse.chartData, data => ({
              date: moment(data.index.split(':')[0]).format('YYYY-MM-DD'),
              value: data.interventionCount
            }));
          } else {
            this.chartData = _.map(interventionRatioResponse.chartData, data => ({
              date: moment(data.index, ['MM/DD/YYYY', 'MMM-YYYY']).format('YYYY-MM-DD'),
              value: data.interventionCount
            }));
          }
          this.chartData = _.sortBy(this.chartData, data => data.date);
          this.interventionByUsedonutChartData = [
            {
              count: _.toNumber(interventionRatioResponse.totalInterventionRatio),
              color: _.toNumber(interventionRatioResponse.totalInterventionRatio) >= 95 ? '#0A9729' : '#EA4646'
            },
            {
              count: 100 - _.toNumber(interventionRatioResponse.totalInterventionRatio),
              color: '#ccc'
            }
          ];

          this.titleColor = _.toNumber(interventionRatioResponse.totalInterventionRatio) >= 95 ? '#0A9729' : '#EA4646';

          this.donutCenterTitle = `${interventionRatioResponse.totalInterventionRatio}%`;
        }
      });
  }

  getInterventionByStoreBarChartData() {
    this.interventionDriverService.getInterventionByStoreChartDataService(
      this.selectedCustomerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.selectedFrequency,
      this.pageOffset,
      this.pageLimit)
      .subscribe((storeChartResponse: ISuccessRatio) => {
        if (storeChartResponse.chartData.length > 0) {
          this.noData = false;
          // storeChartResponse.chartData = _.sortBy(storeChartResponse.chartData, data => data.interventionCount);
          this.interventionByStoreLength = storeChartResponse.totalDocuments;
          this.interventionByStoreChartData = _.map(storeChartResponse.chartData, data => ({
            caseDate: data.store,
            averageHours: _.toNumber(data.interventionCount)
          }));
          this.storeChartResponse = storeChartResponse.chartData;
          this.interventionByStoretableData = storeChartResponse.chartData;
          this.storebar.data = storeChartResponse.chartData;
        } else {
          this.interventionByStoreChartData = [{
            caseDate: 'No Stores Available',
            averageHours: 0
          }];
          this.noData = true;
          this.interventionByStoretableData = [];
          this.storebar.data = [];
        }
      });
  }
  getInterventionByUserBarChartData() {
    this.interventionDriverService.getInterventionByUserChartDataService(
      this.selectedCustomerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.selectedFrequency,
      this.pageOffset,
      this.pageLimit)
      .subscribe((userChartResponse: ISuccessRatio) => {
        if (userChartResponse.chartData.length > 0) {
          this.noData = false;
          // userChartResponse.chartData = _.sortBy(userChartResponse.chartData, data => data.interventionRatio);
          this.interventionByUserLength = userChartResponse.totalDocuments;
          this.interventionByUserChartData = _.map(userChartResponse.chartData, data => ({
            caseDate: data.user,
            averageHours: data.interventionRatio
          }));
          this.userChartResponse = userChartResponse.chartData;
          this.interventionByUsertableData = userChartResponse.chartData;
          this.userbar.data = userChartResponse.chartData;
        } else {
          this.noData = true;
          this.interventionByUserChartData = [{
            caseDate: 'No Users Available',
            averageHours: 0
          }];
          this.interventionByUsertableData = [];
          this.userbar.data = [];
        }
      });
  }

  getInterventionByTransactionBarChartData() {
    this.interventionDriverService.getInterventionByTransactionChartDataService(
      this.selectedCustomerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.selectedFrequency,
      this.pageOffset,
      this.pageLimit)
      .subscribe((transChartResponse: ISuccessRatio) => {
        if (transChartResponse.chartData.length > 0) {
          this.noData = false;
          // transChartResponse.chartData = _.sortBy(transChartResponse.chartData, data => data.interventionCount);
          this.interventionByTransLength = transChartResponse.totalDocuments;
          this.interventionByTransChartData = _.map(transChartResponse.chartData, data => ({
            caseDate: data.txdetail,
            averageHours: _.toNumber(data.interventionCount)
          }));
          this.transChartResponse = transChartResponse.chartData;
          this.interventionByTranstableData = transChartResponse.chartData;
          this.txbar.data = transChartResponse.chartData;
        } else {
          this.noData = true;
          this.interventionByTransChartData = [{
            caseDate: 'No Transactions Available',
            averageHours: 0
          }];
          this.interventionByTranstableData = [];
          this.txbar.data = [];
        }
      });
  }

  onTransChartBarClick(e) {
    this.interventionByTranstableData = [];
    if (this.txbar.lastIndex === e.index) {
      this.interventionByTranstableData = this.txbar.data;
      this.txbar.lastIndex = -1;
    } else {
      this.interventionByTranstableData.push(this.txbar.data[e.index]);
      this.txbar.lastIndex = e.index;
    }
    if (this.infoTable2 && !e.noClick) {
      this.infoTable2.openDialog();
    }
  }

  onUserChartBarClick(e) {
    this.interventionByUsertableData = [];
    if (this.userbar.lastIndex === e.index) {
      this.interventionByUsertableData = this.userbar.data;
      this.userbar.lastIndex = -1;
    } else {
      this.interventionByUsertableData.push(this.userbar.data[e.index]);
      this.userbar.lastIndex = e.index;
    }
    if (this.infoTable3 && !e.noClick) {
      this.infoTable3.openDialog();
    }
  }

  onStoreChartBarClick(e) {
    this.interventionByStoretableData = [];
    if (this.storebar.lastIndex === e.index) {
      this.interventionByStoretableData = this.storebar.data;
      this.storebar.lastIndex = -1;
    } else {
      this.interventionByStoretableData.push(this.storeChartResponse[e.index]);
      this.storebar.lastIndex = e.index;
    }
    if (this.infoTable && !e.noClick) {
      this.infoTable.openDialog();
    }
  }

  onPageChange(e, chartName) {
    this.pageOffset = e.pageOffset;
    this.pageLimit = e.pageLimit;
    if (chartName === 'interventionByStore') {
      this.getInterventionByStoreBarChartData();
    } else if (chartName === 'interventionByUser') {
      this.getInterventionByUserBarChartData();
    } else if (chartName === 'interventionByTransaction') {
      this.getInterventionByTransactionBarChartData();
    }
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

}

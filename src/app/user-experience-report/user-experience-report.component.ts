import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { AppConfiguration, Languages } from '../app.configuration';
import { UserExperienceReportService } from './user-experience-report.service';
import { ClientService } from 'app/services/client.service';
import { FilterService } from '../services/filter.service';
import { ISuccessRatio, ISuccessRatioData, IChartData, ITimeStamp, IDonutChart } from './../app.interface';
import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
  selector: 'app-user-experience-report',
  templateUrl: './user-experience-report.component.html',
  styleUrls: ['./user-experience-report.component.scss'],
  providers: [UserExperienceReportService]
})
export class UserExperienceReportComponent implements OnDestroy {
  @Input('width') width;
  @Input('height') height;
  @ViewChild('infoTable') infoTable;
  public kpiTimeStampLabel = AppConfiguration.kpiList[9].timeStampKey;
  public selectedPeriod;
  public selectedFrequency;
  public selectedCustomerList = [];
  public selectedModelList = [];
  public selectedCase = 'percentage';
  public selectedCaseType = 'ALL';
  public chartData: IChartData[];
  public barChartData: IChartData[];
  public barChartResponse: IChartData[];
  public Languages = Languages;
  public AppConfiguration = AppConfiguration;
  public Location = Location;
  public customerChips: { removable: boolean, text: string }[] = [];
  public modelChips: { removable: boolean, text: string }[] = [];
  public periodChips: { removable: boolean, text: string };
  public donutChartData: IDonutChart[];
  public fullTableData = [];
  public donutCenterTitle: string;
  public donutCenterSubTitle = Languages.get('global.successRatio', 'start');
  public percentageChange: ISuccessRatioData;
  public successRatioData: any;
  public moment = moment;
  public isNumber = _.isNumber;
  public toNumber = _.toNumber;
  public round = _.round;
  public tableData = [];
  public columnList = ['store', 'interventionCount', 'financialTransactions', 'successRatio'];
  public titleColor: string;
  public timeStamp: string;
  public dataLength: number;
  public noData = false;
  private filterSubscription: ISubscription;
  private showAllRows = true;
  private lastIndex = -1;
  private pageOffset = 0;
  private pageLimit = 30;


  constructor(private userExperienceReportService: UserExperienceReportService,
    private route: ActivatedRoute,
    private filterService: FilterService,
    private clientService: ClientService
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
      this.getSuccessRatioAreaChartData();
      this.getSuccessRatioBarChartData();
    });

    this.width = route.snapshot.data['width'] || this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
    this.height = route.snapshot.data['height'] || this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  getSuccessRatioAreaChartData() {
    this.userExperienceReportService.getSuccessRatioAreaChartDataService(
      this.selectedCustomerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.selectedFrequency,
      true)
      .subscribe((successRatioResponse: ISuccessRatio) => {
        if (successRatioResponse.chartData.length > 0) {
          successRatioResponse.chartData = _.sortBy(successRatioResponse.chartData, data => data.index);
          if (this.selectedPeriod === 'weekly') {
            this.chartData = _.map(successRatioResponse.chartData, data => ({
              date: moment(data.index.split(':')[1]).format('YYYY-MM-DD'),
              value: _.toNumber(data.successRatio)
            }));
          } else {
            this.chartData = _.map(successRatioResponse.chartData, data => ({
              date: moment(data.index, ['MM/DD/YYYY', 'MMM-YYYY']).format('YYYY-MM-DD'),
              value: _.toNumber(data.successRatio)
            }));
          }

          this.chartData = _.sortBy(this.chartData, data => data.date);
          const successRatio = _.round(_.toNumber(successRatioResponse.totalSuccessRatio), 2);
          let colorCode;
          if (successRatio < 99.30) {
            colorCode = '#EA4646';
          } else if (successRatio >= 99.30 && successRatio < 99.50) {
            colorCode = '#B3B3B3';
          } else if (successRatio >= 99.50) {
            colorCode = '#0A9729';
          }

          this.donutChartData = [
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
          this.donutCenterTitle = `${successRatio}%`;
        }
      });
  }

  getSuccessRatioBarChartData() {
    this.userExperienceReportService.getSuccessRatioBarChartDataService(
      this.selectedCustomerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.selectedFrequency,
      this.pageOffset,
      this.pageLimit)
      .subscribe((barChartResponse: ISuccessRatio) => {
        if (barChartResponse.chartData.length > 0) {
          this.noData = false;
          this.dataLength = barChartResponse.totalDocuments;
          barChartResponse.chartData = _.sortBy(barChartResponse.chartData, data => data.index);
          this.barChartData = _.map(barChartResponse.chartData, data => ({
            caseDate: data.store,
            averageHours: _.toNumber(data.successRatio)
          }));
          this.barChartResponse = barChartResponse.chartData;
          this.tableData = barChartResponse.chartData;
          this.fullTableData = barChartResponse.chartData;
        } else {
          this.noData = true;
          this.barChartData = [{
            caseDate: 'No Stores Available',
            averageHours: 0
          }];
          this.tableData = [];
          this.fullTableData = [];
        }
      });
  }

  onBarClick(e) {
    this.tableData = [];
    if (this.lastIndex === e.index) {
      this.tableData = this.fullTableData;
      this.lastIndex = -1;
    } else {
      this.tableData.push(this.barChartResponse[e.index]);
      this.lastIndex = e.index;
    }
    if (this.infoTable && !e.noClick) {
      this.infoTable.openDialog();
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

  onPageChange(e) {
    this.pageOffset = e.pageOffset;
    this.pageLimit = e.pageLimit;
    this.getSuccessRatioBarChartData();
  }

}

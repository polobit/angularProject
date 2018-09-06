import { Component, Input, OnDestroy, ViewChild, OnChanges } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { FirstTimeFixChartService } from './first-time-fix-chart.service';
import { ActivatedRoute } from '@angular/router';
import { FilterService } from '../services/filter.service';
import { ISubscription } from 'rxjs/Subscription';
import { IFirstTimeFixChart, IChartData, IOnsiteBarChartDetail } from '../app.interface';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BarChart } from '../bar-chart/bar-chart.common';
import 'rxjs/add/observable/forkJoin';
@Component({
  selector: 'app-first-time-fix-chart',
  templateUrl: './first-time-fix-chart.component.html',
  styleUrls: ['./first-time-fix-chart.component.scss'],
  providers: [FirstTimeFixChartService]
})
export class FirstTimeFixChartComponent extends BarChart implements OnDestroy, OnChanges {
  @Input('width') width;
  @Input('height') height;
  @Input('isDashboard') isDashboard = false;
  @ViewChild('detail') detail;

  public kpiName = Languages.get('kpi.firstTimeFix', 'start');
  public selectedPeriod;
  public selectedFrequency;
  public selectedCustomerList = [];
  public selectedModelList = [];
  public selectedCase = 'percentage';
  public selectedCaseType = 'ALL';
  public selectedBarValue: number;
  public slotData;
  public caseTypes = AppConfiguration.firstTimeFix.caseTypes;
  public cases = AppConfiguration.firstTimeFix.cases;
  public chartData: IChartData[];
  public detailsByDate: IOnsiteBarChartDetail;
  public Languages = Languages;
  public selectedDate: string;
  public fromDate: string;
  public toDate: string;
  public averageValue: number;
  public totalCases: number;
  public AppConfiguration = AppConfiguration;
  public Location = Location;
  public round = _.round;
  public customerChips: { removable: boolean, text: string }[] = [];
  public modelChips: { removable: boolean, text: string }[] = [];
  public periodChips: { removable: boolean, text: string };
  public barClickCheck = false;
  private filterSubscription: ISubscription;

  constructor(private firstTimeFixChartService: FirstTimeFixChartService,
    private route: ActivatedRoute,
    private filterService: FilterService) {
    super();
    this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
      this.selectedCustomerList = [];
      this.selectedModelList = [];
      this.selectedCustomerList.push(updatedFilter.customer);
      this.selectedModelList.push(updatedFilter.model);
      this.selectedPeriod
        = this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(updatedFilter.period)];
      this.selectedFrequency
        = this.AppConfiguration.global.periods.newFrequencyMapping
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

      this.change();
    });

    this.width = route.snapshot.data['width'] || this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
    this.height = route.snapshot.data['height'] || this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
  }

  ngOnChanges() {
    this.change();
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  public getChartData() {
    this.averageValue = 0;
    this.selectedBarValue = 0;
    this.firstTimeFixChartService.getChartDataService(
      this.selectedCustomerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.selectedFrequency,
      this.selectedCaseType)
      .subscribe((chartDataResponse: IFirstTimeFixChart) => {
        if (chartDataResponse.chartData.length > 0) {
          this.chartData = [];
          this.averageValue =
            this.selectedCase === 'number' ? chartDataResponse.totalData.number : _.toNumber(chartDataResponse.totalData.percentage);
          if (this.selectedFrequency === 'weekly') {
            chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data => moment(_.split(data.index, ':')[0]));
            if (this.selectedCaseType === 'ALL') {
              this.chartData =
                _.map(chartDataResponse.chartData, data =>
                  ({
                    date: _.split(data.index, ':')[0],
                    caseDate:
                      `${moment(_.split(data.index, ':')[0])
                        .startOf('isoWeek').format('MMM DD')} - ${moment(_.split(data.index, ':')[1]).endOf('isoWeek').format('DD')}`,
                    slot1: _.toNumber(this.selectedCase === 'number' ? data.data.phoneFixFirstTime : data.data.phoneFixPercentage),
                    slot2: _.toNumber(this.selectedCase === 'number' ? data.data.dispatchFixFirstTime : data.data.dispatchFixPercentage),
                    slot3: _.toNumber(
                      this.selectedCase === 'number'
                        ? data.data.linkedCases
                        : (_.toNumber(data.data.phoneFixPercentage) + _.toNumber(data.data.dispatchFixPercentage)) > 0
                          && data.data.linkedCases > 0
                          ? (100 - (_.toNumber(data.data.phoneFixPercentage) + _.toNumber(data.data.dispatchFixPercentage)))
                          : _.toNumber(data.data.linkedCases) === 0
                            ? 0
                            : 100)
                  }));
            } else {
              this.chartData =
                _.map(chartDataResponse.chartData, data =>
                  ({
                    date: _.split(data.index, ':')[0],
                    caseDate:
                      `${moment(_.split(data.index, ':')[0])
                        .startOf('isoWeek').format('MMM DD')} - ${moment(_.split(data.index, ':')[1]).endOf('isoWeek').format('DD')}`,
                    slot1: _.toNumber(this.selectedCase === 'number' ? data.data.number : data.data.percentage),
                    slot2: _.toNumber(this.selectedCase === 'number'
                      ? data.data.linkedCases : data.data.percentage === '0' ? 0 : (100 - _.toNumber(data.data.percentage)))
                  }));
            }
          } else if (this.selectedFrequency === 'monthly') {
            chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data =>
              moment(data.index, ['YYYYMM', 'MMM-YYYY']).format('YYYYMM'));
            if (this.selectedCaseType === 'ALL') {
              this.chartData =
                _.map(chartDataResponse.chartData, data =>
                  ({
                    date: moment(data.index, ['MM/DD/YYYY', 'MMM-YYYY']).format('MM/DD/YYYY'),
                    caseDate: data.index,
                    slot1: _.toNumber(this.selectedCase === 'number' ? data.data.phoneFixFirstTime : data.data.phoneFixPercentage),
                    slot2: _.toNumber(this.selectedCase === 'number' ? data.data.dispatchFixFirstTime : data.data.dispatchFixPercentage),
                    slot3: _.toNumber(
                      this.selectedCase === 'number'
                        ? data.data.linkedCases
                        : (_.toNumber(data.data.phoneFixPercentage) + _.toNumber(data.data.dispatchFixPercentage)) > 0
                          && data.data.linkedCases > 0
                          ? (100 - (_.toNumber(data.data.phoneFixPercentage) + _.toNumber(data.data.dispatchFixPercentage)))
                          : _.toNumber(data.data.linkedCases) === 0
                            ? 0
                            : 100)
                  }));
            } else {
              this.chartData =
                _.map(chartDataResponse.chartData, data =>
                  (
                    {
                      date: moment(data.index, ['MM/DD/YYYY', 'MMM-YYYY']).format('MM/DD/YYYY'),
                      caseDate: data.index,
                      slot1: _.toNumber(this.selectedCase === 'number' ? data.data.number : data.data.percentage),
                      slot2: _.toNumber(this.selectedCase === 'number'
                        ? data.data.linkedCases : data.data.percentage === '0' ? 0 : (100 - _.toNumber(data.data.percentage)))
                    })
                );
            }
          } else {
            chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data => data.index);
            if (this.selectedCaseType === 'ALL') {

              chartDataResponse.chartData.forEach((element, index) => {
                console.log((100 - (_.toNumber(element.data.phoneFixPercentage) + _.toNumber(element.data.dispatchFixPercentage))));
              });

              this.chartData =
                _.map(chartDataResponse.chartData, data =>
                  ({
                    date: moment(_.split(data.index, ':')[0]).format('MM/DD/YYYY'),
                    caseDate: _.split(data.index, ':')[0],
                    slot1: _.toNumber(this.selectedCase === 'number' ? data.data.phoneFixFirstTime : data.data.phoneFixPercentage),
                    slot2: _.toNumber(this.selectedCase === 'number' ? data.data.dispatchFixFirstTime : data.data.dispatchFixPercentage),
                    slot3: _.toNumber(
                      this.selectedCase === 'number'
                        ? data.data.linkedCases
                        : (_.toNumber(data.data.phoneFixPercentage) + _.toNumber(data.data.dispatchFixPercentage)) > 0
                          && data.data.linkedCases > 0
                          ? (100 - (_.toNumber(data.data.phoneFixPercentage) + _.toNumber(data.data.dispatchFixPercentage)))
                          : _.toNumber(data.data.linkedCases) === 0
                            ? 0
                            : 100)
                  }));
            } else {
              this.chartData =
                _.map(chartDataResponse.chartData, data =>
                  ({
                    date: moment(_.split(data.index, ':')[0]).format('MM/DD/YYYY'),
                    caseDate: _.split(data.index, ':')[0],
                    slot1: _.toNumber(this.selectedCase === 'number' ? data.data.number : data.data.percentage),
                    slot2: _.toNumber(this.selectedCase === 'number'
                      ? data.data.linkedCases : data.data.percentage === '0' ? 0 : (100 - _.toNumber(data.data.percentage)))
                  }));
            }
          }
          if (this.barClickCheck === false) {
            this.selectedBarValue = (this.selectedCaseType === 'ALL')
              ? _.toNumber(this.chartData[this.chartData.length - 1].slot3)
              : _.toNumber(this.chartData[this.chartData.length - 1].slot2);

            this.getDetailForEachBar(this.chartData[this.chartData.length - 1].date);
          } else if (this.barClickCheck === true) {
            this.selectedBarValue = this.selectedCaseType === 'ALL'
              ? _.toNumber(_.find(this.chartData, ['date', this.fromDate]).slot3)
              : _.toNumber(_.find(this.chartData, ['date', this.fromDate]).slot2);

            this.getDetailForEachBar(this.fromDate);
          }
        }
      });
  }

  public getDetailForEachBar(fromDate) {
    this.fromDate = moment(fromDate, ['MM/DD/YYYY', 'DD-MMM-YYYY']).format('MM/DD/YYYY');
    this.selectedDate = fromDate;
    let toDate = '';
    this.toDate = '';
    this.detailsByDate = undefined;
    const currentDate = moment().format('MM/DD/YYYY');
    if (this.selectedFrequency === 'weekly') {
      this.fromDate = moment(fromDate).startOf('isoWeek').format('MM/DD/YYYY');
      if (moment(currentDate).get('week') !== moment(fromDate).get('week')) {
        toDate = moment(fromDate).endOf('isoWeek').format('MM/DD/YYYY');
      } else {
        toDate = moment().format('MM/DD/YYYY');
      }
    } else if (this.selectedFrequency === 'monthly') {
      this.fromDate = moment(fromDate, ['MM/DD/YYYY', 'DD-MMM-YYYY']).startOf('month').format('MM/DD/YYYY');
      if (moment(currentDate).get('month') !== moment(fromDate).get('month')) {
        toDate = moment(fromDate, ['MM/DD/YYYY', 'DD-MMM-YYYY']).endOf('month').format('MM/DD/YYYY');
      } else {
        toDate = moment().format('MM/DD/YYYY');
      }
    } else {
      toDate = this.fromDate;
    }
    this.firstTimeFixChartService.getDetailForEachBarService
      (this.selectedCustomerList, this.selectedModelList,
      this.selectedFrequency,
      this.fromDate,
      this.selectedCaseType,
      toDate)
      .subscribe((chartDetailResponse: IOnsiteBarChartDetail) => {
        this.detailsByDate = chartDetailResponse;
        this.detailsByDate.totalCases = this.selectedBarValue;
        if (this.selectedFrequency === 'weekly' || this.selectedFrequency === 'monthly') {
          this.toDate = toDate;
        }
      });
  }

  public change() {
    this.selectedBarValue = 0;
    this.averageValue = 0;
    switch (this.selectedCaseType) {
      case 'phone_fix':
        this.slotData = AppConfiguration.firstTimeFix.colorSlots.phonefix;
        break;
      case 'dispatch':
        this.slotData = AppConfiguration.firstTimeFix.colorSlots.dispatch;
        break;
      default:
        this.slotData = AppConfiguration.firstTimeFix.colorSlots.all;
        break;
    }
    this.getChartData();
  }

  onBarClick(e) {
    if (e.alternateDate === undefined) {
      this.fromDate = moment(e.date, ['MM/DD/YYYY', 'MMM-YYYY']).format('MM/DD/YYYY');
    } else {
      if (e.alternateDate === 'Invalid date') {
        this.fromDate = moment(e.date, ['MM/DD/YYYY', 'MMM-YYYY']).format('MM/DD/YYYY');
      } else {
        this.fromDate = e.alternateDate;
      }
    }
    if (this.selectedCaseType === 'ALL') {
      this.selectedBarValue = _.toNumber(this.chartData[e.index].slot3);
    } else {
      this.selectedBarValue = _.toNumber(this.chartData[e.index].slot2);
    }
    this.barClickCheck = true;
    this.getDetailForEachBar(this.fromDate);
    if (this.detail && !e.noClick) {
      this.detail.openDialog();
    }
  }

}

import { Component, Input, OnDestroy, ViewChild, OnChanges } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { SlaChartService } from './sla-chart.service';
import { ActivatedRoute } from '@angular/router';
import { FilterService } from '../services/filter.service';
import { ISubscription } from 'rxjs/Subscription';
import { ICasesByZoneChart, IChartData, IOnsiteBarChartDetail } from '../app.interface';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BarChart } from '../bar-chart/bar-chart.common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

@Component({
  selector: 'app-sla-chart',
  templateUrl: './sla-chart.component.html',
  styleUrls: ['./sla-chart.component.scss'],
  providers: [SlaChartService]
})
export class SlaChartComponent extends BarChart implements OnChanges, OnDestroy {
  @Input('width') width;
  @Input('height') height;
  @Input('isDashboard') isDashboard = false;
  @Input('zone') zone;
  @ViewChild('detail') detail;

  public kpiName = Languages.get('kpi.serviceLevelAgreement', 'start');
  public selectedPeriod;
  public selectedFrequency;
  public selectedCustomerList = [];
  public selectedModelList = [];
  public selectedCase = 'number';
  public selectedSlaTime = 'ALL';
  public selectedBarValue: number;
  public selectedZone = '';
  public slotData;
  public barColor;
  public zoneList = AppConfiguration.casesByZones.zones;
  public cases = AppConfiguration.casesByZones.cases;
  public slaTimeList = AppConfiguration.casesByZones.slaTime.map(slaTime => slaTime.key);
  public chartData: IChartData[];
  public allZoneData: any[];
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
  public allZoneSelected = true;
  public barClickCheck = false;
  private filterSubscription: ISubscription;
  private allZoneBarChartData: Array<any>;


  constructor(private slaChartService: SlaChartService,
    private route: ActivatedRoute,
    private filterService: FilterService) {
    super();
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

      if (this.selectedZone === '') {
        this.route.params.subscribe(params => {
          this.selectedZone = params['selectedZone'];
        });
      }

      if (this.selectedZone === 'ALL') {
        this.onAllZoneSelect();
      } else {
        this.onSingleZoneSelect();
      }

      this.change();
    });

    this.width = route.snapshot.data['width'] || this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
    this.height = route.snapshot.data['height'] || this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
  }

  ngOnChanges() {
    if (this.zone !== '' || this.zone !== 'undefined') {
      this.selectedZone = this.zone;
    }
    this.change();
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  public getChartData() {
    this.selectedBarValue = 0;
    this.slaChartService.getChartDataService(this.selectedCustomerList,
      this.selectedModelList,
      this.selectedPeriod,
      this.selectedFrequency,
      this.selectedZone)
      .subscribe((chartDataResponse: ICasesByZoneChart) => {
        if (chartDataResponse.chartData.length > 0) {
          this.chartData = [];
          if (this.selectedFrequency === 'weekly') {
            chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data => data.week);
            chartDataResponse.chartData =
              _.map(chartDataResponse.chartData, data =>
                ({
                  date: data.caseDate,
                  caseDate:
                    `${moment(data.caseDate)
                      .startOf('isoWeek').format('MMM DD')} - ${moment(data.caseDate).endOf('isoWeek').format('DD')}`,
                  inTimeCases: data.inTimeCases,
                  outTimeCases: data.outTimeCases,
                }));
          } else if (this.selectedFrequency === 'monthly') {
            chartDataResponse.chartData =
              _.sortBy(chartDataResponse.chartData, data => moment(data.caseDate).format('YYYYMM'));

            chartDataResponse.chartData =
              _.map(chartDataResponse.chartData, data =>
                ({
                  date: data.caseDate,
                  caseDate: data.month,
                  inTimeCases: data.inTimeCases,
                  outTimeCases: data.outTimeCases
                })
              );
          }

          if (this.selectedSlaTime !== 'ALL') {
            this.averageValue = chartDataResponse[`${this.selectedSlaTime}CasesTotal`];
          } else {
            this.averageValue = _.reduce(this.slaTimeList,
              (totalAverage, slot) => totalAverage + chartDataResponse[`${slot}CasesTotal`], 0);
          }

          if (this.selectedCase === 'percentage') {
            this.totalCases = chartDataResponse[`inTimeCasesTotal`] + chartDataResponse[`outTimeCasesTotal`];
            this.averageValue = this.averageValue * 100 / this.totalCases;
          }
          if (this.selectedSlaTime !== 'ALL') {
            this.chartData = _.map(chartDataResponse.chartData,
              data => ({
                date: this.selectedFrequency === 'daily' ? data.caseDate : data.date,
                caseDate: data.caseDate,
                averageHours:
                  _.toNumber(_.get(data, `${this.selectedSlaTime}Cases.${this.selectedCase}`))
              })
            );
          } else {
            this.chartData = _.map(chartDataResponse.chartData,
              data => _.merge({
                caseDate: data.caseDate,
                date: this.selectedFrequency === 'daily' ? data.caseDate : data.date
              }, _.reduce(this.slaTimeList, (result, slot, index) => {
                result[`slot${index + 1}`] =
                  _.get(data[slot + 'Cases'], this.selectedCase);
                return result;
              }, {}))
            );
          }
          if (this.barClickCheck === false) {
            if (this.selectedCase === 'percentage' && this.selectedSlaTime === 'ALL') {
              const barValue = this.chartData[this.chartData.length - 1];
              this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
            } else {
              if (this.selectedSlaTime === 'ALL') {
                const barValue = this.chartData[this.chartData.length - 1];
                this.selectedBarValue = barValue.slot1 + barValue.slot2;
              } else {
                this.selectedBarValue = this.chartData[this.chartData.length - 1].averageHours;
              }
            }
            if (this.selectedFrequency === 'weekly' || this.selectedFrequency === 'monthly') {
              this.getDetailForEachBar(this.chartData[this.chartData.length - 1].date);
            } else {
              this.getDetailForEachBar(this.chartData[this.chartData.length - 1].caseDate);
            }
          } else {
            if (this.selectedCase === 'percentage' && this.selectedSlaTime === 'ALL') {
              const barValue = _.find(this.chartData, ['date', this.fromDate]);
              this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
            } else {
              if (this.selectedSlaTime === 'ALL') {
                const barValue = _.find(this.chartData, ['date', this.fromDate]);
                this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
              } else {
                this.selectedBarValue = _.find(this.chartData, ['date', this.fromDate]).averageHours;
              }
            }
            this.getDetailForEachBar(this.fromDate);
          }
        }
      });

  }

  public getAllZoneData() {
    Observable.forkJoin(_.map(this.AppConfiguration.casesByZones.zones, zone => this.slaChartService
      .getChartDataService(this.selectedCustomerList, this.selectedModelList, this.selectedPeriod, this.selectedFrequency, zone.apiKey)))
      .subscribe((chartDataResponse: ICasesByZoneChart[]) => {
        if (this.selectedFrequency === 'weekly') {
          chartDataResponse[0].chartData = _.sortBy(chartDataResponse[0].chartData, data => data.week);
          chartDataResponse[0].chartData =
            _.map(chartDataResponse[0].chartData, data =>
              ({
                date: data.caseDate,
                caseDate:
                  `${moment(data.caseDate).startOf('isoWeek').format('MMM DD')}
                             - ${moment(data.caseDate).endOf('isoWeek').format('DD')}`,
                inTimeCases: data.inTimeCases,
                outTimeCases: data.outTimeCases
              }));
        } else if (this.selectedFrequency === 'monthly') {
          chartDataResponse[0].chartData =
            _.sortBy(chartDataResponse[0].chartData, data => moment(data.caseDate).format('YYYYMM'));

          chartDataResponse[0].chartData =
            _.map(chartDataResponse[0].chartData, data =>
              ({
                date: data.caseDate,
                caseDate: data.month,
                inTimeCases: data.inTimeCases,
                outTimeCases: data.outTimeCases
              })
            );
        } else {
          chartDataResponse[0].chartData =
            _.map(chartDataResponse[0].chartData, data =>
              ({
                date: data.caseDate,
                caseDate: data.caseDate,
                inTimeCases: data.inTimeCases,
                outTimeCases: data.outTimeCases
              })
            );
        }

        this.allZoneBarChartData = _.reduce(chartDataResponse[0].chartData, (chartResult, chartData, chartIndex) => {
          chartResult.push(_.reduce(this.zoneList, (result, zone, index) => {
            result[zone.apiKey] = chartDataResponse[index].chartData[chartIndex];
            return result;
          }, {}));
          return chartResult;
        }, []);

        this.allZoneData = _.map(this.allZoneBarChartData, data => _.merge({
          caseDate: data[this.zoneList[0].apiKey].date,
        },
          this.zoneList.reduce((result, slot, index) => {
            result[this.zoneList[index].apiKey] =
              _.get(data, this.zoneList[index].apiKey);
            return result;
          }, {})));
        // this.allZoneData.forEach(element => {
        //   this.AppConfiguration.casesByZones.zones.forEach(zone => {
        //     element['Zone1'].inTimeCases.percentage =
        //       _.toString(element['Zone1'].inTimeCases.number / (element['Zone1'].inTimeCases.number
        //         + element['Zone2-3'].inTimeCases.number
        //         + element['Zone4-5'].inTimeCases.number) * 100);
        //     element['Zone2-3'].inTimeCases.percentage =
        //       _.toString(element['Zone2-3'].inTimeCases.number / (element['Zone1'].inTimeCases.number
        //         + element['Zone2-3'].inTimeCases.number
        //         + element['Zone4-5'].inTimeCases.number) * 100);
        //     element['Zone4-5'].inTimeCases.percentage =
        //       _.toString(element['Zone4-5'].inTimeCases.number / (element['Zone1'].inTimeCases.number
        //         + element['Zone2-3'].inTimeCases.number
        //         + element['Zone4-5'].inTimeCases.number) * 100);
        //     element['Zone1'].outTimeCases.percentage =
        //       _.toString(element['Zone1'].outTimeCases.number / (element['Zone1'].outTimeCases.number
        //         + element['Zone2-3'].outTimeCases.number
        //         + element['Zone4-5'].outTimeCases.number) * 100);
        //     element['Zone2-3'].outTimeCases.percentage =
        //       _.toString(element['Zone2-3'].outTimeCases.number / (element['Zone1'].outTimeCases.number
        //         + element['Zone2-3'].outTimeCases.number
        //         + element['Zone4-5'].outTimeCases.number) * 100);
        //     element['Zone4-5'].outTimeCases.percentage =
        //       _.toString(element['Zone4-5'].outTimeCases.number / (element['Zone1'].outTimeCases.number
        //         + element['Zone2-3'].outTimeCases.number
        //         + element['Zone4-5'].outTimeCases.number) * 100);
        //   });
        // });

        this.averageValue = this.totalCases;
        if (this.selectedCase === 'percentage') {
          this.averageValue = 100;
        }
        this.chartData = _.map(this.allZoneBarChartData, data =>
          _.merge({
            caseDate: data[this.zoneList[0].apiKey].caseDate,
            date: this.selectedFrequency === 'daily' ? data[this.zoneList[0].apiKey].caseDate : data[this.zoneList[0].apiKey].date
          },
            this.zoneList.reduce((result, slot, index) => {
              result[`slot${index + 1}`] =
                _.toNumber(_.get(data, `${slot.apiKey}.${this.selectedSlaTime}Cases.number`));
              return result;
            }, {}))
        );
        if (this.barClickCheck === false) {
          this.getDetailForEachBar(this.chartData[this.chartData.length - 1].date);
        } else {
          this.getDetailForEachBar(this.fromDate);
        }

      });
  }

  public getDetailForEachBar(fromDate) {
    this.fromDate = fromDate;
    this.selectedDate = fromDate;
    this.toDate = '';
    this.detailsByDate = undefined;
    const currentDate = moment().format('MM/DD/YYYY');
    if (this.selectedFrequency === 'weekly') {
      this.fromDate = moment(fromDate).startOf('isoWeek').format('MM/DD/YYYY');
      if (moment(currentDate).get('week') === moment(fromDate).get('week')) {
        this.toDate = moment().format('MM/DD/YYYY');
      } else {
        this.toDate = moment(fromDate).endOf('isoWeek').format('MM/DD/YYYY');
      }
    } else if (this.selectedFrequency === 'monthly') {
      this.fromDate = moment(fromDate).startOf('month').format('MM/DD/YYYY');
      if (moment(currentDate).get('month') === moment(fromDate).get('month')) {
        this.toDate = moment().format('MM/DD/YYYY');
      } else {
        this.toDate = moment(fromDate).endOf('month').format('MM/DD/YYYY');
      }
    }
    this.slaChartService.getDetailForEachBarService
      (this.selectedCustomerList,
      this.selectedModelList,
      this.selectedFrequency,
      this.fromDate,
      this.toDate,
      this.selectedZone,
      this.selectedSlaTime)
      .subscribe((chartDetailResponse: IOnsiteBarChartDetail) => {
        this.detailsByDate = chartDetailResponse;
        this.detailsByDate.totalCases = this.selectedBarValue;
      });
  }

  public change() {
    this.selectedBarValue = 0;
    this.slaChartService.getChartDataService(
      this.selectedCustomerList, this.selectedModelList, this.selectedPeriod, this.selectedFrequency, 'ALL')
      .subscribe((chartDataResponse: ICasesByZoneChart) => {
        if (chartDataResponse.chartData.length > 0) {
          this.totalCases = _.reduce(this.slaTimeList,
            (totalAverage, slot) => totalAverage + chartDataResponse[`${slot}CasesTotal`], 0);
        }
        this.allZoneBarChartData = [];
        if (this.selectedZone === 'ALL') {
          this.slotData = this.AppConfiguration.casesByZones.colorSlots.all;
          this.getAllZoneData();
        } else {
          if (this.selectedSlaTime !== 'ALL') {
            this.barColor = _.find(this.AppConfiguration.casesByZones.colorSlots[this.selectedZone],
              ['key', this.selectedSlaTime])['color'];
          } else {
            this.slotData = this.AppConfiguration.casesByZones.colorSlots[this.selectedZone];
          }
          this.getChartData();
        }
      });
  }

  onBarClick(e) {
    if (e.alternateDate === undefined) {
      this.fromDate = e.date;
    } else {
      this.fromDate = e.alternateDate;
    }
    this.barClickCheck = true;
    this.selectedBarValue = Number(e.barValue);
    this.getDetailForEachBar(this.fromDate);
    if (this.detail && !e.noClick) {
      this.detail.openDialog();
    }
  }

  onAllZoneSelect() {
    this.allZoneSelected = false;
    if (this.selectedSlaTime === 'ALL') {
      this.selectedSlaTime = this.slaTimeList[0];
    }
  }

  onSingleZoneSelect() {
    this.allZoneSelected = true;
  }
}

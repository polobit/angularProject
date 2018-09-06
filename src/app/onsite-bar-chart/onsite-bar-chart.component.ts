import { Component, Input, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { OnSiteBarChartService } from './onsite-bar-chart.service';
import { ActivatedRoute } from '@angular/router';
import { FilterService } from '../services/filter.service';
import { ISubscription } from 'rxjs/Subscription';
import { IChartData, IOnsiteBarChart, IOnsiteBarChartDetail, IOnsiteBarChartValue } from '../app.interface';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BarChart } from '../bar-chart/bar-chart.common';

@Component({
    selector: 'app-onsite-bar-chart',
    templateUrl: './onsite-bar-chart.component.html',
    styleUrls: ['./onsite-bar-chart.component.scss'],
    providers: [OnSiteBarChartService]
})

export class OnsiteBarChartComponent extends BarChart implements OnInit, OnDestroy {
    @Input('width') width;
    @Input('height') height;
    @Input('isDashboard') isDashboard = false;
    @Input('selectedTime') selectedTime: number;
    @ViewChild('detail') detail;

    public kpiName = Languages.get('kpi.onSiteTimeSpent', 'start');
    public selectedPeriod;
    public selectedFrequency;
    public selectedCustomerList = [];
    public selectedModelList = [];
    public casesBy = AppConfiguration.onSiteTime.cases;
    public selectedCase = 'number';
    public selectedBarValue: number;
    public step = 0;
    public chartData: IChartData[];
    public stackedData: IOnsiteBarChartValue[];
    public detailsByDate: IOnsiteBarChartDetail;
    public Languages = Languages;
    public timePeriods = AppConfiguration.onSiteTime.timePeriods;
    public selectedDate: string;
    public fromDate: string;
    public toDate: string;
    public averageValue: number;
    public AppConfiguration = AppConfiguration;
    public Location = Location;
    public round = _.round;
    public customerChips: { removable: boolean, text: string }[] = [];
    public modelChips: { removable: boolean, text: string }[] = [];
    public periodChips: { removable: boolean, text: string };
    public barClickCheck = false;
    private filterSubscription: ISubscription;
    private onSiteTimeSlot: string;

    constructor(private onSiteBarChartService: OnSiteBarChartService,
        private route: ActivatedRoute,
        private filterService: FilterService) {
        super();

        this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
            this.selectedCustomerList = [];
            this.selectedModelList = [];
            this.selectedCustomerList.push(updatedFilter.customer);
            this.selectedModelList.push(updatedFilter.model);
            this.selectedPeriod = updatedFilter.period;
            this.selectedFrequency =
                this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(updatedFilter.period)];

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

            this.getTimeSpentOnSiteData();
        });

        this.route.params.subscribe(params => {
            this.selectedTime = _.toNumber(params['selectedOnSiteTimeSlot']);
        });

        this.width = route.snapshot.data['width'] || this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
        this.height = route.snapshot.data['height'] || this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
    }

    ngOnInit() {
        this.onSiteTimeSlot = this.timePeriods[this.selectedTime - 1].key;
    }

    ngOnDestroy() {
        this.filterSubscription.unsubscribe();
    }

    public getTimeSpentOnSiteData() {
        this.averageValue = 0;
        this.selectedBarValue = 0;
        this.onSiteBarChartService.getChartDataService(
            this.selectedCustomerList, this.selectedModelList, this.selectedPeriod, this.selectedFrequency)
            .subscribe((chartDataResponse: IOnsiteBarChart) => {
                if (chartDataResponse.chartData.length > 0) {
                    this.stackedData = chartDataResponse.chartData;
                    if (this.selectedFrequency === 'weekly') {
                        chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data => data.week);
                        chartDataResponse.chartData =
                            _.map(chartDataResponse.chartData, data =>
                                ({
                                    caseDate:
                                        `${moment(data.caseDate).startOf('isoWeek').format('MMM DD')}
                                 - ${moment(data.caseDate).endOf('isoWeek').format('DD')}`,
                                    date: data.caseDate,
                                    zeroToTwoHours: data.zeroToTwoHours,
                                    twoToFourHours: data.twoToFourHours,
                                    fourToTwelveHours: data.fourToTwelveHours,
                                    twelveToTwentyFourHours: data.twelveToTwentyFourHours,
                                }));
                    } else if (this.selectedFrequency === 'monthly') {
                        chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data => moment(data.caseDate).format('YYYYMM'));
                        chartDataResponse.chartData =
                            _.map(chartDataResponse.chartData, data =>
                                ({
                                    caseDate: data.month,
                                    date: data.caseDate,
                                    zeroToTwoHours: data.zeroToTwoHours,
                                    twoToFourHours: data.twoToFourHours,
                                    fourToTwelveHours: data.fourToTwelveHours,
                                    twelveToTwentyFourHours: data.twelveToTwentyFourHours,
                                })
                            );
                    }
                    if (this.selectedCase === 'percentage') {
                        if (this.selectedTime === 0) {
                            this.averageValue = 100;
                            this.chartData = chartDataResponse.chartData
                                .map(data => _.merge({
                                    caseDate: data.caseDate,
                                    date: this.selectedFrequency === 'daily' ? data.caseDate : data.date
                                },
                                    this.timePeriods.reduce((result, slot, index) => {
                                        result[`slot${index + 1}`] = _.toNumber(data[slot.key].percentage);
                                        return result;
                                    }, {}))
                                );
                        } else {
                            this.averageValue = 100 * chartDataResponse[`${this.timePeriods[this.selectedTime - 1].key}Average`] /
                                this.timePeriods.reduce((totalAverage, slot) => totalAverage + chartDataResponse[`${slot.key}Average`], 0);
                            this.chartData = chartDataResponse.chartData
                                .map(data =>
                                    ({
                                        caseDate: data.caseDate,
                                        date: this.selectedFrequency === 'daily' ? data.caseDate : data.date,
                                        averageHours: _.toNumber(data[this.timePeriods[this.selectedTime - 1].key].percentage)
                                    })
                                );
                        }
                    } else {
                        if (this.selectedTime === 0) {
                            this.averageValue = this.timePeriods
                                .reduce((totalAverage, slot) => totalAverage + chartDataResponse[`${slot.key}Average`], 0);
                            this.chartData = chartDataResponse.chartData
                                .map(data => _.merge({
                                    caseDate: data.caseDate,
                                    date: this.selectedFrequency === 'daily' ? data.caseDate : data.date
                                },
                                    this.timePeriods.reduce((result, slot, index) => {
                                        result[`slot${index + 1}`] = _.toNumber(data[slot.key].number);
                                        return result;
                                    }, {}))
                                );
                        } else {
                            this.averageValue = chartDataResponse[`${this.timePeriods[this.selectedTime - 1].key}Average`];
                            this.chartData = chartDataResponse.chartData
                                .map(data =>
                                    ({
                                        caseDate: data.caseDate,
                                        date: this.selectedFrequency === 'daily' ? data.caseDate : data.date,
                                        averageHours: _.toNumber(data[this.timePeriods[this.selectedTime - 1].key].number)
                                    })
                                );
                        }
                    }
                    if (this.barClickCheck === false) {
                        if (this.selectedFrequency === 'weekly' || this.selectedFrequency === 'monthly') {
                            this.getDetailForEachBar(chartDataResponse.chartData[chartDataResponse.chartData.length - 1].date);
                            this.selectedBarValue = this.chartData[this.chartData.length - 1].averageHours;
                        } else {
                            this.getDetailForEachBar(chartDataResponse.chartData[chartDataResponse.chartData.length - 1].caseDate);
                            this.selectedBarValue = this.chartData[this.chartData.length - 1].averageHours;
                        }
                    } else if (this.barClickCheck === true) {
                        this.getDetailForEachBar(this.fromDate);
                        this.selectedBarValue = _.find(this.chartData, ['date', this.fromDate]).averageHours;
                    }
                }
            });
    }

    public getDetailForEachBar(fromDate) {
        this.detailsByDate = null;
        this.fromDate = fromDate;
        this.selectedDate = fromDate;
        this.toDate = '';
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
        if (this.selectedTime !== 0) {
            this.onSiteTimeSlot = this.timePeriods[this.selectedTime - 1].key;
            this.onSiteBarChartService.getDetailForEachBarService(this.selectedCustomerList,
                this.selectedModelList,
                this.selectedFrequency,
                this.fromDate,
                this.toDate,
                this.onSiteTimeSlot)
                .subscribe((chartDetailResponse: IOnsiteBarChartDetail) => {
                    if (chartDetailResponse.caseDetails.length > 0) {
                        chartDetailResponse.caseDetails =
                            _.sortBy(chartDetailResponse.caseDetails, data => data.hoursSpentOnsite).reverse();
                    }
                    this.detailsByDate = chartDetailResponse;
                });
        }
    }

    public change() {
        this.selectedBarValue = 0;
        this.getTimeSpentOnSiteData();
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
}










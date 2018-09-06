import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { AverageBarChartService } from './average-bar-chart.service';
import { AppConfiguration, Languages } from '../app.configuration';
import { FilterService } from '../services/filter.service';
import { ISubscription } from 'rxjs/Subscription';

import { IAverageBarChart, IAverageBarChartDetail, IAverageBarChartValue } from '../app.interface';
import { ActivatedRoute } from '@angular/router';
import { BarChart } from '../bar-chart/bar-chart.common';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'app-average-bar-chart',
    templateUrl: './average-bar-chart.component.html',
    styleUrls: ['./average-bar-chart.component.scss'],
    providers: [AverageBarChartService]
})
export class AverageBarChartComponent extends BarChart implements OnDestroy {
    @Input('width') width;
    @Input('height') height;
    @Input('isDashboard') isDashboard = false;
    @ViewChild('detail') detail;

    public kpiName = Languages.get('kpi.averageNumberOfHoursOnSite', 'start');
    public selectedPeriod;
    public selectedFrequency;
    public selectedCustomerList = [];
    public selectedModelList = [];
    public chartData: IAverageBarChartValue[];
    public detailsByDate: IAverageBarChartDetail;
    public averageValue: any;
    public showPanel: boolean;
    public Languages = Languages;
    public fromDate: string;
    public toDate: string;
    public selectedBarValue: number;
    public AppConfiguration = AppConfiguration;
    public customerChips: { removable: boolean, text: string }[] = [];
    public modelChips: { removable: boolean, text: string }[] = [];
    public periodChips: { removable: boolean, text: string };
    public round = _.round;
    private filterSubscription: ISubscription;

    constructor(private averageBarChartService: AverageBarChartService,
        private filterService: FilterService,
        private route: ActivatedRoute) {
        super();
        this.filterSubscription = this.filterService.getSelectedFilter().subscribe((updatedFilter) => {
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

            this.getAverageNumberOfHourSpentOnSite(this.selectedCustomerList, this.selectedModelList, this.selectedPeriod);
        });
        this.width = route.snapshot.data['width'] || this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
        this.height = route.snapshot.data['height'] || this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
    }

    ngOnDestroy() {
        this.filterSubscription.unsubscribe();
    }

    onBarClick(e) {
        if (e.alternateDate === undefined) {
            this.fromDate = e.date;
        } else {
            this.fromDate = e.alternateDate;
        }
        this.selectedBarValue = Number(e.barValue);
        this.getDetailForEachBar(this.fromDate);
        if (this.detail && !e.noClick) {
            this.detail.openDialog();
        }
    }

    public getAverageNumberOfHourSpentOnSite(selectedCustomerList, selectedModelList, selectedPeriod) {
        this.averageBarChartService.getChartDataService(selectedCustomerList, selectedModelList, selectedPeriod, this.selectedFrequency)
            .subscribe((chartDataResponse: IAverageBarChart) => {
                if (chartDataResponse.chartData.length > 0) {
                    this.averageValue = chartDataResponse.aggregateAverageHours;
                    this.selectedBarValue = chartDataResponse.chartData[chartDataResponse.chartData.length - 1].averageHours;
                    // if (this.selectedFrequency === 'daily') {
                    //     this.chartData = this.fillMissingDates(chartDataResponse.chartData,
                    //         'caseDate',
                    //         AppConfiguration.global.periods.days[AppConfiguration.global.periods.values.indexOf(this.selectedPeriod)]);
                    // } else
                    if (this.selectedFrequency === 'weekly') {
                        chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data => data.week);
                        this.chartData =
                            _.map(chartDataResponse.chartData, data =>
                                ({
                                    caseDate:
                                        `${moment(data.caseDate).startOf('isoWeek').format('MMM DD')}
                                             - ${moment(data.caseDate).endOf('isoWeek').format('DD')}`,
                                    averageHours: data.averageHours,
                                    date: data.caseDate
                                })
                            );
                    } else if (this.selectedFrequency === 'monthly') {
                        chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data => moment(data.caseDate).format('YYYYMM'));
                        this.chartData =
                            _.map(chartDataResponse.chartData, data =>
                                ({
                                    caseDate: data.month,
                                    averageHours: data.averageHours,
                                    date: data.caseDate
                                })
                            );
                    } else {
                        this.chartData = chartDataResponse.chartData;
                    }
                    this.getDetailForEachBar(chartDataResponse.chartData[chartDataResponse.chartData.length - 1].caseDate);
                }
            });
    }

    public getDetailForEachBar(fromDate) {
        this.detailsByDate = null;
        this.fromDate = fromDate;
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
        this.averageBarChartService.getDetailForEachBarService(this.selectedCustomerList,
            this.selectedModelList,
            this.selectedFrequency,
            this.fromDate,
            this.toDate)
            .subscribe((chartDetailResponse: IAverageBarChartDetail) => {
                if (chartDetailResponse.caseDetails.length > 0) {
                    chartDetailResponse.caseDetails = _.sortBy(chartDetailResponse.caseDetails, data => data.hoursSpentOnsite).reverse();
                }
                this.detailsByDate = chartDetailResponse;
            });
    }
}

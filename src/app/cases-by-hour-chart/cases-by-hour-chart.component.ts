import { Component, Input, OnDestroy, ViewChild, OnChanges } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { CasesByHourChartService } from './cases-by-hour-chart.service';
import { ActivatedRoute } from '@angular/router';
import { FilterService } from '../services/filter.service';
import { ISubscription } from 'rxjs/Subscription';
import { ICasesByHourChart, IChartData, IOnsiteBarChartDetail, ICasesByHourChartValue } from '../app.interface';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BarChart } from '../bar-chart/bar-chart.common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

@Component({
    selector: 'app-cases-by-hour-chart',
    templateUrl: './cases-by-hour-chart.component.html',
    styleUrls: ['./cases-by-hour-chart.component.scss'],
    providers: [CasesByHourChartService]
})
export class CasesByHourChartComponent extends BarChart implements OnDestroy, OnChanges {
    @Input('width') width;
    @Input('height') height;
    @Input('isDashboard') isDashboard = false;
    @ViewChild('detail') detail;

    public kpiName = Languages.get('kpi.numberOfCasesHourly', 'start');
    public selectedFrequency;
    public selectedPeriod;
    public selectedCustomerList = [];
    public selectedModelList = [];
    public selectedDay = 'ALL';
    public barColor = '#9ed358';
    public dayList = AppConfiguration.casesByHour.days;
    public caseTypes = AppConfiguration.casesByHour.caseTypes;
    public step = 0;
    public selectedBarValue: ICasesByHourChartValue;
    public finalBarValue: string;
    public chartData: IChartData[];
    public stackedData1: ICasesByHourChartValue[];
    public detailsByDate: IOnsiteBarChartDetail;
    public detailsForAllDay: ICasesByHourChartValue;
    public Languages = Languages;
    public selectedHour: string;
    public dispatchAverage: string;
    public phoneFixAverage: string;
    public AppConfiguration = AppConfiguration;
    public Location = Location;
    public round = _.round;
    public customerChips: { removable: boolean, text: string }[] = [];
    public modelChips: { removable: boolean, text: string }[] = [];
    public periodChips: { removable: boolean, text: string };
    public barClickCheck = false;
    private filterSubscription: ISubscription;

    constructor(private casesByHourChartService: CasesByHourChartService,
        private route: ActivatedRoute,
        private filterService: FilterService) {
        super();
        this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
            this.selectedPeriod = updatedFilter.period;
            this.selectedCustomerList = [];
            this.selectedModelList = [];
            this.selectedCustomerList.push(updatedFilter.customer);
            this.selectedModelList.push(updatedFilter.model);
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
        this.casesByHourChartService.getChartDataService(this.selectedCustomerList,
            this.selectedModelList, this.selectedPeriod, this.selectedFrequency, this.selectedDay)
            .subscribe((chartDataResponse: ICasesByHourChart) => {
                if (chartDataResponse.chartData.length > 0) {
                    this.dispatchAverage = chartDataResponse.dispatchAverage;
                    this.phoneFixAverage = chartDataResponse.phoneFixAverage;
                    this.chartData = _.map(chartDataResponse.chartData,
                        data => _.merge({
                            caseDate: _.toString(
                                data.hour > 9 ? '' + data.hour : '0' + data.hour) + ':00'
                        },
                            _.reduce(this.caseTypes, (result, slot, index) => {
                                result[`slot${index + 1}`] = data[this.caseTypes[index].key];
                                return result;
                            }, {}))
                    );
                    if (this.barClickCheck === false) {
                        this.getDetailForAllDaysEachBar('23:00');
                        this.getCaseDetailForEachBar('23:00');
                    } else if (this.barClickCheck === true) {
                        this.getDetailForAllDaysEachBar(this.selectedHour);
                        this.getCaseDetailForEachBar(this.selectedHour);
                    }
                }
            });
    }
    public getCaseDetailForEachBar(hour) {
        let fromDate;
        this.detailsByDate = undefined;
        const periodLength = Languages.get('periodList.' + this.selectedPeriod);
        fromDate = moment().subtract((_.toNumber(periodLength) + 1), 'days').format('MM/DD/YYYY');
        const toDate = moment().subtract(1, 'days').format('MM/DD/YYYY');
        this.selectedHour = hour.substr(0, 2);
        this.casesByHourChartService
            .getDetailForEachBarService(
                this.selectedCustomerList, this.selectedModelList, this.selectedFrequency,
                this.selectedPeriod, fromDate, toDate, this.selectedDay, this.selectedHour)
            .subscribe((chartDetailResponse: IOnsiteBarChartDetail) => {
                this.detailsByDate = chartDetailResponse;
            });
    }

    public getDetailForAllDays() {
        let fromDate;
        fromDate = moment().subtract(Languages.get('periodList.' + this.selectedPeriod), 'days').format('MM/DD/YYYY');
        const toDate = moment().format('MM/DD/YYYY');
        this.casesByHourChartService.getDetailForAllDaysService(this.selectedCustomerList, this.selectedModelList, this.selectedPeriod)
            .subscribe((chartDetailResponse: ICasesByHourChartValue) => {
                this.detailsForAllDay = chartDetailResponse;
                if (this.selectedDay !== 'ALL') {
                    this.getSelectedBarValue(chartDetailResponse);
                }
            });
    }

    public getDetailForAllDaysEachBar(hour) {
        this.selectedHour = hour.substr(0, 2);
        this.selectedBarValue = {
            dispatch: 0, phoneFix: 0, weekDay: ''
        };
        let fromDate;
        fromDate = moment().subtract(Languages.get('periodList.' + this.selectedPeriod), 'days').format('MM/DD/YYYY');
        const toDate = moment().format('MM/DD/YYYY');
        this.casesByHourChartService.getDetailForAllDaysEachBarService(
            this.selectedCustomerList, this.selectedModelList, this.selectedFrequency, this.selectedPeriod, this.selectedHour)
            .subscribe((chartDetailResponse: ICasesByHourChartValue) => {
                this.detailsForAllDay = chartDetailResponse;
                if (this.selectedDay !== 'ALL') {
                    this.getSelectedBarValue(chartDetailResponse);
                }
            });
    }

    public getSelectedBarValue(response) {
        if (response.length > 0) {
            this.selectedBarValue = _.find(response, ['weekDay', this.selectedDay]);
            this.finalBarValue = `${this.selectedBarValue.phoneFix} | ${this.selectedBarValue.dispatch}`;
        }
    }

    public change() {
        this.getChartData();
    }

    onBarClick(e) {
        this.selectedHour = e.date;
        this.barClickCheck = true;
        this.getCaseDetailForEachBar(this.selectedHour);
        this.getDetailForAllDaysEachBar(this.selectedHour);
        if (this.detail && !e.noClick) {
            this.detail.openDialog();
        }
    }
}

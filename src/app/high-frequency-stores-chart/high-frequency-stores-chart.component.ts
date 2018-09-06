import { Component, Input, OnDestroy, ViewChild, OnChanges } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { HighFrequencyStoresChartService } from './high-frequency-stores-chart.service';
import { ActivatedRoute } from '@angular/router';
import { FilterService } from '../services/filter.service';
import { ISubscription } from 'rxjs/Subscription';
import { IChartData, IHighFrequencyChart, IOnsiteBarChartDetail } from '../app.interface';
import * as moment from 'moment';
import * as _ from 'lodash';
import { BarChart } from '../bar-chart/bar-chart.common';

@Component({
    selector: 'app-high-frequency-stores-chart',
    templateUrl: './high-frequency-stores-chart.component.html',
    styleUrls: ['./high-frequency-stores-chart.component.scss'],
    providers: [HighFrequencyStoresChartService]
})
export class HighFrequencyStoresChartComponent extends BarChart implements OnDestroy, OnChanges {
    @Input('width') width;
    @Input('height') height;
    @Input('isDashboard') isDashboard = false;
    @ViewChild('detail') detail;

    public kpiName = Languages.get('kpi.highFrequencyDispatch', 'start');
    public selectedPeriod;
    public selectedFrequency;
    // public selectedCustomer: string;
    // public selectedModel: string;
    public selectedCustomerList = [];
    public selectedModelList = [];
    public selectedArea = 'ALL';
    public selectedCase = 'number';
    public barColor = '#A37759';
    public areaList = AppConfiguration.casesByArea.areas.map(area => area.name);
    public selectedBarValue: number;
    public step = 0;
    public chartData: IChartData[];
    public detailsByDate: IOnsiteBarChartDetail;
    public Languages = Languages;
    public selectedMachine: string;
    public averageValue: number;
    public AppConfiguration = AppConfiguration;
    public Location = Location;
    public round = _.round;
    public customerChips: { removable: boolean, text: string }[] = [];
    public modelChips: { removable: boolean, text: string }[] = [];
    public periodChips: { removable: boolean, text: string };
    public barClickCheck = false;
    private filterSubscription: ISubscription;

    constructor(private highFrequencyStoresChartService: HighFrequencyStoresChartService,
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
        this.selectedBarValue = 0;
        this.highFrequencyStoresChartService.getChartDataService(
            this.selectedCustomerList, this.selectedModelList, this.selectedPeriod, this.selectedFrequency,
            _.get(_.find(this.AppConfiguration.casesByArea.areas, ['name', this.selectedArea]), 'apiKey') || 'ALL')
            .subscribe((chartDataResponse: IHighFrequencyChart) => {
                const noData = {
                    chartData: [{ serial: 'No Machine', total: 0 }],
                    totalCases: 0
                };
                chartDataResponse =
                    chartDataResponse.chartData.length === 0 ? noData : chartDataResponse;
                if (chartDataResponse.chartData.length > 0) {
                    let maxTotal = { value: 0, index: 0 };
                    // this.averageValue = chartDataResponse.totalCases;

                    this.averageValue = chartDataResponse.totalStores;
                    this.chartData = _.map(chartDataResponse.chartData, (data, index) => {
                        if (data.total > maxTotal.value) {
                            maxTotal = { value: data.total, index: 0 };
                        }
                        return {
                            caseDate: data.serial,
                            averageHours: data.total
                        };
                    }
                    );
                    this.selectedMachine = _.get(this.chartData[maxTotal.index], 'caseDate');
                    if (this.barClickCheck === false) {
                        this.getDetailForEachBar(this.chartData[maxTotal.index].caseDate);
                        this.selectedBarValue = this.chartData[maxTotal.index].total;
                    } else if (this.barClickCheck === true) {
                        this.getDetailForEachBar(this.selectedMachine);
                        this.selectedBarValue = this.chartData[this.selectedMachine].total;
                    }
                }

            });
    }

    public getDetailForEachBar(machineId) {
        let fromDate;
        this.detailsByDate = null;
        const periodLength = Languages.get('periodList.' + this.selectedPeriod);
        fromDate = moment().subtract((_.toNumber(periodLength) + 1), 'days').format('MM/DD/YYYY');
        const toDate = moment().subtract(1, 'days').format('MM/DD/YYYY');
        this.highFrequencyStoresChartService
            .getDetailForEachBarService(this.selectedCustomerList, this.selectedModelList, this.selectedFrequency, fromDate, toDate,
                _.get(_.find(this.AppConfiguration.casesByArea.areas, ['name', this.selectedArea]), 'apiKey') || 'ALL', machineId)
            .subscribe((chartDetailResponse: IOnsiteBarChartDetail) => {
                this.detailsByDate = chartDetailResponse;
            });
    }

    public change() {
        this.selectedBarValue = 0;
        this.getChartData();
    }

    onBarClick(e) {
        this.selectedMachine = e.date;
        this.selectedBarValue = Number(e.barValue);
        this.barClickCheck = true;
        this.getDetailForEachBar(this.selectedMachine);
        if (this.detail && !e.noClick) {
            this.detail.openDialog();
        }
    }
}

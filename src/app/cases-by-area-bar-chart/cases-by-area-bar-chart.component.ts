import { Component, Input, OnDestroy, ViewChild, OnChanges, OnInit } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { CasesByAreaBarChartService } from './cases-by-area-bar-chart.service';
import { ActivatedRoute } from '@angular/router';
import { FilterService } from '../services/filter.service';
import { ISubscription } from 'rxjs/Subscription';
import { ICasesByAreaChart, ICasesByAreaChartValue, IChartData, IOnsiteBarChartDetail } from '../app.interface';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BarChart } from '../bar-chart/bar-chart.common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

@Component({
    selector: 'app-cases-by-area-bar-chart',
    templateUrl: './cases-by-area-bar-chart.component.html',
    styleUrls: ['./cases-by-area-bar-chart.component.scss'],
    providers: [CasesByAreaBarChartService]
})

export class CasesByAreaBarChartComponent extends BarChart implements OnChanges, OnInit, OnDestroy {
    @Input('width') width;
    @Input('height') height;
    @Input('area') area;
    @Input('isDashboard') isDashboard = false;
    @ViewChild('detail') detail;

    public kpiName = Languages.get('kpi.casesByArea', 'start');
    public selectedPeriod;
    public selectedFrequency;
    public selectedCustomerList = [];
    public selectedModelList = [];
    public selectedCase = 'number';
    public selectedCaseType = 'ALL';
    public selectedArea = 'ALL';
    public selectedBarValue: number;
    public slotData;
    public barColor;
    public areaList = AppConfiguration.casesByArea.areas.map(area => area.name);
    public cases = AppConfiguration.casesByArea.cases;
    public caseTypes = AppConfiguration.casesByArea.caseTypes.keys;
    public dispatchCaseType = AppConfiguration.casesByArea.dispatchCaseType.keys;
    public chartData: IChartData[];
    public stackedData: ICasesByAreaChartValue[];
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
    private allAreaBarChartData: Array<any>;

    constructor(private casesByAreaBarChartService: CasesByAreaBarChartService,
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

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.selectedArea = params['selectedArea'];
        });
    }


    ngOnChanges() {
        if (this.area !== '' || this.area !== undefined) {
            this.selectedArea = this.area;
        }
        this.change();
    }

    ngOnDestroy() {
        this.filterSubscription.unsubscribe();
    }

    public getChartData() {
        this.selectedBarValue = 0;
        this.casesByAreaBarChartService.getChartDataService(this.selectedCustomerList,
            this.selectedModelList,
            this.selectedPeriod,
            this.selectedFrequency,
            _.get(_.find(this.AppConfiguration.casesByArea.areas, ['name', this.selectedArea]), 'apiKey') || 'ALL')
            .subscribe((chartDataResponse: ICasesByAreaChart) => {
                if (chartDataResponse.chartData.length > 0) {
                    this.chartData = [];
                    this.stackedData = chartDataResponse.chartData;
                    const lastBar = chartDataResponse.chartData[chartDataResponse.chartData.length - 1];
                    if (this.selectedFrequency === 'weekly') {
                        chartDataResponse.chartData = _.sortBy(chartDataResponse.chartData, data => data.week);
                        chartDataResponse.chartData =
                            _.map(chartDataResponse.chartData, data =>
                                ({
                                    date: data.caseDate,
                                    caseDate:
                                        `${moment(data.caseDate)
                                            .startOf('isoWeek').format('MMM DD')} - ${moment(data.caseDate).endOf('isoWeek').format('DD')}`,
                                    phoneFix: data.phoneFix,
                                    inScope: data.inScope,
                                    outScope: data.outScope,
                                    dispatch: data.dispatch
                                }));

                    } else if (this.selectedFrequency === 'monthly') {
                        chartDataResponse.chartData =
                            _.sortBy(chartDataResponse.chartData, data => moment(data.caseDate).format('YYYYMM'));
                        chartDataResponse.chartData =
                            _.map(chartDataResponse.chartData, data =>
                                ({
                                    date: data.caseDate,
                                    caseDate: data.month,
                                    phoneFix: data.phoneFix,
                                    inScope: data.inScope,
                                    outScope: data.outScope,
                                    dispatch: data.dispatch
                                })
                            );
                    }
                    if (this.selectedCaseType === 'ALL') {
                        this.averageValue = _.reduce(this.caseTypes,
                            (totalAverage, slot) => totalAverage + chartDataResponse[`${slot}TotalCases`], 0);
                        if (this.selectedArea === 'ALL') {
                            this.getAllAreaData();
                        } else {
                            if (this.selectedCase === 'percentage') {
                                this.averageValue = 100;
                            }
                            this.chartData = _.map(chartDataResponse.chartData,
                                data => _.merge({
                                    caseDate: data.caseDate,
                                    date: this.selectedFrequency === 'daily' ? data.caseDate : data.date
                                },
                                    _.reduce(this.caseTypes, (result, slot, index) => {
                                        result[`slot${index + 1}`] =
                                            _.get(data[slot], this.selectedCase);
                                        return result;
                                    }, {}))
                            );
                        }
                    } else if (this.selectedCaseType === 'dispatch') {
                        this.averageValue = chartDataResponse[`${this.selectedCaseType}TotalCases`];
                        if (this.selectedArea === 'ALL') {
                            this.getAllAreaData();
                        } else {
                            if (this.selectedCase === 'percentage') {
                                this.averageValue = (chartDataResponse[`${this.selectedCaseType}TotalCases`]) * 100 /
                                    (chartDataResponse[`dispatchTotalCases`] + chartDataResponse[`phoneFixTotalCases`]);
                            }
                            this.chartData = _.map(chartDataResponse.chartData, data => _.merge({
                                caseDate: data.caseDate,
                                date: this.selectedFrequency === 'daily' ? data.caseDate : data.date
                            },
                                _.reduce(this.dispatchCaseType, (result, slot, index) => {
                                    result[`slot${index + 1}`] =
                                        _.get(data[slot], this.selectedCase);
                                    return result;
                                }, {}))
                            );
                        }
                    } else {
                        if (this.selectedArea === 'ALL') {
                            this.getAllAreaData();
                        } else {
                            // this.averageValue = _.reduce(this.caseTypes,
                            //     totalAverage => totalAverage + chartDataResponse[`${this.selectedCaseType}TotalCases`], 0);
                            this.averageValue = chartDataResponse[`${this.selectedCaseType}TotalCases`];
                            if (this.selectedCase === 'percentage') {
                                this.averageValue = (chartDataResponse[`${this.selectedCaseType}TotalCases`]) * 100 /
                                    (chartDataResponse[`dispatchTotalCases`] + chartDataResponse[`phoneFixTotalCases`]);
                            }
                            const caseType = this.selectedCaseType;
                            this.chartData = _.map(chartDataResponse.chartData,
                                data => ({
                                    caseDate: data.caseDate,
                                    date: this.selectedFrequency === 'daily' ? data.caseDate : data.date,
                                    averageHours:
                                        _.toNumber(_.get(data, `${this.selectedCaseType}.${this.selectedCase}`))
                                })
                            );
                        }
                    }

                    if (this.barClickCheck === false) {
                        if (this.chartData
                            && this.chartData[this.chartData.length - 1]
                            && !this.chartData[this.chartData.length - 1].averageHours
                            && this.selectedCase === 'percentage') {
                            const barValue = this.chartData[this.chartData.length - 1];
                            if (this.selectedCaseType === 'ALL') {
                                this.selectedBarValue =
                                    _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2) + _.toNumber(barValue.slot3);
                            } else if (this.selectedCaseType === 'dispatch') {
                                this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
                            }
                        }
                        if (this.selectedCaseType !== 'ALL') {
                            if (this.selectedCaseType !== 'dispatch') {
                                if (this.selectedArea !== 'ALL') {
                                    this.selectedBarValue = this.chartData[this.chartData.length - 1].averageHours;
                                }
                            }
                        }
                        if (this.selectedFrequency === 'weekly' || this.selectedFrequency === 'monthly') {
                            this.getDetailForEachBar(this.chartData[this.chartData.length - 1].date);
                        } else {
                            this.getDetailForEachBar(this.chartData[this.chartData.length - 1].caseDate);
                        }
                    } else {
                        if (this.chartData
                            && this.chartData[this.chartData.length - 1]
                            && !this.chartData[this.chartData.length - 1].averageHours
                            && this.selectedCase === 'percentage') {
                            const barValue = _.find(this.chartData, ['date', this.fromDate]);
                            if (this.selectedCaseType === 'ALL') {
                                this.selectedBarValue =
                                    _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2) + _.toNumber(barValue.slot3);
                            } else if (this.selectedCaseType === 'dispatch') {
                                this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
                            }
                        }
                        if (this.selectedCaseType !== 'ALL') {
                            if (this.selectedCaseType !== 'dispatch') {
                                if (this.selectedArea !== 'ALL') {
                                    this.selectedBarValue = this.chartData[this.chartData.length - 1].averageHours;
                                }
                            }
                        }
                        this.getDetailForEachBar(this.fromDate);
                    }
                }

            });
    }

    public getAllAreaData() {
        if (this.selectedCaseType === 'ALL') {
            Observable.forkJoin(_.map(this.AppConfiguration.casesByArea.areas, area => this.casesByAreaBarChartService
                .getChartDataService(
                    this.selectedCustomerList,
                    this.selectedModelList,
                    this.selectedPeriod,
                    this.selectedFrequency,
                    area.apiKey)))
                .subscribe((chartDataResponse: ICasesByAreaChart[]) => {
                    if (chartDataResponse && chartDataResponse[0].chartData.length > 0) {
                        this.chartData = [];
                        this.allAreaBarChartData = [];
                        if (this.selectedFrequency === 'weekly') {
                            chartDataResponse.forEach((element, index) => {
                                chartDataResponse[index].chartData = _.sortBy(chartDataResponse[index].chartData, data => data.week);

                                chartDataResponse[index].chartData =
                                    _.map(chartDataResponse[index].chartData, data =>
                                        ({
                                            date: data.caseDate,
                                            caseDate:
                                                `${moment(data.caseDate).startOf('isoWeek').format('MMM DD')}
                                 - ${moment(data.caseDate).endOf('isoWeek').format('DD')}`,
                                            phoneFix: data.phoneFix,
                                            inScope: data.inScope,
                                            outScope: data.outScope,
                                            dispatch: data.dispatch
                                        }));
                            });
                        } else if (this.selectedFrequency === 'monthly') {
                            chartDataResponse.forEach((element, index) => {
                                chartDataResponse[index].chartData =
                                    _.sortBy(chartDataResponse[index].chartData, data => moment(data.caseDate).format('YYYYMM'));

                                chartDataResponse[index].chartData =
                                    _.map(chartDataResponse[index].chartData, data =>
                                        ({
                                            date: data.caseDate,
                                            caseDate: data.month,
                                            phoneFix: data.phoneFix,
                                            inScope: data.inScope,
                                            outScope: data.outScope,
                                            dispatch: data.dispatch
                                        })
                                    );
                            });
                        } else {
                            chartDataResponse.forEach((element, index) => {
                                chartDataResponse[index].chartData = _.sortBy(chartDataResponse[index].chartData, data => data.date);
                            });
                        }
                        this.allAreaBarChartData = _.reduce(chartDataResponse[0].chartData, (chartResult, chartData, chartIndex) => {
                            chartResult.push(_.reduce(this.areaList, (result, area, index) => {
                                result[area] = chartDataResponse[index].chartData[chartIndex];
                                return result;
                            }, {}));
                            return chartResult;
                        }, []);
                        this.averageValue = this.totalCases;
                        if (this.selectedCase === 'percentage') {
                            this.averageValue = 100;
                        }
                        this.chartData = _.map(this.allAreaBarChartData, data =>
                            _.merge({
                                caseDate: data[this.areaList[0]].caseDate,
                                date: this.selectedFrequency === 'daily' ? data[this.areaList[0]].caseDate : data[this.areaList[0]].date
                            },
                                this.areaList.reduce((result, slot, index) => {
                                    result[`slot${index + 1}`] =
                                        _.sum([_.toNumber(_.get(data, `${slot}.dispatch.number`))
                                            , _.toNumber(_.get(data, `${slot}.phoneFix.number`))]);
                                    return result;
                                }, {}))
                        );

                        if (this.barClickCheck === false) {
                            if (this.chartData
                                && this.chartData[this.chartData.length - 1]
                                && !this.chartData[this.chartData.length - 1].averageHours
                                && this.selectedCase === 'percentage'
                                && this.selectedCase === 'percentage') {
                                const barValue = this.chartData[this.chartData.length - 1];
                                if (this.selectedArea === 'ALL') {
                                    this.selectedBarValue =
                                        _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2)
                                        + _.toNumber(barValue.slot3) + _.toNumber(barValue.slot4);
                                    this.selectedBarValue = this.selectedBarValue > 0 ? 100 : 0;
                                } else {
                                    this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
                                }
                            }
                            if (this.selectedFrequency === 'weekly' || this.selectedFrequency === 'monthly') {
                                this.getDetailForEachBar(this.chartData[this.chartData.length - 1].date);
                            } else {
                                this.getDetailForEachBar(this.chartData[this.chartData.length - 1].caseDate);
                            }
                        } else {
                            this.selectedBarValue = _.find(this.chartData, ['date', this.fromDate]).averageHours;
                            if (this.chartData
                                && this.chartData[this.chartData.length - 1]
                                && !this.chartData[this.chartData.length - 1].averageHours
                                && this.selectedCase === 'percentage'
                                && this.selectedCase === 'percentage') {
                                const barValue = _.find(this.chartData, ['date', this.fromDate]);
                                if (this.selectedCaseType === 'ALL') {
                                    this.selectedBarValue =
                                        _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2)
                                        + _.toNumber(barValue.slot3) + _.toNumber(barValue.slot4);
                                    this.selectedBarValue = this.selectedBarValue > 0 ? 100 : 0;
                                } else if (this.selectedCaseType === 'dispatch') {
                                    this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
                                }
                            }
                            if (this.selectedCaseType !== 'ALL') {
                                if (this.selectedCaseType !== 'dispatch') {
                                    if (this.selectedArea !== 'ALL') {
                                        this.selectedBarValue = this.chartData[this.chartData.length - 1].averageHours;
                                    }
                                }
                            }
                            this.getDetailForEachBar(this.fromDate);
                        }
                    }
                });
        } else {
            this.casesByAreaBarChartService
                .getChartDataService(this.selectedCustomerList, this.selectedModelList, this.selectedPeriod, this.selectedFrequency, 'ALL')
                .subscribe((chartDataResponse: ICasesByAreaChart) => {
                    if (chartDataResponse && chartDataResponse.chartData.length > 0) {
                        this.chartData = [];
                        if (this.selectedCaseType === 'dispatch') {
                            this.averageValue = chartDataResponse[`${this.selectedCaseType}TotalCases`];
                            if (this.selectedCase === 'percentage') {
                                this.averageValue = this.averageValue * 100 / this.totalCases;
                            }
                            this.chartData = chartDataResponse.chartData
                                .map(data => _.merge({
                                    caseDate: data.caseDate,
                                    date: this.selectedFrequency === 'daily' ? data.caseDate : data.date
                                },
                                    _.reduce(this.dispatchCaseType, (result, slot, index) => {
                                        result[`slot${index + 1}`] = _.toNumber(data[slot].number);
                                        return result;
                                    }, {}))
                                );
                        } else {
                            this.averageValue = chartDataResponse[`${this.selectedCaseType}TotalCases`];
                            if (this.selectedCase === 'percentage') {
                                this.averageValue = this.averageValue * 100 / this.totalCases;
                            }
                            this.chartData = _.map(chartDataResponse.chartData, data => {
                                return ({
                                    caseDate: data.caseDate,
                                    date: this.selectedFrequency === 'daily' ? data.caseDate : data.date,
                                    averageHours:
                                        _.toNumber(_.get(data, `${this.selectedCaseType}.${this.selectedCase}`))
                                });
                            });
                        }
                        if (this.barClickCheck === false) {
                            if (this.chartData
                                && this.chartData[this.chartData.length - 1]
                                && !this.chartData[this.chartData.length - 1].averageHours
                                && this.selectedCase === 'percentage') {
                                const barValue = this.chartData[this.chartData.length - 1];
                                this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
                                this.selectedBarValue = this.selectedBarValue > 0 ? 100 : 0;
                            }
                            if (this.selectedFrequency === 'weekly' || this.selectedFrequency === 'monthly') {
                                this.getDetailForEachBar(this.chartData[this.chartData.length - 1].date);
                            } else {
                                this.getDetailForEachBar(this.chartData[this.chartData.length - 1].caseDate);
                            }
                        } else {
                            this.selectedBarValue = _.find(this.chartData, ['date', this.fromDate]).averageHours;
                            if (this.chartData
                                && this.chartData[this.chartData.length - 1]
                                && !this.chartData[this.chartData.length - 1].averageHours
                                && this.selectedCase === 'percentage') {
                                const barValue = _.find(this.chartData, ['date', this.fromDate]);
                                this.selectedBarValue = _.toNumber(barValue.slot1) + _.toNumber(barValue.slot2);
                                this.selectedBarValue = this.selectedBarValue > 0 ? 100 : 0;
                            }
                            this.getDetailForEachBar(this.fromDate);
                        }
                    }
                });
        }
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
        this.casesByAreaBarChartService.getDetailForEachBarService
            (this.selectedCustomerList, this.selectedModelList,
            this.selectedFrequency,
            this.fromDate,
            this.toDate,
            _.get(_.find(this.AppConfiguration.casesByArea.areas, ['name', this.selectedArea]), 'apiKey') || 'ALL',
            this.selectedCaseType)
            .subscribe((chartDetailResponse: IOnsiteBarChartDetail) => {
                this.detailsByDate = chartDetailResponse;
            });
    }

    public change() {
        this.selectedBarValue = 0;
        this.averageValue = 0;
        this.casesByAreaBarChartService.getChartDataService(
            this.selectedCustomerList,
            this.selectedModelList,
            this.selectedPeriod,
            this.selectedFrequency,
            'ALL'
        )
            .subscribe((chartDataResponse: ICasesByAreaChart) => {
                if (chartDataResponse.chartData.length > 0) {
                    this.totalCases = _.reduce(this.caseTypes,
                        (totalAverage, slot) => totalAverage + chartDataResponse[`${slot}TotalCases`], 0);
                }
                this.allAreaBarChartData = [];
                if (this.selectedCaseType !== 'ALL' && this.selectedCaseType !== 'dispatch') {
                    if (this.selectedArea === 'ALL') {
                        this.barColor = _.find(this.AppConfiguration.casesByArea.colorSlots[this.selectedCaseType],
                            ['key', this.selectedCaseType])['color'];
                    } else {
                        this.barColor = _.find(this.AppConfiguration.casesByArea.colorSlots[this.selectedArea],
                            ['key', this.selectedCaseType])['color'];
                    }
                    this.getChartData();
                } else if (this.selectedArea === 'ALL') {
                    if (this.selectedCaseType === 'ALL') {
                        this.slotData = this.AppConfiguration.casesByArea.colorSlots.all;
                    } else if (this.selectedCaseType === 'dispatch') {
                        this.slotData = this.AppConfiguration.casesByArea.colorSlots.dispatch;
                    }
                    this.getAllAreaData();
                } else {
                    if (this.selectedCaseType === 'ALL') {
                        this.slotData = _.get(this.AppConfiguration.casesByArea.colorSlots, this.selectedArea);
                    } else if (this.selectedCaseType === 'dispatch') {
                        this.slotData = _.filter(this.AppConfiguration.casesByArea.colorSlots[this.selectedArea], color =>
                            _.indexOf(this.AppConfiguration.casesByArea.dispatchCaseType.keys, color.key) !== -1);
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
        this.selectedBarValue = ((this.selectedCaseType === 'ALL' || this.selectedCaseType === 'dispatch')
            && this.selectedCase === 'percentage') ? 100 : Number(e.barValue);
        this.getDetailForEachBar(this.fromDate);
        if (this.detail && !e.noClick) {
            this.detail.openDialog();
        }
    }
}

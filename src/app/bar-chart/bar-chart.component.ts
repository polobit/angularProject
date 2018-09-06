import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { IAverageBarChartValue } from '../app.interface';
import * as d3 from 'd3';
import * as moment from 'moment';
import * as _ from 'lodash';
import { MatPaginator, MatPaginatorIntl } from '@angular/material';
import { UserExperienceReportComponent } from '../user-experience-report/user-experience-report.component';
import { UserExperienceReportService } from '../user-experience-report/user-experience-report.service';
@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
    providers: [UserExperienceReportComponent, UserExperienceReportService]
})
export class BarChartComponent implements OnInit, OnChanges {
    /** Inputs
     * @Input('width') - Initial SVG width
     * @Input('height') - Initial SVG height
     * @Input('data') - Data for chart
     * @Input('type') - Format for stacked chart
     * @Input('barColor') - Bar color
     * @Input('slots') - Slots for stacked chart {key, slot, color}[]
     * @Input('slotNumber') - Slot number for stacked bar chart
     * @Input('threshold') - Target value
     * @Input('thresholdOverlay') - Is threshold line on top of the bars?
     * @Input('xProperty') - Property name for X scale;
     * @Input('yProperty') - Property name for Y scale;
     * @Input('sortData') - Shall data be sorted? (default: false)
     * @Input('showAverage') - Shall chart calculate and show Average? (default: true)
     *                         Data sorted based on data format. To sort by time define timeFormat.
     * @Input('timeFormat') - Time format based on this https://momentjs.com/docs/#/displaying/ If none - no formatting
     * @Input('barsPerPage') - How many bars per page. If 0 - no pagination
     *
     * Outputs
     * @Output() - Bar click event
     */

    @Input('width') width?: number;
    @Input('height') height?: number;
    @Input('data') data: any[];
    @Input('type') type?: 'number' | 'percentage';
    @Input('barColor') barColor?: string;
    @Input('slots') slots?: { key, slot, color }[];
    @Input('slotNumber') slotNumber?: number;
    @Input('threshold') threshold?: number;
    @Input('thresholdOverlay') thresholdOverlay?: boolean;
    @Input('xProperty') xProperty = 'caseDate';
    @Input('yProperty') yProperty = 'averageHours';
    @Input('sortData') sortData = false;
    @Input('showAverage') showAverage = true;
    @Input('timeFormat') timeFormat?: string;
    @Input('barsPerPage') barsPerPage = 0;
    @Input('chartFor') chartFor = 'kpi';
    @Input('tickAngle') tickAngle = '-90';
    @Input('barRadius') barRadius?: number;
    @Input('chartName') chartName = 'chart';
    @Input('aggregateValue') aggregateValue?: number | string;
    @Input('kpiName') kpiName?: string;
    @Input('dataLength') dataLength?: number;
    @Input('serverPagination') serverPagination = false;
    @Input('noData') noData = false;
    @Output() barClick = new EventEmitter<{ date: string, barValue: number, alternateDate: string, index: number }>();
    @Output() pageChange = new EventEmitter<{ pageOffset: number, pageLimit: number }>();
    @ViewChild('detail') detail;
    @ViewChild('paginator') paginator: MatPaginator;

    public step = 0;
    public Languages = Languages;
    public showLegend = false;
    public ceil = _.ceil;
    public toNumber = _.toNumber;
    public pageIndex: number;
    private chartData: any[];
    private chartDataFull: any[];
    private chartWidth: number;
    private chartHeight: number;
    private currentWidth: number;
    private currentHeight: number;
    private margin = { top: 20, right: 30, bottom: 60, left: 50 };
    private x: any;
    private y: any;
    private z: any;
    private svg: any;
    private g: any;
    private slotKeys: string[];
    private chartType: 'bar' | 'stacked';
    private padding = AppConfiguration.global.kpiChart.resolution.desktop.padding;
    private fontSize = AppConfiguration.global.kpiChart.resolution.desktop.fontSize;
    private actualDataLength?: number;

    constructor(private matPaginatorIntl: MatPaginatorIntl,
        public userExperience: UserExperienceReportComponent) {
        this.matPaginatorIntl.itemsPerPageLabel = Languages.get('global.barsPerPage', 'start');
        this.thresholdOverlay = this.thresholdOverlay === undefined ? true : this.thresholdOverlay;
        this.currentWidth = this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
        this.currentHeight = this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
    }

    ngOnInit() { }

    ngOnChanges(change: SimpleChanges) {
        this.aggregateValue = _.toNumber(this.aggregateValue);
        this.aggregateValue = this.aggregateValue ? this.aggregateValue : 0;
        if (this.serverPagination && this.actualDataLength !== this.dataLength) {
            this.pageIndex = 0;
        }
        if (this.serverPagination && this.dataLength) {
            this.actualDataLength = this.dataLength;
        }
        if (change.data) {
            this.chartDataFull = _.cloneDeep(this.data);
            _.forEach(this.chartDataFull, value => value._date = value.caseDate);
            if (this.sortData) {
                this.chartDataFull = _.sortBy(this.chartDataFull, data => this.timeFormat ?
                    moment(data[this.xProperty], AppConfiguration.global.apiTimeFormat, true) : data[this.xProperty]);
            }
            if (this.timeFormat) {
                this.chartDataFull = _.map(this.chartDataFull, data => {
                    const date = moment(data[this.xProperty], AppConfiguration.global.apiTimeFormat, true);
                    if (date.isValid()) {
                        data[this.xProperty] = date.format(this.timeFormat);
                    }
                    return data;
                });
            }
            if (this.barsPerPage) {
                this.chartData = this.serverPagination ? this.chartDataFull : this.chartDataFull.slice(0, this.barsPerPage);
            } else {
                this.chartData = this.chartDataFull;
            }
            setTimeout(() => {
                if (!d3.select(`svg#${this.chartName}`).empty()) {
                    this.currentWidth = 0;
                    this.onResize();
                }
            }, 0);
        }
    }

    public removeChart() {
        if (this.svg) {
            this.svg.selectAll('*').remove()
                .exit();
            if (this.noData) {
                this.pageIndex = 0;
                this.dataLength = this.data.length;
            } else {
                this.dataLength = this.actualDataLength;
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        const width = event && event.target ? event.target.innerWidth : window.innerWidth;
        let resolution;
        if (this.chartFor === 'kpi') {
            resolution = width > AppConfiguration.global.resolution.tablet ? AppConfiguration.global.kpiChart.resolution.desktop :
                width > AppConfiguration.global.resolution.phone ? AppConfiguration.global.kpiChart.resolution.tablet :
                    AppConfiguration.global.kpiChart.resolution.phone;
            this.currentWidth = this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
            this.currentHeight = this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
        } else {
            resolution = width > AppConfiguration.global.resolution.tablet ? AppConfiguration.global.reportChart.resolution.desktop :
                width > AppConfiguration.global.resolution.phone ? AppConfiguration.global.reportChart.resolution.tablet :
                    AppConfiguration.global.reportChart.resolution.phone;
            this.currentWidth = this.width || AppConfiguration.global.reportChart.resolution.desktop.width;
            this.currentHeight = this.height || AppConfiguration.global.reportChart.resolution.desktop.height;
        }
        if (resolution.width !== this.currentWidth && width < AppConfiguration.global.resolution.tablet) {
            [this.currentWidth, this.currentHeight, this.padding, this.fontSize] =
                [resolution.width, resolution.height, resolution.padding, resolution.fontSize];
            this.redrawChart();
        } else {
            this.redrawChart();
        }
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
                this.paginator.previousPage();
                break;
            case 'ArrowRight':
                this.paginator.nextPage();
                break;
        }
    }

    onPageChange(e) {
        this.pageIndex = e.pageIndex;
        if (this.serverPagination) {
            this.pageChange.emit(
                {
                    pageOffset: e.pageIndex * e.pageSize,
                    pageLimit: e.pageSize
                });
        } else {
            this.chartData = this.chartDataFull.slice(e.pageIndex * this.barsPerPage, e.pageIndex * this.barsPerPage + this.barsPerPage);
            this.redrawChart();
        }
    }

    private initSvg() {
        this.removeChart();
        this.svg = d3.select(`svg#${this.chartName}`);
        this.svg.attr('width', this.currentWidth)
            .attr('height', this.currentHeight);
        this.chartWidth = +this.svg.attr('width') - this.margin.right - this.margin.left;
        this.chartHeight = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }

    private initAxis() {
        this.x = d3.scaleBand().rangeRound([0, this.chartWidth]).padding(this.padding);
        this.y = d3.scaleLinear().rangeRound([this.chartHeight, 0]);
        if (this.slots) {
            this.z = d3.scaleOrdinal().range(this.slots.map(slot => slot.color));
        }
        this.x.domain(this.chartData.map(d => _.get(d, this.xProperty)));
        if (this.chartFor !== 'kpi') {
            const MAX_RANGE = d3.max(this.chartData, d => _.get(d, this.yProperty)) * 1.1;
            const MIN_RANGE = d3.min(this.chartData, d => _.get(d, this.yProperty));
            this.y.domain([MIN_RANGE < 0 ? 0 : MIN_RANGE > 99.3 ? 99 : MIN_RANGE > 98.3 ? 98 : MIN_RANGE > 97.3 ? 97
                : MIN_RANGE > 0 ? (MIN_RANGE - 0.3) : MIN_RANGE,
            this.type === 'percentage' ? MAX_RANGE > 100 ? 100 : MAX_RANGE : MAX_RANGE]).nice();
        } else {
            if (this.chartType === 'bar') {
                this.y.domain([0, d3.max(this.chartData, d => _.get(d, this.yProperty)) * 1.1]).nice();
            } else {
                if (this.type === 'percentage') {
                    this.y.domain([0, 100]);
                } else {
                    this.y.domain([0, d3.max(this.chartData, d => d.total) * 1.1]).nice();
                    this.z.domain(this.slotKeys);
                }
            }
        }
    }

    private drawAxis() {
        let fontScale = 1;
        const yAxis = this.g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(this.y).ticks(5).tickSize(-this.chartWidth)
                .tickFormat(d => this.type === 'percentage' ? `${d}%` : d));

        yAxis.selectAll('.tick line')
            .attr('transform', 'translate(1,0)')
            .attr('stroke', AppConfiguration.global.colors.axis);

        yAxis.selectAll('.tick text')
            .attr('fill', '#999');
        this.chartData.length >= 35 ? fontScale = 0.8 : fontScale = 1;
        this.g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${this.chartHeight})`)
            .call(d3.axisBottom(this.x)
                .tickFormat(d => {
                    if (this.chartFor === 'report') {
                        return d.length > 10 ? `${d.substr(0, 10)}...` : d;
                    } else {
                        return d;
                    }
                }))
            .selectAll('text')
            .style('font-size', `${this.fontSize * fontScale}px`)
            .style('white-space', 'nowrap')
            .style('width', '50px')
            .style('overflow', 'hidden')
            .style('text-overflow', 'ellipsis')
            .attr('fill', '#999')
            .attr('y', 0)
            .attr('dy', '0.25em')
            .style('text-anchor', 'end')
            .attr('transform', `translate(0,8) rotate(${this.tickAngle})`);
    }

    private drawBars() {
        if (!this.thresholdOverlay) {
            this.drawThreshold();
        }

        const bars = this.g.selectAll('.bar')
            .data(this.chartData)
            .enter()
            .append('rect');

        bars.style('fill', d => {
            let color: string = this.barColor ?
                this.barColor : this.slots ?
                    this.slots.map(slot => slot.color)[this.slotNumber] :
                    AppConfiguration.global.colors.defaultBar;
            if (this.threshold) {
                color = _.get(d, this.yProperty) > this.threshold ?
                    AppConfiguration.global.colors.aboveTarget : AppConfiguration.global.colors.belowTarget;
            }
            if (this.kpiName === 'userExperience') {
                const barValue = _.round(_.toNumber(d.averageHours), 2);
                if (barValue < 99.30) {
                    color = '#EA4646';
                } else if (barValue >= 99.30 && barValue < 99.50) {
                    color = '#B3B3B3';
                } else if (barValue >= 99.50) {
                    color = '#0A9729';
                }
            }
            return color;
        })
            .attr('class', 'bar')
            .attr('x', d => this.x(_.get(d, this.xProperty)))
            .attr('y', this.chartHeight)
            .attr('ry', this.barRadius)
            .attr('width', this.x.bandwidth())
            .transition()
            .duration(1000)
            .ease(d3.easeElastic.period(0.8))
            .delay((d, i) => i * 100 / this.chartData.length)
            .attr('y', d => this.y(_.get(d, this.yProperty)))
            .attr('height', d => this.chartHeight - this.y(_.get(d, this.yProperty)))
            .attr('id', (d, i) => `bar${i}`)
            .each(function () {
                this._fill = d3.select(this).style('fill');
            });

        bars.on('click', (d, i) => {
            const actualIndex = this.paginator ? this.paginator.pageIndex * 30 + i : i;
            this.barClick.emit(
                {
                    date: this.chartData[i]._date,
                    barValue: this.chartData[i].averageHours,
                    alternateDate: this.chartData[i].date,
                    index: this.serverPagination ? i : actualIndex,
                });
        })
            .on('mouseover.color', this.brightenColor)
            .on('mouseleave', this.resetColor);

        if (this.thresholdOverlay) {
            this.drawThreshold();
        }
    }

    private drawNormalizedBars() {
        const normalizedData: IAverageBarChartValue[] = [];
        _.forEach(this.chartData, (data) => {
            _.forEach(this.slotKeys, (value) => data[<string>value] = data.total === 0 ? 0 : data[<string>value] / data.total * 100);
            normalizedData.push(data);
        });
        this.drawStackedBars(normalizedData);
    }

    private drawStackedBars(data?: IAverageBarChartValue[]) {
        data = data || this.chartData;
        const series = d3.stack()
            .keys(this.slotKeys)
            (data);
        const slot = this.g.append('g')
            .selectAll('slot')
            .data(series)
            .enter()
            .append('g')
            .attr('class', 'slot')
            .attr('fill', d => this.z(d.key))
            .attr('id', (d, i) => `slot${i}`);

        const bars = slot
            .selectAll('.bar')
            .data(d => d)
            .enter()
            .append('rect');

        bars.attr('class', 'bar')
            .attr('x', d => this.x(d.data[this.xProperty]))
            .attr('y', this.chartHeight)
            .attr('width', this.x.bandwidth())
            .transition()
            .duration(1000)
            .ease(d3.easeElastic.period(0.8))
            .delay((d, i) => i * 100 / data.length)
            .attr('y', d => this.y(d[1]))
            .attr('height', d => this.y(d[0]) - this.y(d[1]))
            .attr('id', (d, i) => `bar${i}`)
            .each(function () {
                this._fill = d3.select(this).style('fill');
            });

        bars.on('click', (d, i) => {
            this.barClick.emit(
                {
                    date: this.chartData[i]._date,
                    barValue: this.chartData[i].total,
                    alternateDate: this.chartData[i].date,
                    index: i
                });
        })
            .on('mouseover.color', this.brightenColor)
            .on('mouseleave', this.resetColor);
    }

    private drawThreshold() {
        let average: number;
        let differenceBetweenLabels: number;
        let targetLabelBox: any;
        let averageLabelBox: any;

        if (this.threshold) {
            this.g.append('line')
                .attr('x1', 1)
                .attr('x2', this.chartWidth)
                .attr('y1', this.y(this.threshold))
                .attr('y2', this.y(this.threshold))
                .style('stroke', AppConfiguration.averageHours.colors.target)
                .style('stroke-width', '2')
                .style('stroke-dasharray', ('10, 5'))
                .style('opacity', this.thresholdOverlay ? '0.5' : '1');

            targetLabelBox = this.g.append('text')
                .style('font-size', `${this.fontSize + 1}px`)
                .attr('class', 'target-label')
                .attr('text-anchor', 'middle')
                .text(Languages.get('global.target', 'start'))
                .attr('fill', AppConfiguration.averageHours.colors.target)
                .attr('transform', `translate(${this.chartWidth + 15},${this.y(this.threshold)}) rotate(-90)`)
                .node()
                .getBBox();
        }
        if (this.showAverage && this.chartFor === 'kpi') {
            average = this.type === 'number'
                ? d3.mean(this.chartData, d => _.get(d, this.yProperty)) : _.round(_.toNumber(this.aggregateValue), 2);
            this.g.append('line')
                .attr('x1', 1)
                .attr('x2', this.chartWidth)
                .attr('y1', this.y(average))
                .attr('y2', this.y(average))
                .style('stroke', AppConfiguration.averageHours.colors.average)
                .style('stroke-width', '2')
                .style('stroke-dasharray', ('10, 5'))
                .style('opacity', this.thresholdOverlay ? '0.5' : '1');

            averageLabelBox = this.g.append('text')
                .style('font-size', `${this.fontSize + 1}px`)
                .attr('class', 'average-label')
                .attr('text-anchor', 'middle')
                .text(Languages.get('global.average', 'start'))
                .attr('fill', AppConfiguration.averageHours.colors.average)
                .attr('transform', `translate(${this.chartWidth + 15},${this.y(average)}) rotate(-90)`)
                .node()
                .getBBox();
            if (this.threshold) {
                if (average <= this.threshold) {
                    differenceBetweenLabels = this.y(average) + averageLabelBox.x - this.y(this.threshold) + targetLabelBox.x;
                    if (differenceBetweenLabels <= 0) {
                        this.g.select('.target-label')
                            .attr('transform', `translate(${this.chartWidth + 15},
                    ${this.y(this.threshold) + (differenceBetweenLabels + 4) / 2 - 4}) rotate(-90)`);
                        this.g.select('.average-label')
                            .attr('transform', `translate(${this.chartWidth + 15},
                    ${this.y(average) - (differenceBetweenLabels - 4) / 2 + 4}) rotate(-90)`);
                    }
                } else {
                    differenceBetweenLabels = this.y(this.threshold) + targetLabelBox.x - this.y(average) + averageLabelBox.x;
                    if (differenceBetweenLabels <= 0) {
                        this.g.select('.target-label')
                            .attr('transform', `translate(${this.chartWidth + 10},
                    ${this.y(this.threshold) - (differenceBetweenLabels + 4) / 2 + 4}) rotate(-90)`);
                        this.g.select('.average-label')
                            .attr('transform', `translate(${this.chartWidth + 10},
                    ${this.y(average) + (differenceBetweenLabels - 4) / 2 - 4}) rotate(-90)`);
                    }
                }
            }
        }
    }

    private redrawChart() {
        if (!_.isEmpty(this.chartData)) {
            this.showLegend = false;
            this.chartType = _.has(this.chartData[0], 'slot1') ? 'stacked' : 'bar';
            if (this.chartType === 'stacked') {
                this.slotKeys = _.keys(this.chartData[0]).filter(prop => prop.substr(0, 4) === 'slot');
                this.chartData.forEach((dataEntry, index) => {
                    this.chartData[index].total = _.reduce(this.slotKeys,
                        (result, value) => result + _.toNumber(dataEntry[<string>value]), 0);
                });
            }
            this.initSvg();
            this.initAxis();
            this.drawAxis();
            if (this.chartType === 'stacked') {
                this.showLegend = true;
                if (this.type === 'percentage') {
                    this.drawNormalizedBars();
                } else {
                    this.drawStackedBars();
                }
            } else {
                this.drawBars();
            }
        }
    }

    private resetColor(...args) {
        d3.selectAll(`#${args[2][args[1]].id}`).each(function () {
            d3.select(this).style('fill', this._fill);
        });
    }

    private brightenColor(...args) {
        d3.selectAll(`#${args[2][args[1]].id}`).each(function () {
            d3.select(this).style('fill', d3.hcl(this._fill).brighter().toString());
        });
    }
}

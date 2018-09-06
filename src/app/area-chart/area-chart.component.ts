import { Component, Input, OnInit, OnChanges, HostListener, ViewChild, SimpleChanges } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { MatPaginator, MatPaginatorIntl } from '@angular/material';
import { IChartData } from './../app.interface';
import * as d3 from 'd3';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.scss']
})
export class AreaChartComponent implements OnInit, OnChanges {

  @Input('width') width?: number;
  @Input('height') height?: number;
  @Input('data') data: IChartData[];
  @Input('type') type?: 'number' | 'percentage';
  @Input('thresholdOverlay') thresholdOverlay?: boolean;
  @Input('xProperty') xProperty = 'date';
  @Input('yProperty') yProperty = 'value';
  @Input('sortData') sortData = false;
  @Input('period') period = 'daily';
  @Input('threshold') threshold?: number;

  public timeFormat;
  public step = 0;
  public Languages = Languages;
  public showLegend = false;
  public initCalls;
  private chartData: any[];
  private chartDataFull: any[];
  private chartWidth: number;
  private chartHeight: number;
  private currentWidth: number;
  private currentHeight: number;
  private margin = { top: 20, right: 30, bottom: 40, left: 50 };
  private x: any;
  private y: any;
  private z: any;
  private svg: any;
  private g: any;
  private area: any;
  private valueline: any;
  private padding = AppConfiguration.global.reportChart.resolution.desktop.padding;
  private fontSize = AppConfiguration.global.reportChart.resolution.desktop.fontSize;
  private ticksCount;

  constructor() {
    this.currentWidth = this.width || AppConfiguration.global.reportChart.resolution.desktop.width;
    this.currentHeight = this.height || AppConfiguration.global.reportChart.resolution.desktop.height;
    this.thresholdOverlay = this.thresholdOverlay === undefined ? true : this.thresholdOverlay;
  }

  ngOnInit() { }

  ngOnChanges(change: SimpleChanges) {
    if (change.data) {
      if (!_.isEmpty(this.data)) {
        // parse the date / time
        const parseTime = d3.timeParse('%Y-%m-%d');
        this.data.forEach(e => {
          e.date = parseTime(e.date);
          e.value = e.value;
        });
      }
      this.initCalls = setTimeout(() => {
        if (!d3.select('svg').empty()) {
          this.chartWidth = 0;
          this.onResize();
        }
      });
      switch (this.period) {
        case 'weekly':
          this.ticksCount = 26;
          this.timeFormat = '%b %d';
          break;
        case 'monthly':
          this.ticksCount = 12;
          this.timeFormat = '%b %Y';
          break;
        default:
          if (this.data && this.data.length > 8) {
            this.ticksCount = 30;
          } else {
            this.ticksCount = 7;
          }
          this.timeFormat = '%B %d';
          break;
      }
    }
  }

  public removeChart() {
    if (this.svg) {
      this.svg.selectAll('*').remove()
        .exit();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    const width = event && event.target ? event.target.innerWidth : window.innerWidth;
    const appResolution = AppConfiguration.global.reportChart.resolution;
    const globalResolution = AppConfiguration.global.resolution;

    const resolution = width > globalResolution.tablet ? appResolution.desktop :
      width > globalResolution.phone ? appResolution.tablet : appResolution.phone;
    if (resolution.width !== this.currentWidth) {
      [this.currentWidth, this.currentHeight, this.padding, this.fontSize] =
        [resolution.width, resolution.height, resolution.padding, resolution.fontSize];
    }
    this.redrawChart();
  }

  private initSvg() {
    this.removeChart();
    this.svg = d3.select('svg.area-chart')
      .attr('width', this.currentWidth)
      .attr('height', this.currentHeight);
    this.chartWidth = +this.svg.attr('width') - this.margin.right - this.margin.left;
    this.chartHeight = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private initAxis() {
    this.x = d3.scaleTime().rangeRound([0, this.chartWidth]);
    this.y = d3.scaleLinear().rangeRound([this.chartHeight, 0]);
    this.x.domain(d3.extent(this.data, d => _.get(d, this.xProperty)));
    this.y.domain([d3.min(this.data, d => d.value), this.type === 'percentage' ? 100 : d3.max(this.data, d => d.value) * 1.3]);
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
    this.data.length >= 35 ? fontScale = 0.8 : fontScale = 1;
    this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${this.chartHeight})`)
      .call(d3.axisBottom(this.x)
        .ticks(this.ticksCount).tickFormat(d3.timeFormat(this.timeFormat)))
      .selectAll('text')
      .style('font-size', `${this.fontSize * fontScale}px`)
      .attr('fill', '#999')
      .attr('y', 0)
      .attr('dy', '0.25em')
      .style('text-anchor', 'end')
      .attr('transform', `translate(0,8) rotate(-35)`);

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
    }
  }

  private drawChart() {
    // define the area
    this.area = d3.area()
      .x(d => this.x(d.date))
      .y0(this.y(d3.min(this.data, d => d.value)))
      .y1(d => this.y(d.value))
      .curve(d3.curveMonotoneX);

    // define the line
    this.valueline = d3.line()
      .x(d => this.x(d.date))
      .y(d => this.y(d.value))
      .curve(d3.curveMonotoneX);

    // add the area
    this.svg.append('path')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .data([this.data])
      .attr('class', 'area')
      .attr('d', this.area)
      .attr('style', 'fill: rgba(0, 127, 255, 0.3)');

    // add the valueline path.
    this.svg.append('path')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .data([this.data])
      .attr('class', 'line')
      .attr('d', this.valueline)
      .attr('style', 'fill: none;stroke: steelblue;stroke-width: 2px;');

    const circle = this.svg.selectAll('.dot')
      .data(this.data)
      .enter()
      .append('circle');

    circle.attr('class', 'dot')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .attr('cx', d => this.x(d.date))
      .attr('cy', d => this.y(d.value))
      .attr('r', 3)
      .attr('style', 'fill: steelblue;stroke: #fff;');
  }

  private redrawChart() {
    if (!_.isEmpty(this.data)) {
      this.initSvg();
      this.initAxis();
      this.drawAxis();
      this.drawChart();
    }
  }
}

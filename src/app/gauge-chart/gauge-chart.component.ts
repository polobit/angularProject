import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AppConfiguration } from '../app.configuration';
import * as d3 from 'd3';
import * as _ from 'lodash';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})

export class GaugeChartComponent implements OnChanges, OnInit {
  @Input('width') width = 0;
  @Input('height') height = 0;
  @Input('chartSize') chartSize = 0;
  @Input('ringWidth') ringWidth = 50;
  @Input('limit') limit = 0;
  @Input('gaugeId') gaugeId = 'gauge1';
  @Input('pointerValue') pointerValue = 10;
  @Input('showLimit') showLimit = true;
  @Input('chartType') chartType = 'unitlife';

  public actualPointerValue: number;
  public round = _.round;
  gaugemap = { configure: undefined, isRendered: undefined, render: undefined, update: undefined };
  private maxLimit = AppConfiguration.global.gaugeLimit;
  private powerGauge: any;

  private config = {
    ringInset: 5,
    pointerWidth: 5,
    pointerTailLength: 5,
    pointerHeadLengthPercent: 0.5,
    minValue: 0,
    minAngle: -90,
    maxAngle: 90,
    majorTicks: 9,
    color: ['#41D148', '#41D148', '#FFC200', '#FFC200', '#FFC200', '#CD3535', '#CD3535', '#CD3535', '#CD3535']
  };

  private chartConfiguration: any;

  constructor() { }

  ngOnChanges() {
    if (this.chartType === 'summary') {
      this.maxLimit = this.limit > 0 ? this.limit : this.maxLimit;
    }

    this.chartConfiguration = {
      size: this.chartSize,
      clipWidth: this.width,
      clipHeight: this.height,
      ringWidth: this.ringWidth,
      maxValue: this.maxLimit,
      transitionMs: 4000,
    };

    this.actualPointerValue = this.pointerValue;
    this.pointerValue = this.pointerValue > this.maxLimit ? _.toNumber(this.maxLimit) * 0.95 : this.pointerValue;

    setTimeout(() => {
      if (!d3.selectAll(`#${this.gaugeId} svg`).empty()) {
        this.removeChart();
        this.draw(this.gaugeId, this.pointerValue);
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      if (d3.selectAll(`#${this.gaugeId} svg`).empty()) {
        this.removeChart();
        this.draw(this.gaugeId, this.pointerValue);
      }
    });
  }

  public removeChart() {
    if (!d3.selectAll(`#${this.gaugeId} svg`).empty()) {
      d3.selectAll(`#${this.gaugeId} svg`)
        .remove()
        .exit();
    }
  }
  private draw(containerId, pointerValue) {
    this.powerGauge = this.gauge(this.config, `#${containerId}`, this.chartConfiguration);
    this.powerGauge.render(pointerValue);
  }

  private gauge(config, container, configuration) {
    let range;
    let r;
    let pointerHeadLength;
    let svg;
    let arc;
    let scale;
    let ticks;
    let tickData;
    let pointer;
    let ratio;
    let newAngle;
    let centerTx;
    let arcs;
    let lineData;
    let prop;
    let pointerLine;
    let pg;
    const value = 0;
    const donut = d3.pie();

    function deg2rad(deg) {
      return deg * Math.PI / 180;
    }

    function updatedAngle(d) {
      ratio = scale(d);
      newAngle = config.minAngle + (ratio * range);
      return newAngle;
    }

    function configure(configurations) {
      for (prop in configurations) {
        if (prop) {
          config[prop] = configuration[prop];
        }
      }

      range = config.maxAngle - config.minAngle;
      r = config.size / 2;
      pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

      // a linear scale this.gaugemap maps domain values to a percent from 0..1
      scale = d3.scaleLinear()
        .range([0, 1])
        .domain([config.minValue, config.maxValue]);

      ticks = scale.ticks(config.majorTicks);
      tickData = d3.range(config.majorTicks).map(() => 1 / config.majorTicks);

      arc = d3.arc()
        .innerRadius(r - config.ringWidth - config.ringInset)
        .outerRadius(r - config.ringInset)
        .startAngle((d, i) => {
          ratio = d * i;
          return deg2rad(config.minAngle + (ratio * range));
        })
        .endAngle((d, i) => {
          ratio = d * (i + 1);
          return deg2rad(config.minAngle + (ratio * range));
        });
    }
    this.gaugemap.configure = configure;

    function centerTranslation() {
      return 'translate(' + r + ',' + r + ')';
    }

    function isRendered() {
      return (svg !== undefined);
    }
    this.gaugemap.isRendered = isRendered;

    function render(newPointerValue) {
      svg = d3.select(container)
        .append('svg:svg')
        .attr('class', 'gauge')
        .attr('width', config.clipWidth)
        .attr('height', config.clipHeight);

      centerTx = centerTranslation();

      arcs = svg.append('g')
        .attr('class', 'arc')
        .attr('transform', centerTx);

      arcs.selectAll('path')
        .data(tickData)
        .enter().append('path')
        .attr('fill', (d, i) => {
          return config.color[i];
        })
        .attr('d', arc);

      lineData = [[config.pointerWidth / 2, 0],
      [0, -pointerHeadLength],
      [-(config.pointerWidth / 2), 0],
      [0, config.pointerTailLength],
      [config.pointerWidth / 2, 0]];
      pointerLine = d3.line().curve(d3.curveLinear);
      pg = svg.append('g').data([lineData])
        .attr('class', 'pointer')
        .attr('transform', centerTx);

      pointer = pg.append('path')
        .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/)
        .attr('transform', 'rotate(' + config.minAngle + ')');

      update(newPointerValue === undefined ? 0 : newPointerValue);
    }
    this.gaugemap.render = render;
    function update(newPointerValue, newConfiguration?) {
      if (newConfiguration !== undefined) {
        configure(newConfiguration);
      }
      ratio = scale(newPointerValue);
      newAngle = config.minAngle + (ratio * range);
      pointer.transition()
        .duration(config.transitionMs)
        .ease(d3.easeElastic)
        .attr('transform', 'rotate(' + newAngle + ')');
    }
    this.gaugemap.update = update;

    configure(configuration);

    return this.gaugemap;
  }
}



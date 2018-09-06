import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AppConfiguration } from '../app.configuration';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { IPieChart } from '../app.interface';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnChanges {
  @Input('width') width = 200;
  @Input('height') height = 200;
  @Input('pieChartId') pieChartId;
  @Input('data') data: IPieChart[];
  @Input('showLegend') showLegend = false;

  constructor() { }

  ngOnChanges() {
    setTimeout(() => {
      this.removeChart();
      this.drawPieChart();
    });
  }

  public removeChart() {
    if (!d3.selectAll(`#${this.pieChartId} svg`).empty()) {
      d3.selectAll(`#${this.pieChartId} svg`)
        .remove()
        .exit();
    }
  }

  private drawPieChart() {
    const color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);
    const radius = Math.min(this.width, this.height) / 2;

    const svg = d3.select(`#${this.pieChartId}`).append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const g = svg.append('g').attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');

    const pie = d3.pie().value((d) => d.value);

    const path = d3.arc()
      .outerRadius(radius)
      .innerRadius(0);

    const label = d3.arc()
      .outerRadius(radius - 20)
      .innerRadius(-10);

    const arc = g.selectAll('.arc')
      .data(pie(this.data))
      .enter().append('g')
      .attr('class', 'arc');

    arc.append('path')
      .attr('d', path)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', '3px');

    const tooltip = d3.select('#abc')
      .append('div')
      .attr('class', 'tooltip')
      .style('background', 'rgba(0,0,0,0.5)')
      .style('box-shadow', '0 0 5px #999999')
      .style('color', '#333')
      .style('font-size', '12px')
      .style('padding', '10px')
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('width', '80px')
      .style('z-index', '10')
      .style('border-radius', '3px')
      .style('display', 'none');

    arc.on('mousemove', function (d) {
      tooltip.style('display', 'inline');
      tooltip.html(d.data.percent + '% <br>' + d.data.label)
        .style('color', '#ccc')
        .style('font-weight' , 'bold')
        .style('left', (window.innerWidth <= 425 ? (d3.event.clientX - 50) : (d3.event.clientX - 300)) + 'px')
        .style('top', (d3.event.clientY - 200) + 'px');
    });

    arc.on('mouseout', function () {
      tooltip.style('display', 'none');
    });
  }
}

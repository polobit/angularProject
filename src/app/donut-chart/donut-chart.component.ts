import { Component, OnInit, Input, ElementRef, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import * as d3 from 'd3';
import * as moment from 'moment';

/**
 * expecting `data` in format
 *  [
 {name: 'cats', count: 3, percentage: 2, color: '#000000'},
 {name: 'dogs', count: 10, percentage: 8, color: '#f8b70a'}
 ]
 */
@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent implements OnInit, OnChanges {
  @Input('width') width;
  @Input('height') height;
  @Input('radius') radius;
  @Input('centerTitle') centerTitle;
  @Input('centerSubTitle') centerSubTitle;
  @Input('titleColor') titleColor;
  @Input('data') data;
  @Input('donutThickness') donutThickness = 10;

  constructor(private element: ElementRef) {
  }

  getChart() {
    d3.select(this.element.nativeElement).html('');
    return d3.select(this.element.nativeElement)
      .append('svg:svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !changes.data.firstChange) {
      const chart = this.getChart();
      this.draw(chart);
    }
  }

  ngOnInit() {
    this.radius = Math.min(this.height, this.width) / 2;
    const svg = this.getChart();
    this.draw(svg);
  }

  draw(svgHandle) {
    const arc = d3.arc()
      .outerRadius(this.radius - 10)
      .innerRadius(this.radius - 10 - this.donutThickness)
      .startAngle(d => d.startAngle - Math.PI * 3 / 2)
      .endAngle(d => d.endAngle - Math.PI * 3 / 2)
      .cornerRadius(20);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.count);

    const svg = svgHandle.selectAll('.arc')
      .data(pie(this.data));
    const g = svg
      .enter()
      .append('g')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');

    g.append('path')
      .each(function (d) {
        this._current = Object.assign({}, d, { startAngle: d.endAngle });
      })
      .style('fill', d => d.data.color)
      .attr('transform', 'scale(-1, 1)')
      .transition()
      .duration(1000)
      .attrTween('d', arcTween);

    function arcTween(a) {
      const i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function (t) {
        return arc(i(t));
      };
    }

    function exitTween(d) {
      const end = Object.assign({}, this._current, { startAngle: this._current.endAngle });
      const i = d3.interpolate(d, end);
      return function (t) {
        return arc(i(t));
      };
    }

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '2.5em')
      .attr('font-weight', 'bold')
      .attr('y', 0)
      .text(this.centerTitle)
      .style('fill', this.titleColor);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.8em')
      .attr('y', 20)
      .text(this.centerSubTitle)
      .style('fill', '#90969c');
  }
}

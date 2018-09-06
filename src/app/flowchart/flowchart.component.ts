import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';


@Component({
    selector: 'app-flow-chart',
    templateUrl: './flowchart.component.html',
    styleUrls: ['./flowchart.component.scss']
})

export class FlowChartComponent implements OnInit, OnChanges {
    @Input('height') height: number;
    @Input('width') width: number;
    @Input('data') data: any;
    margin: {top, left, right, bottom};
    nodeSize: {width, height};
    tree: any;
    svg: any;
    root: any;
    firstUpdate: boolean;
    iconArrow = 'M13.9861598,6.28424593 C13.9554414,6.24231747 13.9219568,6.20246359 13.8859246,6.16501186 L8.06252669,' +
        '0.341613987 C7.60793769,-0.113520953 6.87051354,-0.113921311 6.41545139,0.340667685 C6.41516022,0.340958855 6.41483266,' +
        '0.341286421 6.41454149,0.341577591 L0.591143617,6.16497546 C0.136954979,6.62043797 0.137974074,7.35786212 0.59343658,' +
        '7.81208715 C0.629286873,7.84782826 0.667430129,7.88120361 0.707611574,7.91199482 C1.19462962,8.23850546 1.84594027,' +
        '8.16724163 2.25081201,7.74311629 L5.47697443,4.52860066 C5.64803674,4.35772033 5.79147431,4.16125344 5.90208248,' +
        '3.94626087 L6.05931422,3.596857 L6.05931422,15.0340104 C6.0372217,15.6289797 6.45283033,16.1509745 7.03764506,' +
        '16.2627474 C7.67257741,16.3657123 8.27078596,15.9344897 8.37375091,15.299521 C8.38456059,15.2329159 8.38954688,' +
        '15.16551 8.38867337,15.0980678 L8.38867337,3.61432719 L8.50514132,3.8647333 C8.62099054,4.10949799 8.77865904,' +
        '4.33217017 8.97101315,4.52277726 L12.1913522,7.74311629 C12.5962239,8.16724163 13.2475346,8.23850546 13.7345526,' +
        '7.91199482 C14.2535266,7.53198172 14.3661729,6.80321987 13.9861598,6.28424593 Z';
    private idCount = 0;

    constructor(private element: ElementRef) {
        this.margin = {top: 40, right: 40, bottom: 40, left: 40};
    }

    ngOnInit() {
        this.width -= this.margin.right + this.margin.left;
        this.height -= this.margin.top + this.margin.bottom;
    }

    ngOnChanges(change: SimpleChanges) {
        this.firstUpdate = true;
        this.drawCanvas();
        this.tree = d3.tree()
            .size([this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom]);
        this.nodeSize = {width: this.width / 25, height: this.width / 50};
        this.tree.nodeSize([this.nodeSize.width + 60, this.nodeSize.height + 200]);
        if (change.data && this.data) {
            this.idCount = 0;
            this.data = this.updateId(this.data);
            this.root = d3.hierarchy(this.data)
                .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
            this.updateChart(this.root);
        }
    }

    updateId(data) {
        if (_.isArray(data) && data.length > 0) {
            return _.map(data, value => this.updateId(value));
        } else if (data.children && !_.isEmpty(data.children)) {
            return _.merge(_.omit(data, 'children'), {id: this.idCount++, children: _.map(data.children, value => this.updateId(value))});
        } else {
            return _.merge(data, {id: this.idCount++});
        }
    }

    drawCanvas() {
        const svgCheck = this.element.nativeElement.querySelector('svg');
        // console.log('SVG Exist?', svgCheck);
        if (!svgCheck) {
            this.svg = d3.select(this.element.nativeElement)
                .append('svg')
                .attr('width', this.width + this.margin.right + this.margin.left)
                .attr('height', this.height + this.margin.top + this.margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + (this.width + this.margin.left + this.margin.right) / 2 + ',' + this.margin.top + ')');
        } else {
            this.svg.selectAll('*').remove();
        }

        const svgFilter = this.svg.append('filter')
            .attr('id', 'glow')
            .attr('width', '200%')
            .attr('height', '200%')
            .attr('y', '-50%')
            .attr('x', '-50%');

        svgFilter
            .append('feGaussianBlur')
            .attr('stdDeviation', '5')
            .attr('result', 'coloredBlur')
            .append('animate')
            .attr('attributeName', 'stdDeviation')
            .attr('attributeType', 'XML')
            .attr('begin', '0s')
            .attr('dur', '1s')
            .attr('repeatCount', 'indefinite')
            .attr('values', '0;10;0');
        /*
         svgFilter.append('feColorMatrix')
         .attr('type', 'hueRotate')
         .attr('values', '180')
         .attr('in', 'SourceGraphic')
         .attr('result', 'rectHue');
         */
        const svgFilterMerge = svgFilter.append('feMerge');
        svgFilterMerge.append('feMergeNode')
            .attr('in', 'coloredBlur');
        svgFilterMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');
        svgFilterMerge.append('feMergeNode')
            .attr('in', 'rectHue');
    }

    updateChart(rootNode: any) {
        const nodes = this.root.descendants();
        const links = this.tree(this.root).links();

        if (this.firstUpdate) {
            nodes.forEach(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
            this.firstUpdate = false;
        }

        const node = this.svg.selectAll('.node')
            .data(nodes, d => d.data.id);

        const nodeEnter = node.enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', () => 'translate(' +
                String(rootNode.x0 + this.nodeSize.width / 2) + ',' +
                String(rootNode.y0 + this.nodeSize.height / 2) + ') scale(0)')
            .attr('opacity', 0)
            .on('click', this.onClick.bind(this));

        nodeEnter.append('rect')
            .attr('width', d => d.data.partsReplaced !== 0 ? this.nodeSize.width + 50 : this.nodeSize.width)
            .attr('height', d => d.data.partsReplaced !== 0 ? this.nodeSize.height + 20 : this.nodeSize.height)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('y', -5)
            .attr('fill', d => d.data.fillColor ? d.data.fillColor : '#fff')
            .attr('style', 'stroke: #ccc; stroke-width: 1;')
            .attr('class', d => d.data.attention ? 'attention' : '');

        nodeEnter.append('foreignObject')
            .attr('class', 'node-title')
            .attr('y', this.nodeSize.height / 15)
            .attr('x', 0)
            .attr('width', d => d.data.partsReplaced !== 0 ? this.nodeSize.width + 50 : this.nodeSize.width)
            .attr('style', 'text-align: center;')
            .text(d => d.data.name)
            .attr('fill', d => d.data.color ? d.data.color : '#555')
            .attr('color', d => d.data.color ? d.data.color : '#555')
            .attr('font-size', this.nodeSize.width / 10);

        nodeEnter.append('foreignObject')
            .attr('class', 'node-text')
            .attr('y', this.nodeSize.height / 3)
            .attr('x', this.nodeSize.width * 0.2)
            .attr('width', d => d.data.partsReplaced !== 0 ? this.nodeSize.width : this.nodeSize.width * 0.6)
            .attr('style', d => d.data.name.length > 20 ? 'text-align: center;padding-top: 15px' : 'text-align: center;')
            .text(d => d.data.number !== 0 ? `${d.data.number} / ${_.round(d.data.percentage, 2)} % `
                + `${d.data.description ? d.data.description : ''}` : '')
            .attr('color', d => d.data.color ? d.data.color : '#555')
            .attr('font-size', this.nodeSize.width / 12);

        nodeEnter.append('foreignObject')
            .attr('class', 'node-desc')
            .attr('y', this.nodeSize.height / 1.7)
            .attr('x', this.nodeSize.width * 0.1)
            .attr('width', d => d.data.partsReplaced !== 0 ? this.nodeSize.width + 20 : this.nodeSize.width)
            .attr('style', d => d.data.name.length > 20 ? 'text-align: center;padding-top: 15px' : 'text-align: center;')
            .text(d => `${d.data.partsReplaced !== 0 ? d.data.partsReplaced + ' incidents w/parts replaced' : ''}`)
            .attr('color', d => d.data.color ? d.data.color : '#555')
            .attr('font-size', this.nodeSize.width / 10);


        nodeEnter.append('g')
            // .attr('fill', d => '#F57957')
            .attr('fill', d => d.data.diff < 0 ? '#7ED321' : '#F57957')
            .attr('transform', d => {
                let arrowIcon;
                let width;
                let height;
                if (d.data.partsReplaced !== 0) {
                    width = 1.2;
                    height = 2;
                } else {
                    width = 0.85;
                    height = 1.4;
                }
                if (d.data.diff < 0) {
                    arrowIcon = 'translate(' + String(width * this.nodeSize.width) +
                        ', ' + String(this.nodeSize.height / height) + ') scale(1, -1)';
                } else {
                    arrowIcon = 'translate(' + String(width * this.nodeSize.width) +
                        ', ' + String(this.nodeSize.height / height - this.nodeSize.height / 3.9) + ') scale(1, 1)';
                }
                return arrowIcon;
            })
            .append('path')
            .attr('d', d => d.data.diff !== 0 ? this.iconArrow : '')
            // .attr('d', this.iconArrow)
            .attr('transform', `scale(${this.nodeSize.height / 65})`);

        /*
         nodeEnter.append('g')
         .attr('transform', 'translate(' + String(0.82 * this.nodeSize.width) +
         ', ' + String(this.nodeSize.height / 1.4 - 13) + ') scale(0.8, 0.8)')
         .append('path')
         .attr('d', this.iconArrow);
         */

        node.transition()
            .duration(1000)
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('opacity', 1);

        nodeEnter.transition()
            .duration(1000)
            .attr('transform', d => 'translate(' + d.x + ',' + d.y + ') scale(1)')
            .attr('opacity', 1);

        node.exit()
            .transition()
            .duration(1000)
            .attr('transform', () => `translate(${String(rootNode.x + this.nodeSize.width / 2)},
            ${String(rootNode.y + this.nodeSize.height / 2)}) scale(0)`)
            .attr('opacity', 0)
            .remove();

        const link = this.svg.selectAll('.link')
            .data(links, d => d.target.data.id);

        const linkEnter = link.enter()
            .insert('path', 'g')
            .attr('class', 'link')
            .attr('d', d3.linkVertical()
                .x(() => rootNode.x0 + this.nodeSize.width / 2)
                .y(() => rootNode.y0 + this.nodeSize.height / 2))
            .attr('opacity', 0);

        link.transition()
            .duration(1000)
            .attr('d', d3.linkVertical()
                .x(d => d.x + this.nodeSize.width / 2)
                .y(d => d.y + this.nodeSize.height / 2))
            .attr('style', d => {
                const stroke = (d.target.data.percentage) / 100 < 0.1 ? 1 : ((d.target.data.percentage) / 100) * 10,
                    color = d.target.data.fillColor ? d.target.data.fillColor : '#bbb';
                return `stroke-width: ${stroke}; stroke: ${color}; fill: none;`;
            })
            .attr('opacity', 1);

        linkEnter.transition()
            .duration(1000)
            .attr('d', d3.linkVertical()
                .x(d => d.x + this.nodeSize.width / 2)
                .y(d => d.y + this.nodeSize.height / 2))
            .attr('style', d => {
                const stroke = (d.target.data.percentage) / 100 < 0.1 ? 1 : ((d.target.data.percentage) / 100) * 10,
                    color = d.target.data.fillColor ? d.target.data.fillColor : '#bbb';
                return `stroke-width: ${stroke}; stroke: ${color}; fill: none;`;
            })
            .attr('opacity', 1);
        // .attr('stroke-dasharray', '10, 5');

        link.exit().transition()
            .duration(1000)
            .attr('d', d3.linkVertical()
                .x(() => rootNode.x + this.nodeSize.width / 2)
                .y(() => rootNode.y + this.nodeSize.height / 2))
            .attr('opacity', 0)
            .remove();

        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    onClick(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        this.updateChart(d);
    }
}

import { Component, Input } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';

@Component({
    selector: 'app-bar-chart-header',
    templateUrl: './bar-chart-header.component.html',
    styleUrls: ['./bar-chart-header.component.scss']
})
export class BarChartHeaderComponent {
    @Input('selectedPeriod') selectedPeriod;
    @Input('kpiName') kpiName;
    public AppConfiguration = AppConfiguration;
    public Languages = Languages;

    constructor() { }
}

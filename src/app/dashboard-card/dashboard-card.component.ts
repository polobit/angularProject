import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
    selector: 'app-dashboard-card',
    templateUrl: './dashboard-card.component.html',
    styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent implements OnInit, OnChanges {
    @Input('link') link: string;
    @Input('isAlert') isAlert: boolean;
    @Input('isLoaded') isLoaded: boolean;
    @Input('title') title: string;
    @Input('lastUpdated') lastUpdated: string;
    @Input('kpiValue') kpiValue: string | number;
    @Input('kpiUnit') kpiUnit: string;
    @Input('kpiUnitType') kpiUnitType: string;
    @Input('previousAverage') previousAverage: number;
    @Input('previousAverageUnit') previousAverageUnit: string;
    @Input('percentageChange') percentageChange: number;
    @Input('previousDayDate') previousDayDate: string;
    @Input('alternativeColor') alternativeColor: string;
    @Input('alternativeAlertColor') alternativeAlertColor: string;


    public AppConfiguration = AppConfiguration;
    public Languages = Languages;
    public moment = moment;
    public isNumber = _.isNumber;
    public toNumber = _.toNumber;
    public round = _.round;
    public isGreen;
    public isGreenCircle;

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.isGreen = this.isGreenArrowCondition();
        this.isGreenCircle = this.isGreenCircleCondition();
    }

    ngOnChanges(change: SimpleChanges) {
        if (change.kpiValue) {
            if (typeof this.kpiValue === 'number') {
                switch (true) {
                    case (_.round(Math.abs(this.kpiValue), 2) < 1e2):
                        this.kpiValue = _.round(this.kpiValue, 2);
                        break;
                    case (_.round(Math.abs(this.kpiValue), 0) < 1e3):
                        this.kpiValue = _.round(this.kpiValue, 0);
                        break;
                    case (_.round(Math.abs(this.kpiValue) / 1e2, 0) < 1e3):
                        this.kpiValue = _.round(this.kpiValue / 1000, 0) + 'K';
                        break;
                    case (_.round(Math.abs(this.kpiValue) / 1e6, 0) < 1e3):
                        this.kpiValue = _.round(this.kpiValue / 1e6, 0) + 'M';
                        break;
                    default:
                        this.kpiValue = '>1B';
                }
            }
        }
    }

    @HostListener('mouseover')
    hoverElement() {
        const cardElementRef = this.elementRef.nativeElement.querySelector('.card');
        if (cardElementRef) {
            cardElementRef.style.boxShadow = this.isAlert && this.alternativeAlertColor ?
                `0 0 9px 2px ${this.alternativeAlertColor}` :
                !this.isAlert && this.alternativeColor ? `0 0 9px 2px ${this.alternativeColor}` : '';

            cardElementRef.style.borderColor = this.isAlert && this.alternativeAlertColor ?
                this.alternativeAlertColor :
                !this.isAlert && this.alternativeColor ? this.alternativeColor : '';
        }
    }

    @HostListener('mouseout')
    removeHoverElement() {
        const cardElementRef = this.elementRef.nativeElement.querySelector('.card');
        if (cardElementRef) {
            cardElementRef.style.boxShadow = '';
            cardElementRef.style.borderColor = '';
        }
    }

    isGreenArrowCondition() {
        return this.title.indexOf(Languages.get('kpi.serviceLevelAgreement', 'start')) !== -1
            || this.title.indexOf(Languages.get('kpi.slaAllZone')) !== -1
            || this.title.indexOf(Languages.get('kpi.firstTimeFix', 'start')) !== -1;
    }

    isGreenCircleCondition() {
        return this.title.indexOf(Languages.get('kpi.serviceLevelAgreement', 'start')) !== -1 && _.round(_.toNumber(this.kpiValue), 0) === 0
            || this.title.indexOf(Languages.get('kpi.slaAllZone')) !== -1 && this.kpiValue === 0
            || this.title.indexOf(Languages.get('kpi.firstTimeFix', 'start')) !== -1 && _.round(_.toNumber(this.kpiValue), 0) === 0
            || this.title.indexOf(Languages.get('kpi.averageNumberOfHoursOnSite', 'start')) !== -1
            && _.round(_.toNumber(this.kpiValue), 0) === 0;
    }
}

import { Component, HostListener, Input, TemplateRef, ViewChild, OnInit, OnChanges } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import { IOnsiteBarChartDetail, IOnsiteBarChartValue, IChartData, ICasesByHourChartValue } from '../app.interface';

@Component({
    selector: 'app-chart-detail',
    templateUrl: './chart-detail.component.html',
    styleUrls: ['./chart-detail.component.scss']
})
export class ChartDetailComponent implements OnInit, OnChanges {
    @Input('kpiName') kpiName;
    @Input('isHour') isHour;
    @Input('isCaseType') isCaseType;
    @Input('detailsByDate') detailsByDate: IOnsiteBarChartDetail;
    @Input('selectedDate') selectedDate;
    @Input('fromDate') fromDate;
    @Input('toDate') toDate;
    @Input('averageValue') averageValue;
    @Input('selectedBarValue') selectedBarValue;
    @Input('selectedTime') selectedTime;
    @Input('stackedData') stackedData: IOnsiteBarChartValue;
    @Input('allZoneData') allZoneData;
    @Input('selectedCase') selectedCase;
    @Input('selectedArea') selectedArea;
    @Input('selectedZone') selectedZone;
    @Input('selectedMachine') selectedMachine;
    @Input('selectedDay') selectedDay;
    @Input('kpiSubName') kpiSubName = '';
    @Input('aggregateValue') aggregateValue = 0;
    @Input('aggregateName') aggregateName = '';
    @Input('aggregateUnit') aggregateUnit = '';
    @Input('dispatchAverage') dispatchAverage;
    @Input('phoneFixAverage') phoneFixAverage;
    @Input('detailsType') detailsType: 'byDate' | 'stacked' | 'byMachine' = 'byDate';
    @Input('detailsForAllDay') detailsForAllDay;
    @Input('selectedHour') selectedHour = '';
    @Input('selectedSlaTime') selectedSlaTime = '';
    @Input('casePriority') casePriority = 'phonefix';
    @Input('aggregateValueColor') aggregateValueColor = AppConfiguration.global.colors.aggregateValueBad;
    @ViewChild('chartDetailList', { read: TemplateRef }) chartDetailList: TemplateRef<any>;

    public Languages = Languages;
    public AppConfiguration = AppConfiguration;
    public divider = ':';
    moment = moment;
    public round = _.round;
    public toNumber = _.toNumber;
    private dialogRef: MatDialogRef<any>;
    private isDialogClosed = true;

    constructor(public dialog: MatDialog) { }

    ngOnChanges() {
        this.aggregateValue = _.toNumber(this.aggregateValue);
        this.aggregateValue = this.aggregateValue ? this.aggregateValue : 0;
    }

    ngOnInit() {
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        const width = event && event.target ? event.target.innerWidth : window.innerWidth;
        if (width > AppConfiguration.global.resolution.tablet && this.dialogRef) {
            this.dialogRef.close();
            this.isDialogClosed = true;
        }
    }

    openDialog(): void {
        if (window.innerWidth <= AppConfiguration.global.resolution.tablet) {
            if (this.dialogRef) {
                this.dialogRef.close();
            }
            this.isDialogClosed = false;
            this.dialogRef = this.dialog.open(this.chartDetailList, {
                minWidth: '80vw',
                maxWidth: '90vw',
                maxHeight: '80vh',
                panelClass: 'chart-detail-dialog',
                role: 'dialog',
                ariaLabel: 'chart-detail-dialog',
            });
            this.dialogRef.beforeClose().subscribe(() => this.isDialogClosed = true);
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

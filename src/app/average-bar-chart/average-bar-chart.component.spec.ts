import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { AverageBarChartComponent } from '../average-bar-chart/average-bar-chart.component';
import { AverageBarChartService } from '../average-bar-chart/average-bar-chart.service';

import * as d3 from 'd3-selection';
import { FormsModule } from '@angular/forms';
import {
    MatChipsModule, MatExpansionModule, MatIconModule, MatInputModule, MatNativeDateModule, MatSelectModule, MatSidenavModule,
    MatToolbarModule, MatTooltipModule,
    MatMenu, MatDivider
} from '@angular/material';
import { AppComponent } from '../app.component';

import { ClientService } from '../services/client.service';

import { CommonService } from '../services/common.service';

describe('AverageBarChartComponent', () => {
    let component: AverageBarChartComponent;
    let fixture: ComponentFixture<AverageBarChartComponent>;
    const routerStub = {};
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterModule,
                FormsModule,
                MatToolbarModule,

                MatIconModule,
                MatInputModule,
                MatSelectModule,
                MatExpansionModule,

                MatTooltipModule,
                MatNativeDateModule,
                MatChipsModule,
                MatSidenavModule
            ],
            declarations: [
                AppComponent,
                AverageBarChartComponent
            ],
            providers: [{
                provide: Router,
                useValue: routerStub
            }, ClientService, CommonService, AverageBarChartService,
                    /*{
                     provide: Http,
                     deps: [MockBackend, BaseRequestOptions],
                     useFactory:
                     (defaultOptions: BaseRequestOptions,
                     backend: XHRBackend) => {
                     return new Http(backend, defaultOptions);
                     }
                     }*/]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AverageBarChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    fit('should create', () => {
        getTestBed().compileComponents().then(() => {
            expect(component).toBeTruthy();
        });
    });

    it('should have svg element', (() => {
        const element = d3.select('svg').node();
        expect(element).toBeDefined();
    }));

    it('should have x-axis and y-axis', (() => {
        const xAxiselement = d3.selectAll('.axis-x').nodes();
        const yAxiselement = d3.selectAll('.axis-y').nodes();
        expect(xAxiselement.length).toBe(1);
        expect(yAxiselement.length).toBe(1);
    }));

    it('should show tooltip on mouse hover', (() => {

        const rectElements = d3.select('svg').selectAll('rect').nodes();
        rectElements.forEach((rect: SVGTextElement) => {
            rect.dispatchEvent(new Event('mouseover'));
        });
        expect(d3.select('#toolTip').classed('displayNone')).toBe(false);
    }));

    it('should hide tooltip on mouse-out', (() => {

        const rectElements = d3.select('svg').selectAll('rect').nodes();
        rectElements.forEach((rect: SVGTextElement) => {
            rect.dispatchEvent(new Event('mouseout'));
        });
        expect(d3.select('#toolTip').classed('displayNone')).toBe(true);
    }));


    it('should be created', function () {
        expect(getSvg()).not.toBeNull();
    });

    it('should have the correct height', function () {
        expect(getSvg().attr('height')).toBe('500');
    });

    it('should have the correct width', function () {
        expect(getSvg().attr('width')).toBe('500');
    });


    function getSvg() {
        return d3.select('svg');
    }

});




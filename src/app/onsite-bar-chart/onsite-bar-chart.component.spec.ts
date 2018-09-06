// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterModule, Router } from '@angular/router';
// import { By } from '@angular/platform-browser';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { Component, OnInit, ViewChild, Inject } from '@angular/core';
// import { DOCUMENT } from '@angular/platform-browser';
// import { OnsiteBarChartComponent } from './onsite-bar-chart.component';

// import * as d3 from 'd3-selection';
// import * as d3Scale from 'd3-scale';
// import * as d3Array from 'd3-array';
// import * as d3Axis from 'd3-axis';
// import * as moment from 'moment';
// import {
//   MatToolbarModule,
//   MatIconModule,
//   MatInputModule,
//   MatSelectModule,
//   MatTooltipModule,
//   MatNativeDateModule,
//   MatChipsModule
// } from '@angular/material';
// import { AppComponent } from '../app.component';
// import { AppRoutingModule } from '../app-routing/app-routing.module';

// import { ClientService } from '../services/client.service';

// import { CommonService } from '../common/common.service';
// describe('AverageBarChartComponent', () => {
//   let component: OnsiteBarChartComponent;
//   let fixture: ComponentFixture<OnsiteBarChartComponent>;
//   let routerStub;
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ AppComponent,
//         OnsiteBarChartComponent,
//          ],
//       providers: [{ provide: Router, useValue: routerStub },ClientService, CommonService]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(OnsiteBarChartComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//   //creation of bar chart
//   describe('Test D3.js Donut Chart with jasmine', function() {
//     var c;
//     beforeEach(function() {
//       c =  this.drawBars();
//       c.render();
//     });
//     afterEach(function() {
//       d3.selectAll('svg').remove();
//     });
//     describe('the donut chart' ,function() {
//       it('should be created', function() {
//         expect(getSvg()).not.toBeNull();
//       });
//       it('should have the correct height', function() {
//         expect(getSvg().attr('height')).toBe('500');
//       });
//       it('should have the correct width', function() {
//         expect(getSvg().attr('width')).toBe('500');
//       });
//     });
//     function getSvg() {
//       return d3.select('svg');
//     }
//   });
//   // assert that the x and y axis have been created
//   describe('test Axis creation', function() {
//       it('should create a xAxis', function() {
//            var axis = getXAxis();
//            expect(axis.length).toBe(1);
//       });
//       it('should create a yAxis', function() {
//          var axis = getYAxis();
//          expect(axis.length).toBe(1);
//       });
//   });
//   // add axis helpers...
//   function getXAxis() {
//       return d3.selectAll('g.x.axis')[0];
//   }
//   function getYAxis() {
//       return d3.selectAll('g.y.axis')[0];
//   }
// });



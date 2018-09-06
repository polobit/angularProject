import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasesByHourChartComponent } from './cases-by-hour-chart.component';

describe('CasesByHourChartComponent', () => {
  let component: CasesByHourChartComponent;
  let fixture: ComponentFixture<CasesByHourChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasesByHourChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasesByHourChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

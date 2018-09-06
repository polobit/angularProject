import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasesByAreaBarChartComponent } from './cases-by-area-bar-chart.component';

describe('CasesByAreaBarChartComponent', () => {
  let component: CasesByAreaBarChartComponent;
  let fixture: ComponentFixture<CasesByAreaBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasesByAreaBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasesByAreaBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

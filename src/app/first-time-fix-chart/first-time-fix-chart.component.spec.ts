import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstTimeFixChartComponent } from './first-time-fix-chart.component';

describe('FirstTimeFixChartComponent', () => {
  let component: FirstTimeFixChartComponent;
  let fixture: ComponentFixture<FirstTimeFixChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstTimeFixChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstTimeFixChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

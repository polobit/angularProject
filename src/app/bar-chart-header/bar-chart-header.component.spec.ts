import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartHeaderComponent } from './bar-chart-header.component';

describe('BarChartHeaderComponent', () => {
  let component: BarChartHeaderComponent;
  let fixture: ComponentFixture<BarChartHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarChartHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

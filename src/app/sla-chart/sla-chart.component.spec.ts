import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaChartComponent } from './sla-chart.component';

describe('SlaChartComponent', () => {
  let component: SlaChartComponent;
  let fixture: ComponentFixture<SlaChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlaChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlaChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

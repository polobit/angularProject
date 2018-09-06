import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighFrequencyStoresChartComponent } from './high-frequency-stores-chart.component';

describe('HighFrequencyStoresChartComponent', () => {
  let component: HighFrequencyStoresChartComponent;
  let fixture: ComponentFixture<HighFrequencyStoresChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighFrequencyStoresChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighFrequencyStoresChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

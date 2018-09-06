import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardKpiComponent } from './dashboard-kpi.component';

describe('DashboardKpiComponent', () => {
  let component: DashboardKpiComponent;
  let fixture: ComponentFixture<DashboardKpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardKpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

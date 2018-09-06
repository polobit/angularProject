import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExperienceReportComponent } from './user-experience-report.component';

describe('UserExperienceReportComponent', () => {
  let component: UserExperienceReportComponent;
  let fixture: ComponentFixture<UserExperienceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserExperienceReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserExperienceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

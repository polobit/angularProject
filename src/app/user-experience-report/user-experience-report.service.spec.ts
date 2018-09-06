import { TestBed, inject } from '@angular/core/testing';

import { UserExperienceReportService } from './user-experience-report.service';

describe('UserExperienceReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserExperienceReportService]
    });
  });

  it('should be created', inject([UserExperienceReportService], (service: UserExperienceReportService) => {
    expect(service).toBeTruthy();
  }));
});

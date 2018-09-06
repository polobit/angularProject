import { TestBed, inject } from '@angular/core/testing';

import { CaseHistoryService } from './case-history.service';

describe('CaseHistoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CaseHistoryService]
    });
  });

  it('should be created', inject([CaseHistoryService], (service: CaseHistoryService) => {
    expect(service).toBeTruthy();
  }));
});

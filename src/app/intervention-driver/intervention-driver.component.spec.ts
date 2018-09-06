import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionDriverComponent } from './intervention-driver.component';

describe('InterventionDriverComponent', () => {
  let component: InterventionDriverComponent;
  let fixture: ComponentFixture<InterventionDriverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterventionDriverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterventionDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

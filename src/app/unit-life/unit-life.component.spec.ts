import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitLifeComponent } from './unit-life.component';

describe('UnitLifeComponent', () => {
  let component: UnitLifeComponent;
  let fixture: ComponentFixture<UnitLifeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitLifeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitLifeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

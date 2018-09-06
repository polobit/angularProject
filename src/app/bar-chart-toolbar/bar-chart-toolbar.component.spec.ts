import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartToolbarComponent } from './bar-chart-toolbar.component';

describe('BarChartToolbarComponent', () => {
    let component: BarChartToolbarComponent;
    let fixture: ComponentFixture<BarChartToolbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                declarations: [BarChartToolbarComponent]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BarChartToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

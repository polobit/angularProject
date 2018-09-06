import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlowChartComponent } from './flowchart.component';

describe('FlowChartComponent', () => {
    let component: FlowChartComponent;
    let fixture: ComponentFixture<FlowChartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                declarations: [FlowChartComponent]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FlowChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
});
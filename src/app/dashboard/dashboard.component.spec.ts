import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import 'rxjs/add/observable/of';
import { DashboardComponent } from './dashboard.component';

// let serverUrl='http://40.69.168.172:8079/api/';
const timeSpentOnSiteData = {
    'reportHeading': 'Average number of hours spend onsite',
    'lastUpdated': 'Wed Nov 15 00:09:00 IST 2017',
    'currentAverage': '2.38',
    'currentAverageUnit': 'hours',
    'previousDayAverage': '2.28',
    'previousDayDate': 'Tue Nov 14 00:09:00 IST 2017',
    'averageAboveTarget': '13',
    'previousDayAveragePercent': '4.3'
};
// class mockService {
//   public fetchDataFromJson(): Observable<any> {
//     return Observable.of(timeSpentOnSiteData);
//   }
// }

// class mockCommonService {
//   getAverageTimeSpentOnSite() {
//     return Observable.create((observer) => {
//       observer.next();
//     });
//   }
// }

fdescribe('AlertTabComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    // let se= new mockService();
    // const comp;
    // const dataStub;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
                declarations: [DashboardComponent]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    xit('getAverageTimeSpentOnSite test', () => {
        // const subscribe = jasmine.createSpy('subscribe').and.callFake((fn, errfn) => {
        //   fn();
        // })
        //     //  comp.getAverageTimeSpentOnSite()
        //     const spy = spyOn(dataStub, 'getAverageTimeSpentOnSite').and.returnValue(
        //       Observable.of(timeSpentOnSiteData)
        //     );
        //     expect(spy.calls.any()).toEqual(true);
        //     // spyOn(comp, 'getAverageTimeSpentOnSite');

        // expect(comp.getAverageTimeSpentOnSite).toBeDefined();
    });
});

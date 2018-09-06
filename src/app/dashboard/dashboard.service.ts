import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import { IAverageHoursCard, IOnsiteTimeSpentCard, IFirstTimeFixCard } from '../app.interface';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DashboardService {

    constructor(private commonService: CommonService) {
    }

    getAverageHoursCardService(selectedCustomerList, selectedModelList): Observable<IAverageHoursCard> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const url = `${CommonService.serverUrl}/averagehoursspentonsite/notificationcard/customer`
            + `?name=${customerList}&model=${selectedModelList}`;
        return this.commonService.get(url)
            .catch(err => this.commonService.handleError(err));
    }

    getOnSiteTimeSpentCardService(selectedCustomerList, selectedModelList): Observable<IOnsiteTimeSpentCard> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const url = `${CommonService.serverUrl}/casesbyonsitehours/notificationcard/customer`
            + `?name=${customerList}&model=${selectedModelList}`;
        return this.commonService.get(url)
            .map((data: IOnsiteTimeSpentCard[] | IOnsiteTimeSpentCard) => Array.isArray(data) ? data[0] : data)
            .catch(err => this.commonService.handleError(err));
    }

    getCasesByAreaCardService(selectedCustomerList, selectedArea, selectedModelList): Observable<IAverageHoursCard> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const url = `${CommonService.serverUrl}/casesbyarea/notificationcard/customer`
            + `?name=${customerList}&model=${selectedModelList}&area=${selectedArea}`;
        return this.commonService.get(url)
            .map((data: IAverageHoursCard[] | IAverageHoursCard) => Array.isArray(data) ? data[0] : data)
            .catch(err => this.commonService.handleError(err));
    }

    getHighFrequencyStoresCardService(selectedCustomerList, selectedModelList, selectedArea?): Observable<any> {
        selectedArea = 'ALL';
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const url = `${CommonService.serverUrl}/highfrequencydispatchstores/notificationcard/casesbyarea`
            + `?name=${customerList}&model=${selectedModelList}&area=${selectedArea}`;
        return this.commonService.get(url)
            .map((data) => Array.isArray(data) ? data[0] : data)
            .catch(err => this.commonService.handleError(err));
    }

    getCasesByHourCardService(selectedCustomerList, selectedModelList): Observable<IOnsiteTimeSpentCard> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const url = `${CommonService.serverUrl}`
            + `/casedata/casedetails/casesbyhours/notificationcard?name=${customerList}&model=${selectedModelList}`;

        return this.commonService.get(url)
            .catch(err => this.commonService.handleError(err));
    }

    getCasesBySLACardService(selectedCustomerList, selectedZone, selectedModelList): Observable<IAverageHoursCard> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const url = `${CommonService.serverUrl}/servicelevelagreement/notificationcard/customer`
            + `?name=${customerList}&model=${selectedModelList}&zone=${selectedZone}`;
        return this.commonService.get(url)
            .map((data: IAverageHoursCard[] | IAverageHoursCard) => Array.isArray(data) ? data[0] : data)
            .catch(err => this.commonService.handleError(err));
    }

    getFirstTimeFixService(selectedCustomerList, selectedModelList): Observable<IFirstTimeFixCard> {
        const customerList = this.commonService.customerListInterceptor(selectedCustomerList);
        const url = `${CommonService.serverUrl}/first-time-fix/card/info`
            + `?name=${customerList}&model=${selectedModelList}&caseType=ALL`;
        return this.commonService.get(url)
            .catch(err => this.commonService.handleError(err));
    }
}

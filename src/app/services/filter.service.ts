import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { IFilter, ISelectedFIlter } from '../app.interface';
import { AppConfiguration } from '../app.configuration';

@Injectable()
export class FilterService {
    public selectedFilter = new BehaviorSubject<IFilter>(AppConfiguration.global.filter.defaultFiler);
    public selectedFilterOption = new BehaviorSubject<ISelectedFIlter>({ value: '', filterType: '' });
    public clearAll = new BehaviorSubject<boolean>(false);
    public accessCheck =  new BehaviorSubject<boolean>(false);

    constructor() {
    }

    getSelectedFilter() {
        return this.selectedFilter.asObservable();
    }

    getSelectedOption() {
        return this.selectedFilterOption.asObservable();
    }

    publishFilterData(customer, model, period?: string): void {
        this.selectedFilter.next({ customer: customer, model: model, period: period });
    }

    publishSelectedOption(value, filterType): void {
        this.selectedFilterOption.next({ value: value, filterType: filterType });
    }

    triggerClearAll(value): void {
        this.clearAll.next(value);
    }
}

import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import { FilterService } from '../services/filter.service';
import { ISelectedFIlter } from '../app.interface';
import { Languages, AppConfiguration } from '../app.configuration';
import { NavigationEnd, Router } from '@angular/router';

@Component({
    selector: 'app-bar-chart-toolbar',
    templateUrl: './bar-chart-toolbar.component.html',
    styleUrls: ['./bar-chart-toolbar.component.scss']
})
export class BarChartToolbarComponent implements OnInit, OnChanges, OnDestroy {
    @Input('customerChips') customerChips: { removable: boolean, text: string }[];
    @Input('modelChips') modelChips: { removable: boolean, text: string }[];
    @Input('periodChips') periodChips: object;
    @Input('isBack') isBack = true;
    @Input('showPeriod') showPeriod = true;
    public selectedFilterOption: ISelectedFIlter;
    public Languages = Languages;
    public chipsLimit = 1;
    public countLimit = 0;
    public currentRoute;
    public isPeriodEnabled = false;
    public isFilterEnabled = true;
    private filterSubscription: Subscription;
    constructor(private filterService: FilterService, private router: Router) {
        this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
            this.customerChips = [];
            this.modelChips = [];
            this.periodChips = {};
            updatedFilter.customer.forEach(element => {
                this.customerChips.push({
                    removable: element !== 'ALL',
                    text: element
                });
            });

            updatedFilter.model.forEach(element => {
                this.modelChips.push({
                    removable: element !== 'ALL',
                    text: element
                });
            });

            this.periodChips = {
                removable: updatedFilter.period !== 'pastthirtydays',
                text: updatedFilter.period
            };
        });

        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentRoute = {
                    full: router.url,
                    base: `/${router.url.split('/')[1]}`
                };
                AppConfiguration.global.filter.disablePeriodsOnRoutes.indexOf(this.currentRoute.base) === -1 ?
                    this.isPeriodEnabled = true : this.isPeriodEnabled = false;
                AppConfiguration.global.filter.disableFilterOnRoutes.indexOf(this.currentRoute.base) === -1 ?
                    this.isFilterEnabled = true : this.isFilterEnabled = false;
            }
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.filterSubscription.unsubscribe();
    }

    ngOnChanges() {
        if (this.showPeriod === true) {
            this.isPeriodEnabled = true;
        }
    }
    onChipRemoved(index, value, filterType) {
        if (filterType === 'customer') {
            this.customerChips.splice(index, 1);
        } else if (filterType === 'model') {
            this.modelChips.splice(index, 1);
        } else if (filterType === 'period') {
            this.periodChips = {
                removable: false,
                text: 'pastthirtydays'
            };
        }
        this.filterService.publishSelectedOption(value, filterType);
    }

    clearAllFilter() {
        this.filterService.publishFilterData(['ALL'], ['ALL'], 'pastthirtydays');
        this.filterService.triggerClearAll(true);
    }

}

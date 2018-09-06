import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ClientService } from './services/client.service';
import { FilterService } from './services/filter.service';
import { UserProfileService } from './user-profile/user-profile.service';
import { ICustomerList, IModelList, IFilter, INotificationList, INotifiedUserInfo } from './app.interface';
import { AppConfiguration, Languages } from './app.configuration';
import * as d3 from 'd3';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { NgStyle } from '@angular/common';
import { AuthService } from '../app/auth/auth.service';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatSidenav } from '@angular/material/sidenav';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
    @Output() menuChange = new EventEmitter<any>();
    @Output() change = new EventEmitter<any>();
    @ViewChild('filterNav') filterNav: MatSidenav;
    data: any;
    threshold = 10;
    customerList: ICustomerList[];
    modelList: IModelList[];
    notificationList: INotificationList[];
    notifiedUser: INotifiedUserInfo[];
    selectedCustomerList = [];
    selectedModelList = [];
    isLoggedIn = true;
    // TODO: For multiple customer selection: selectedCustomers: string[] = [];
    sideNavMode = 'side';
    expandedFilterOption = 'customers';
    public isPeriodEnabled = true;
    public isFilterEnabled = true;
    sideNavOpen = false;
    public hideToolbar = false;
    public homeToolbar = false;
    public filterSection: boolean;
    public notifySection: boolean;
    public currentRoute;
    public userType: string;
    public Languages = Languages;
    public AppConfiguration = AppConfiguration;
    public currentFilters: IFilter;
    public selectedFilters: IFilter;
    public isAllCustomerChecked = true;
    public isAllModelChecked = true;
    public notificationCount: number;
    public isLogin = false;
    public menuList: any = [];
    private filterSubscription: Subscription;
    private initCalls: any;

    constructor(private router: Router,
        private clientService: ClientService,
        private filterService: FilterService,
        public el: ElementRef,
        public userProfileService: UserProfileService,
        public authService: AuthService,
        public dialog: MatDialog) {
        if (this.authService.isAuthenticated()) {
            this.isLogin = true;
        }
        this.authService.loggedIn$
        .subscribe(e => {
            if ( e) {
                this.clientService.setUserPermission()
                .subscribe(userp => {
                    this.menuList = [];
                    AppConfiguration.global.menu
                    .forEach( item => {
                        if (userp.userType !== 'super-admin') {
                            if ((userp.userType === 'customer-admin') || (userp.userType === 'customer')) {
                                 if ((! (item.item === 'alert') ) && (! (item.item === 'userExperience'))) {
                                    this.menuList.push(item);
                                }
                            } else {
                                if (! (item.item === 'alert') ) {
                                 this.menuList.push(item);
                            }
                         }
                        } else {
                            this.menuList.push(item);
                        }
                    });
                });
            }
        });
        moment.locale(AppConfiguration.global.locale);
        this.currentRoute = {
            full: router.url,
            base: router.url.split('/')[1]
        };
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.filterNav.close();
                this.currentRoute = {
                    full: router.url,
                    base: `/${router.url.split('/')[1]}`
                };

                AppConfiguration.global.filter.disablePeriodsOnRoutes.indexOf(this.currentRoute.base) === -1 ?
                    this.isPeriodEnabled = true : this.isPeriodEnabled = false;
                AppConfiguration.global.filter.disableFilterOnRoutes.indexOf(this.currentRoute.base) === -1 ?
                    this.isFilterEnabled = true : this.isFilterEnabled = false;
                if (this.currentRoute.base === '/register' || this.currentRoute.base === '/password') {
                    this.hideToolbar = true;
                    this.homeToolbar = false;
                } else if (this.currentRoute.base === '/home' || this.currentRoute.base === '/login' || this.currentRoute.base === '/') {
                    this.hideToolbar = true;
                    this.homeToolbar = true;
                } else {
                    this.hideToolbar = false;
                    this.homeToolbar = false;
                }
                if (this.currentRoute.base !== '/unit-life') {
                    this.isPeriodEnabled = true;
                }
                if (this.authService.isAuthenticated()) {
                    this.isLogin = true;
                }
            }
        });
    }

    ngOnInit() {
        const width = window.innerWidth || AppConfiguration.global.resolution.tablet;
        this.sideNavMode = width <= AppConfiguration.global.resolution.desktop ? 'over' : 'side';
        this.sideNavOpen = width > AppConfiguration.global.resolution.desktop;
        this.initCalls = setTimeout(() => {
            this.getFilterData();
            this.getUserType();
        }, 0);

        this.filterService.getSelectedOption().subscribe(response => {
            if (response.filterType === 'customer') {
                if (_.findIndex(this.selectedCustomerList, (value) => value === response.value) !== -1) {
                    this.selectedCustomerList.splice(_.findIndex(this.selectedCustomerList, (value) => value === response.value), 1);
                    if (_.isEmpty(this.selectedCustomerList)) {
                        this.getSelectedCustomer('ALL', true);
                    }
                    this.applyFilter();
                }
            } else if (response.filterType === 'model') {
                if (_.findIndex(this.selectedModelList, (value) => value === response.value) !== -1) {
                    this.selectedModelList.splice(_.findIndex(this.selectedModelList, (value) => value === response.value), 1);
                    if (_.isEmpty(this.selectedModelList)) {
                        this.getSelectedModel('ALL', true);
                    }
                    this.applyFilter();
                }
            } else if (response.filterType === 'period') {
                this.selectedFilters.period = 'pastthirtydays';
                this.applyFilter();
            }
        });

        this.filterService.clearAll.subscribe(isEnabled => {
            if (isEnabled) {
                this.getSelectedCustomer('ALL', true);
                this.getSelectedModel('ALL', true);
                this.filterService.triggerClearAll(false);
            }
        });
    }

    ngOnDestroy() {
        this.filterSubscription.unsubscribe();
        this.initCalls.clearTimeout();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        const width = event && event.target ? event.target.innerWidth : window.innerWidth;
        this.sideNavMode = width <= AppConfiguration.global.resolution.desktop ? 'over' : 'side';
    }

    login(event) {
        event.preventDefault();
        this.isLoggedIn = true;
    }

    applyFilter() {
        this.currentFilters = _.clone(this.selectedFilters);
        const customerList = this.selectedCustomerList.length <= 0 || this.selectedCustomerList.length === this.customerList.length
            ? ['ALL'] : this.selectedCustomerList;
        const modelList = this.selectedModelList.length <= 0 || this.selectedModelList.length === this.modelList.length
            ? ['ALL'] : this.selectedModelList;
        this.filterService.publishFilterData(customerList,
            modelList, this.selectedFilters.period);
    }

    cancelFilter() {
        this.selectedFilters = _.clone(this.currentFilters);
    }

    openSideNav(navType) {
        if (this.currentFilters.customer[0] === 'ALL') {
            this.selectedCustomerList = [];
            this.isAllCustomerChecked = true;
            this.customerList.forEach(element => {
                this.selectedCustomerList.push(element.customerName);
            });
        } else {
            this.isAllCustomerChecked = false;
            this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
                this.selectedCustomerList = _.clone(updatedFilter.customer);
                this.selectedFilters.period = updatedFilter.period;
            });
        }

        if (this.currentFilters.model[0] === 'ALL') {
            this.selectedModelList = [];
            this.isAllModelChecked = true;
            this.modelList.forEach(element => {
                this.selectedModelList.push(element.model);
            });
        } else {
            this.isAllModelChecked = false;
            this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
                this.selectedModelList = _.clone(updatedFilter.model);
                this.selectedFilters.period = updatedFilter.period;
            });
        }

        if (navType === 'filter') {
            this.filterSection = true;
            this.notifySection = false;
        } else {
            this.notifySection = true;
            this.filterSection = false;
        }
    }

    getFilterData() {
        if (sessionStorage.getItem('access_token') !== null) {
            this.clientService.getCustomerList()
                .subscribe((customerList: ICustomerList[]) => {
                    this.customerList = _.sortBy(customerList, o => o.customerName);
                    // (customerList.length === 0) ? this.clientService.getCustomersSync() :
                    this.customerList.forEach(element => {
                        this.selectedCustomerList.push(element.customerName);
                    });
                });
            this.clientService.getModelList()
                .subscribe((modelList: IModelList[]) => {
                    this.modelList = _.sortBy(modelList, o => o.model);
                    this.modelList.forEach(element => {
                        this.selectedModelList.push(element.model);
                    });
                });
            this.clientService.getNotifications()
                .subscribe((notificationList: INotificationList[]) => {
                    this.notificationList = notificationList;
                    this.notificationCount = this.notificationList && this.notificationList.length || 0;
                });
            this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
                this.currentFilters = _.clone(updatedFilter);
                this.selectedFilters = _.clone(updatedFilter);
            });
        }
    }

    getUserType() {
        if (sessionStorage.getItem('access_token') !== null) {
            this.userProfileService.getUserInfoService().subscribe(
                data => {
                    this.data = data;
                    this.userType = data.userType;
                });
        }
    }

    updateNotificationFlag(data) {
        data.status = true;
        this.clientService.updateNotificationService(data)
            .subscribe((response) => {
                this.notificationCount = this.notificationList && this.notificationList.length - 1 || this.notificationCount - 1;
                return response;
            });
    }

    setStyles(data) {
        const styles = {
            'color': this.updateNotificationFlag(data) ? 'red' : 'black',
            'font-size': this.updateNotificationFlag(data) ? '3em' : '2em',
            'font-style': this.updateNotificationFlag(data) ? 'italic' : 'normal',
        };
        return styles;
    }

    isCustomerAvailable(value) {
        return this.selectedCustomerList ? _.includes(this.selectedCustomerList, value) : false;
    }

    isModelAvailable(value) {
        return this.selectedModelList ? _.includes(this.selectedModelList, value) : false;
    }

    getSelectedCustomer(customer, checked) {
        if (checked) {
            if (customer === 'ALL') {
                this.isAllCustomerChecked = true;
                this.selectedCustomerList = [];
                this.customerList.forEach(element => {
                    this.selectedCustomerList.push(element.customerName);
                });
            } else {
                this.selectedCustomerList.push(customer);
                this.isAllCustomerChecked = this.selectedCustomerList.length === this.customerList.length ? true : false;
            }
        } else {
            if (customer === 'ALL') {
                this.isAllCustomerChecked = false;
                this.selectedCustomerList = [];
            } else {
                this.isAllCustomerChecked = false;
            }
            this.selectedCustomerList.forEach((element, index) => {
                if (element === customer) {
                    this.selectedCustomerList.splice(index, 1);
                }
            });
        }
        return this.selectedCustomerList;
    }

    getSelectedModel(model, checked) {
        if (checked) {
            if (model === 'ALL') {
                this.isAllModelChecked = true;
                this.selectedModelList = [];
                this.modelList.forEach(element => {
                    this.selectedModelList.push(element.model);
                });
            } else {
                this.selectedModelList.push(model);
                this.isAllModelChecked = this.selectedModelList.length === this.modelList.length ? true : false;
            }
        } else {
            if (model === 'ALL') {
                this.isAllModelChecked = false;
                this.selectedModelList = [];
            } else {
                this.isAllModelChecked = false;
            }
            this.selectedModelList.forEach((element, index) => {
                if (element === model) {
                    this.selectedModelList.splice(index, 1);
                }
            });
        }
        return this.selectedModelList;
    }

    navigateToUserProfile(notificationId) {
        this.clientService.getNotificationInfo(notificationId)
            .subscribe((notifiedUser: INotifiedUserInfo[]) => {
                this.notifiedUser = notifiedUser;
                this.router.navigate(['/user', this.userType, this.notifiedUser['userId'], this.notifiedUser['permissionId']]);
            });
    }

    logout() {
        this.authService.logout();
    }

    changePassword() {
        const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
            width: '450px'
        });
        dialogRef.componentInstance.messageTitle = Languages.get('global.changePassword', 'capitalize');
        dialogRef.componentInstance.isCloseDialog = true;
    }

    signIn() {
        if (!this.isLogin) {
            this.authService.intiflow();
        }
    }

    goToGetAccess() {
        this.clientService.scrollToElement('accessSection');
    }
}

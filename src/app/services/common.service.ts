import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppConfiguration, Languages } from '../app.configuration';
import { ErrorMessageDialogComponent } from '../error-message/error-message.component';
import { MatDialog, MatDialogRef, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Headers, RequestOptions } from '@angular/http';
import * as _ from 'lodash';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';
import { AuthService } from '../auth/auth.service';
import { ICustomerList, IUserPermission, ICustomerPermission } from 'app/app.interface';

@Injectable()
export class CommonService {
    static readonly serverUrl = AppConfiguration.url;   // changes automatically based on environment
    // private static readonly headers = {'Content-Type': 'application/json'};
    headers = new Headers({ 'Content-Type': 'application/json' });
    httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    options = new RequestOptions({ headers: this.headers });
    private errorDialogRef: MatDialogRef<any>;
    private errorSnackBarRef: MatSnackBarRef<any>;
    private allCustomers = [];
    private userCustomers = [];

    constructor(private http: HttpClient, public auth: AuthService, public dialog: MatDialog, public snackBar: MatSnackBar) {
        this.getAllCustomersList()
            .subscribe((customers: ICustomerList[]) => {
                customers.forEach(each => {
                    this.allCustomers.push(each.customerName);
                });
            });

        this.getCustomerListForLoggedInUser()
            .subscribe((customers: ICustomerList[]) => {
                customers.forEach(each => {
                    let modifiedCustomer = each.customerName;
                    modifiedCustomer = modifiedCustomer.replace('/', '%2F');
                    modifiedCustomer = modifiedCustomer.replace('&', '%26');
                    this.userCustomers.push(modifiedCustomer);
                });
            });
    }

    static refresh() {
        location.reload();
    }

    get(url: string, options?: {}): Observable<any> {
        if (this.errorDialogRef) {
            this.errorDialogRef.close();
        }
        if (this.errorSnackBarRef) {
            this.errorSnackBarRef.dismiss();
        }
        return this.http.get(url, options || this.headers)
            // .retry(AppConfiguration.global.api.maxRetries)
            .map(data => _.isEmpty(data) ? undefined : data
            );
    }

    // @todo: add interfaces for HttpResponse of each body type in component based on service response
    getResponseWithHeader(url: string, options?: {}): Observable<HttpResponse<any>> {
        if (this.errorDialogRef) {
            this.errorDialogRef.close();
        }
        if (this.errorSnackBarRef) {
            this.errorSnackBarRef.dismiss();
        }
        return this.http.get<any>(url, { observe: 'response' })
            // .retry(AppConfiguration.global.api.maxRetries)
            .map((data) => {
                return _.isEmpty(data) ? undefined : data;
            });
    }

    post(url: string, body: any, options?: {}): Observable<any> {
        if (this.errorDialogRef) {
            this.errorDialogRef.close();
        }
        if (this.errorSnackBarRef) {
            this.errorSnackBarRef.dismiss();
        }
        return this.http.post(url, body, options || this.options);
        // .map(data => _.isEmpty(data) ? undefined : data);
    }

    postResponseWithHeader(url: string, body: any, options?: {}): Observable<HttpResponse<any>> {
        if (this.errorDialogRef) {
            this.errorDialogRef.close();
        }
        if (this.errorSnackBarRef) {
            this.errorSnackBarRef.dismiss();
        }
        return this.http.post<any>(url, body, { observe: 'response' });
            // .map(data => _.isEmpty(data) ? undefined : data);
    }

    put(url: string, body: any, options?: {}): Observable<any> {
        if (this.errorDialogRef) {
            this.errorDialogRef.close();
        }
        if (this.errorSnackBarRef) {
            this.errorSnackBarRef.dismiss();
        }
        return this.http.put(url, body, options || this.options)
            .map(data => _.isEmpty(data) ? undefined : data);
    }

    putResponseWithHeader(url: string, body: any, options?: {}): Observable<HttpResponse<any>> {
        if (this.errorDialogRef) {
            this.errorDialogRef.close();
        }
        if (this.errorSnackBarRef) {
            this.errorSnackBarRef.dismiss();
        }
        return this.http.put<any>(url, body, { observe: 'response' })
            .map(data => _.isEmpty(data) ? undefined : data);
    }

    delete(url: string, options?: {}): Observable<any> {
        if (this.errorDialogRef) {
            this.errorDialogRef.close();
        }
        if (this.errorSnackBarRef) {
            this.errorSnackBarRef.dismiss();
        }
        return this.http.delete(url, options || this.httpHeaders);
    }

    handleError(error: any) {
        const errMsg: string = error.message ? String(error.message) : error.toString();
        console.error(Languages.get('global.serverError', 'upper'), errMsg);
        // this.showErrorMessage(errMsg);
        return Observable.throw(errMsg);
    }

    showErrorMessage(errorMessage: string): void {
        switch (AppConfiguration.global.showServerErrorMessage) {
            case 'dialog':
                this.openDialog(errorMessage);
                break;
            case 'snackbar':
            default:
                this.openSnackBar();
                break;
        }
    }

    openSnackBar(): void {
        this.errorSnackBarRef = this.snackBar.open(Languages.get('global.problemLoadingData', 'start'),
            Languages.get('global.tryAgain', 'upper'));
        this.errorSnackBarRef.onAction().subscribe(() => {
            CommonService.refresh();
        });
    }

    openDialog(errorMessage: string): void {
        this.errorDialogRef = this.dialog.open(ErrorMessageDialogComponent, {
            maxWidth: '90vw',
            id: 'server-error',
            data: {
                errorMessage: errorMessage,
                buttonText: Languages.get('global.tryAgain', 'start')
            }
        });

        this.errorDialogRef.afterClosed().subscribe(result => {
            if (result) {
                CommonService.refresh();
            }
        });
    }

    getCustomerListForLoggedInUser(): Observable<ICustomerList[]> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/users/user/getpermission/`;
        return this.get(serviceUrl)
            .map((e: IUserPermission) => {
                const customers: ICustomerList[] = [];
                if (e.activeCustomerList) {
                    e.activeCustomerList.forEach(each => {
                        customers.push({ 'customerName': each });
                    });
                }
                return customers;
            });
    }

    getAdminPermissionById(id: any): Observable<IUserPermission> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/admin/getpermission/${id}`;
        return this.get(serviceUrl);
    }

    getCustomerAdminPermissionsById(id: any): Observable<ICustomerPermission> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/customeradmin/getpermission/${id}`;
        return this.get(serviceUrl);
    }

    getAllCustomersList(): Observable<ICustomerList[]> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/users/user/getpermission/`;
        return this.get(serviceUrl)
            .map((e: IUserPermission) => {
                const customers: ICustomerList[] = [];
                e.customers.forEach(each => {
                    customers.push({ 'customerName': each });
                });
                return customers;
            });
    }

    getUserPermission(): Observable<IUserPermission> {
        const serviceUrl = `${CommonService.serverUrl}/user-server/users/user/getpermission/`;
        return this.get(serviceUrl)
            .map((e: IUserPermission) => {
                return e;
            });
    }

    customerListInterceptor(customers: any): any {
        if (this.userCustomers.length === 0) {
            this.getCustomerListForLoggedInUser().subscribe(
                (data: any) => {
                    return this.modifyCustomers(data);
                });
        }
        if (customers.length === 1 && customers[0][0] === 'ALL') {
            return [this.userCustomers];
        } else if (customers.length === 1 && customers[0] === 'ALL') {
            return this.userCustomers;
        } else {
            return [this.modifyCustomers(customers[0])];
        }
    }

    modifyCustomers(data: any): any {
        const modifiedCustomers = [];
        data.forEach((element: String) => {
            let modifiedCustomer = element.toString();
            modifiedCustomer = modifiedCustomer.replace('/', '%2F');
            modifiedCustomer = modifiedCustomer.replace('&', '%26');
            modifiedCustomers.push(modifiedCustomer);
        });
        return modifiedCustomers;
    }
}

@Injectable()
export class HttpLoggerInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const started = Date.now();
        return next
            .handle(req)
            .do(event => {
                const elapsed = Date.now() - started;
                if (event instanceof HttpResponse) {
                    // console.log(`HTTP log: Request for ${req.urlWithParams} took ${elapsed} ms.`
                    //     + `Status code: ${event.status} ${event.statusText}`);
                }
            }
            );
    }
}


import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { CookieModule, CookieService } from 'ngx-cookie';
import { FormsModule } from '@angular/forms';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { FlowChartComponent } from './flowchart/flowchart.component';
import { ClientService } from './services/client.service';

// import { LogoutComponent } from './auth/logout/logout.component';
// import { LoginComponent } from './auth/login/login.component';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';
// import { UserService } from './services/users.service';
import { HttpTokenInterceptor } from './services/http.interceptor';
import { CommonService, HttpLoggerInterceptor } from './services/common.service';
import { FilterService } from './services/filter.service';
import {UserProfileService} from './user-profile/user-profile.service';
import {
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatLineModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorIntl,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTableModule
} from '@angular/material';

import { MatExpansionModule } from '@angular/material/expansion';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OnsiteBarChartComponent } from './onsite-bar-chart/onsite-bar-chart.component';
import { AverageBarChartComponent } from './average-bar-chart/average-bar-chart.component';
import { ErrorMessageComponent, ErrorMessageDialogComponent } from './error-message/error-message.component';
import { ChartDetailComponent } from './chart-detail/chart-detail.component';
import { OnSiteBarChartService } from './onsite-bar-chart/onsite-bar-chart.service';
import { AverageBarChartService } from './average-bar-chart/average-bar-chart.service';
import { BarChartToolbarComponent } from './bar-chart-toolbar/bar-chart-toolbar.component';
import { CasesByAreaBarChartComponent } from './cases-by-area-bar-chart/cases-by-area-bar-chart.component';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';
import { LoadingDirective } from './loading/loading.directive';
import { LoadingComponent } from './loading/loading.component';
import { BarChartHeaderComponent } from './bar-chart-header/bar-chart-header.component';
import { HighFrequencyStoresChartComponent } from './high-frequency-stores-chart/high-frequency-stores-chart.component';
import { BarChartPaginator } from './bar-chart/bar-chart-paginator.component';
import { CasesByHourChartComponent } from './cases-by-hour-chart/cases-by-hour-chart.component';
import { CashFlowChartComponent } from './cash-flow-chart/cash-flow-chart.component';
import { SlaChartComponent } from './sla-chart/sla-chart.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { DialogComponent } from './dialog/dialog.component';
import { EmailInviteComponent } from './email-invite/email-invite.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserListComponent } from './user-list/user-list.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { ChangePasswordService } from './change-password-dialog/change-password-service';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { FirstTimeFixChartComponent } from './first-time-fix-chart/first-time-fix-chart.component';
import { AreaChartComponent } from './area-chart/area-chart.component';
import { UserExperienceReportComponent } from './user-experience-report/user-experience-report.component';
import { DonutChartComponent } from './donut-chart/donut-chart.component';
import { InfoTableComponent } from './info-table/info-table.component';
import { GaugeChartComponent } from './gauge-chart/gauge-chart.component';
import { UnitLifeComponent } from './unit-life/unit-life.component';
import { CaseHistoryComponent } from './case-history/case-history.component';
import { ReportFilterComponent } from './report-filter/report-filter.component';
import { InterventionDriverComponent } from './intervention-driver/intervention-driver.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ExecutiveDashboardComponent } from './executive-dashboard/executive-dashboard.component';
import { KPIAuthGaurd } from 'app/auth/kpi.guard';
import { DashboardKpiComponent } from './dashboard-kpi/dashboard-kpi.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { SecurePipe } from './services/securepipe';
// TODO: Wrap all material Modules to a single module

@NgModule({
    declarations: [
        AppComponent,
        BarChartComponent,
        FlowChartComponent,
        DashboardComponent,
        OnsiteBarChartComponent,
        AverageBarChartComponent,
        ErrorMessageComponent,
        ErrorMessageDialogComponent,
        ChartDetailComponent,
        BarChartComponent,
        BarChartToolbarComponent,
        CasesByAreaBarChartComponent,
        DashboardCardComponent,
        LoadingDirective,
        LoadingComponent,
        BarChartHeaderComponent,
        HighFrequencyStoresChartComponent,
        CasesByHourChartComponent,
        CashFlowChartComponent,
        SlaChartComponent,
        UserRegistrationComponent,
        DialogComponent,
        EmailInviteComponent,
        UserProfileComponent,
        UserListComponent,
        BackButtonComponent,
        ConfirmDialogComponent,
        ChangePasswordDialogComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        EditProfileComponent,
        FirstTimeFixChartComponent,
        AreaChartComponent,
        UserExperienceReportComponent,
        DonutChartComponent,
        InfoTableComponent,
        GaugeChartComponent,
        UnitLifeComponent,
        CaseHistoryComponent,
        ReportFilterComponent,
        InterventionDriverComponent,
        HomeComponent,
        LoginComponent,
        ExecutiveDashboardComponent,
        DashboardKpiComponent,
        SecurePipe,
        PieChartComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
        HttpModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatLineModule,
        MatCardModule,
        FormsModule,
        MatGridListModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatMenuModule,
        MatCardModule,
        MatTabsModule,
        MatDialogModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatExpansionModule,
        MatChipsModule,
        MatRadioModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatTableModule,
        CookieModule.forRoot(),
        OAuthModule.forRoot()
    ],
    entryComponents: [
        ErrorMessageDialogComponent,
        LoadingComponent,
        DialogComponent,
        EmailInviteComponent,
        ChangePasswordDialogComponent
    ],
    providers: [
        ClientService,
        CommonService, FilterService,
        OnSiteBarChartService,
        AuthGuard,
        KPIAuthGaurd,
        AuthService,
        // UserService,
        AverageBarChartService,
        AuthService,
        UserProfileService,
        ChangePasswordService,
        SecurePipe,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpLoggerInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpTokenInterceptor,
            multi: true
          },
        {
            provide: MatPaginatorIntl,
            useClass: BarChartPaginator
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

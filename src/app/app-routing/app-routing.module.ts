import { DashboardKpiComponent } from './../dashboard-kpi/dashboard-kpi.component';

import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AverageBarChartComponent } from '../average-bar-chart/average-bar-chart.component';
import { OnsiteBarChartComponent } from '../onsite-bar-chart/onsite-bar-chart.component';
import { CasesByAreaBarChartComponent } from '../cases-by-area-bar-chart/cases-by-area-bar-chart.component';
import { HighFrequencyStoresChartComponent } from '../high-frequency-stores-chart/high-frequency-stores-chart.component';
import { CasesByHourChartComponent } from '../cases-by-hour-chart/cases-by-hour-chart.component';
import { CashFlowChartComponent } from 'app/cash-flow-chart/cash-flow-chart.component';
import { SlaChartComponent } from 'app/sla-chart/sla-chart.component';
import { FirstTimeFixChartComponent } from './../first-time-fix-chart/first-time-fix-chart.component';
import { UserRegistrationComponent } from 'app/user-registration/user-registration.component';
import { AuthGuard } from 'app/auth/auth.guard';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserListComponent } from '../user-list/user-list.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { UserExperienceReportComponent } from '../user-experience-report/user-experience-report.component';
import { UnitLifeComponent } from '../unit-life/unit-life.component';
import { CaseHistoryComponent } from '../case-history/case-history.component';
import { InterventionDriverComponent } from '../intervention-driver/intervention-driver.component';
import { ExecutiveDashboardComponent } from '../executive-dashboard/executive-dashboard.component';
import { KPIAuthGaurd } from 'app/auth/kpi.guard';
import { HomeComponent } from 'app/home/home.component';
import { LoginComponent } from 'app/login/login.component';
const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'alert',
        component: DashboardComponent,
        canActivate: [AuthGuard, KPIAuthGaurd],
        data: [{ displayAlertsOnly: true }, { showDasboardCards: false }]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: [{ displayAlertsOnly: false, showDasboardCards: true }]
    },
    {
        path: 'averageHours/report',
        component: AverageBarChartComponent,
        canActivate: [AuthGuard, KPIAuthGaurd],
        data: { width: 900, height: 420 }
    },
    {
        path: 'onsitetime/:selectedOnSiteTimeSlot',
        component: OnsiteBarChartComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'casesByArea/:selectedArea',
        component: CasesByAreaBarChartComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'high-frequency-stores',
        component: HighFrequencyStoresChartComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'casesByHour',
        component: CasesByHourChartComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'cashFlow',
        component: CashFlowChartComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'sla/:selectedZone',
        component: SlaChartComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'first-time-fix',
        component: FirstTimeFixChartComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'user-exp',
        component: UserExperienceReportComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'intervention',
        component: InterventionDriverComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'register/:**',
        component: UserRegistrationComponent
    },
    {
        path: 'user-profile',
        component: UserProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'user/:loginType/:userId/:permissionId',
        component: UserProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'user-list/:loginType/:userType',
        component: UserListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'password/forgot',
        component: ForgotPasswordComponent
    },
    {
        path: 'password/reset/:resetId',
        component: ResetPasswordComponent
    },
    {
        path: 'user-edit',
        component: EditProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'unit-life',
        component: UnitLifeComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'case-history/:pageOffset/:pageLimit/:machineId',
        component: CaseHistoryComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'exec-dashboard',
        component: ExecutiveDashboardComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'dashboard-kpi',
        component: DashboardKpiComponent,
        canActivate: [AuthGuard, KPIAuthGaurd]
    },
    {
        path: 'na',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/login',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
@Injectable()
export class AppRoutingModule {
}

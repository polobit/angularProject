import * as moment from 'moment';

export interface DashboardData {
    count: string | number;
    name: string;
    color: string;
}

export interface LinechartData {
    ticker: string;
    values: LinechartDataValue[];
}

export interface LinechartDataValue {
    date: any;
    close: number;
}

export interface FlowchartData {
    params: {
        score: number;
        report: string;
        trend: string;
        trendImproved: string;
        fillColor: string;
    };
    name: string;
    children?: FlowchartData[];
}

/* TODO: Dashboard Card Interfaces */

export interface IAverageHoursCard {
    cases?: string | number;
    caseDate?: string;
    lastUpdatedDate: string;
    previousDayDate: string;
    lastUpdatedDayAverage: number;
    percentageChange: number;
    previousDayAverage: number;
    totalCases?: string | number;
    total?: number;
}

export interface IOnsiteTimeSpentCard {
    zeroToTwoHoursCases: number;
    twoToFourHoursCases: number;
    fourToTwelveHoursCases: number;
    twelveToTwentyFourHoursCases: number;
    caseDate: string;
}

export interface IAverageOnsiteTimeSpentCardAllSlot {
    aggregateAverageHours: number;
}

export interface IFirstTimeFixCard {
    earlierDate: string;
    latestDate: string;
    earlierPercentage: number;
    percentageChange: number;
    latestPercentage: number;
    total: number;
    earlierCases: number;
}

export interface IAlertCard {
    kpiName: string;
    link: string;
    title: string;
    lastUpdated: string;
    kpiUnit: string;
    kpiUnitType: string;
    kpiValue: string | number;
    previousAverage?: string | number;
    previousAverageUnit?: string;
    percentageChange?: string | number;
    previousDayDate?: string;
    onsiteSlot?: number;
    area?: string;
    zone?: string;
}

export interface ICustomerList {
    customerName: string;
}

export interface IModelList {
    model: string;
}

export interface INotificationList {
    id: string;
    registeredDate: number;
    message: string;
    inviteeEmailAddress: string;
    registeredEmailAddress: string;
    status: false;
    firstName: string;
    lastName: string;
}

/* TODO: Bar Chart Interfaces */

/* Generic Bar Chart Interface */

export interface IChartData {
    caseDate?: string;
    caseDateMoment?: moment.Moment;
    averageHours?: number;
    successRatio?: string;
    date?: string;
    slot1?: number;
    slot2?: number;
    slot3?: number;
    slot4?: number;

    [property: string]: any;
}

/* Average Bar Chart API Interface */

export interface IAverageBarChart {
    aggregateAverageHours: number;
    chartData?: IAverageBarChartValue[] | null;
}

export interface IAverageBarChartValue {
    caseDate: string;
    month?: string;
    averageHours: number;
    week?: string;
}

/* Average Bar Chart Details Interface */

export interface IAverageBarChartDetail {
    caseDetails?: IAverageBarChartDetailValue[] | null;
    aggregateAverageHours: number;
}

export interface IAverageBarChartDetailValue {
    customerName: string;
    hoursSpentOnsite: number;
    description: string;
    location: string;
    technicianName: string;
    machineId: string;
    caseNumber: string;
}


/* On Site Bar Chart Details Interface */

export interface IOnsiteBarChartDetail {
    caseDetails?: IOnsiteBarChartDetailValue[] | null;
    aggregateAverageHours: number;
    totalCases: number;
}

export interface IOnsiteBarChartDetailValue {
    customerName: string;
    hoursSpentOnsite: number;
    description: string;
    location: string;
    technicianName: string;
    machineId: string;
    caseNumber: string;
    linkedCase?: string;
    link?: string;
    inScope?: string;
    outScope?: string;
    customerNamePrecise?: string;
}


export interface IOnsiteBarChart {
    chartData?: IOnsiteBarChartValue[] | null;
    fourToTwelveHoursAverage: number;
    twelveToTwentyFourHoursAverage: number;
    twoToFourHoursAverage: number;
    zeroToTwoHoursAverage: number;
}

export interface IOnsiteBarChartValue {
    caseDate: string;
    month?: string;
    date?: string;
    week?: string;
    twelveToTwentyFourHours: IOnSiteBarChartValueSlot;
    twoToFourHours: IOnSiteBarChartValueSlot;
    fourToTwelveHours: IOnSiteBarChartValueSlot;
    zeroToTwoHours: IOnSiteBarChartValueSlot;
}

export interface IOnSiteBarChartValueSlot {
    number: number;
    percentage: string;
}

export interface ICaseDetails {
    caseDate: string;
    zeroToTwoHours: IAverageByCase;
    twoToFourHours: IAverageByCase;
    fourToTwelveHours: IAverageByCase;
    twelveToTwentyFourHours: IAverageByCase;
}

export interface IAverageByCase {
    number: string | number;
    percentage: string | number;
}

export interface ISiteDataList {
    locationName: string;
    technicianName: string;
    siteName: string;
    description: string;
    value: string;
    caseNo: string;
    customerName: string;
}

export interface IDetailsByDate {
    caseDate: string;
    aggregateAverageHours: string;
    caseDetails: ICaseDetailList[] | null;
}

export interface ICaseDetailList {
    hoursSpentOnsite: string;
    description: string;
    location: string;
    technicianName: string;
    machineId: string;
    caseNumber: string;
}

/* Cases By Area Interface */

export interface ICasesByAreaChart {
    chartData?: ICasesByAreaChartValue[] | null;
    phoneFixAverage: number;
    inScopeAverage: number;
    outScopeAverage: number;
    dispatchAverage: number;
}

export interface ICasesByAreaChartValue {
    caseDate: string;
    week?: string;
    month?: string;
    date?: string;
    phoneFix: ICasesByAreaChartValueSlot;
    inScope: ICasesByAreaChartValueSlot;
    outScope: ICasesByAreaChartValueSlot;
    dispatch: ICasesByAreaChartValueSlot;
}

export interface ICasesByAreaChartValueSlot {
    number: number;
    percentage: string;
}

/* High Frequency Interface */

export interface IHighFrequencyChart {
    chartData?: IHighFrequencyChartValue[];
    totalCases?: number;
    totalStores?: number;
}

export interface IHighFrequencyChartValue {
    serial: string;
    total: number;
}

/* Cases By Hour Interface */

export interface ICasesByHourChart {
    chartData?: ICasesByHourChartValue[];
    dispatchAverage: string;
    phoneFixAverage: string;
}

export interface ICasesByHourChartValue {
    hour?: number;
    weekDay: number | string;
    phoneFix: number;
    dispatch: number;
}

/* Filter Interface */

export interface IFilter {
    customer: any[];
    model: any[];
    period: string;
}

export interface ISelectedFIlter {
    value: string;
    filterType: string;
}

export interface ICashFLowChart {
    cashFlowNode: ICashFLowChartValue[];
}

/* Cash Flow Interface */

export interface ICashFLowChartValue {
    name: string;
    description?: string;
    trend?: string;
    trendImproved?: string;
    percentage: number;
    number: number;
    children: Array<ICashFLowChartValue>;
}

/* Cases By Zone Interface */
export interface ICasesByZoneChart {
    chartData?: ICasesByZoneChartValue[] | null;
    inTimeCasesTotal: number;
    outTimeCasesTotal: number;
}

export interface ICasesByZoneChartValue {
    caseDate: string;
    week?: string;
    month?: string;
    date?: string;
    outTimeCases: ICasesByZoneChartValueSlot;
    inTimeCases: ICasesByZoneChartValueSlot;
}

export interface ICasesByZoneChartValueSlot {
    number: number;
    percentage: string;
}

/* First Time Fix */
export interface IFirstTimeFixChart {
    chartData?: IFirstTimeFixChartValue[] | null;
    totalData: IFirstTimeFixValue;
}

export interface IFirstTimeFixChartValue {
    date?: string;
    caseDate?: string;
    index?: string;
    data?: IFirstTimeFixValue;
    caseType?: number;
    empty?: number;
}

export interface IFirstTimeFixValue {
    number: number;
    linkedCases: number;
    percentage: string;
    dispatchFixFirstTime: number;
    dispatchFixPercentage: string;
    phoneFixFirstTime: number;
    phoneFixPercentage: string;
}

/* Interfaces For Admin Portal */

export interface IUserCount {
    adminCount: number;
    viewerCount: number;
    customerCount: number;
}

export interface IUserInfo {
    firstName: string;
    lastName: string;
    jobTitle: string;
    customer: string;
    location: string;
    emailId: string;
    contactNumber: string;
    userType: string;
    storeNumber: any[];
}

export interface IUserInfoInvited {
    id: string;
    registeredEmailId: string;
    userType: string;
    inviteeEmail: string;
}

export interface IUserList {
    firstName: string;
    lastName: string;
    customers: Array<string>;
    jobTitle: string;
}

export interface IUserPermission {
    id: string;
    userMailId: string;
    customers: any[];
    activeCustomerList: any[];
    firstName: string;
    lastName: string;
    userType: string;
    jobTitle: string;
    admin: boolean;
    averageHoursSpentOnsite: boolean;
    casesByArea: boolean;
    highFrequencyDispatch: boolean;
    casesByHour: boolean;
    serviceLevelAgreement: boolean;
    cashFlowInnovation: boolean;
    casesByOnsiteHours: boolean;
    firstTimeFix: boolean;
    unitLifeData: boolean;
    userExperience: boolean;
    interventionDriver: boolean;
}


export interface ICustomerPermission {
    id: string;
    userMailId: string;
    customers: any[];
    activeCustomerList: any[];
    revolutions: any[];
    userType: string;
    averageHoursSpentOnsite: boolean;
    casesByArea: boolean;
    highFrequencyDispatch: boolean;
    casesByHour: boolean;
    serviceLevelAgreement: boolean;
    cashFlowInnovation: boolean;
    casesByOnsiteHours: boolean;
    firstTimeFix: boolean;
    unitLifeData: boolean;
    userExperience: boolean;
}

export interface INotifiedUserInfo {
    userId: string;
    permissionId: string;
}

export interface IPasswordDetails {
    oldPassword: string;
    newPassword: string;
}

export interface ICustStoreDetails {
    revolutions: IStoreInfo[];
    storeNumbers: any[];
    customerCount: number;
}

export interface IStoreInfo {
    location: LocationInfo[];
    model: string;
    serial: string;
    companyName: string;
    customer: string;

}

export interface LocationInfo {
    name: string;
    value: string;
}
export interface ICustListDetails {
    firstName: string;
    lastName: string;
    emailId: string;
    jobDescription: string;
    storeDetails: IStoreInfo[];
    permissionId: string;
    userId: string;
}


// Reports Interface

export interface ISuccessRatio {
    chartData: ISuccessRatioValues[];
    totalSuccessRatio: string;
    totalInterventionRatio: string;
    totalDocuments?: number;
}

export interface ISuccessRatioValues {
    index: string;
    successRatio: string;
    store?: string;
    financialTransactions?: number;
    interventionCount?: number;
    user?: string;
    maxUserInterventionCount?: number;
    txdetail?: string;
    interventionRatio?: number;
}

export interface ISuccessRatioData {
    earlierPercentage: number;
    latestDate: string;
    percentageChange: string;
    latestPercentage: string;
    earlierDate: string;
}

export interface IinfoTableData {
    successRatio: string;
    store: string;
    financialTransactions: string;
    interventionCount: string;
    user?: string;
    maxUserInterventionCount?: number;
    interventionRatio?: number;
    txdetail?: number;
}
export interface ICaseDetailsHistory {
    caseDetails: ICaseHistory[];
}
export interface ICaseHistory {
    customerName: string;
    customerNamePrecise: string;
    customer: string;
    hoursSpentOnsite: number;
    caseDate: string;
    description: string;
    location: string;
    hour: number;
    weekDay: number;
    jobType: string;
    scope: string;
    technicianName: string;
    machineId: string;
    caseNumber: string;
    linkedCase: boolean;
    phoneFix: boolean;
    area: string;
    link: string;
    inScope: boolean;
    model: string;
    slaZone: string;
    technicianCompany: string;
    slaTime: boolean;
    slaHours: number;
    comments: string;
    installDate: string;
    status: string;
}
// Unit Life Model
export interface Location {
    text: string;
    value: string;
}

export interface Total {
    lifeTimeCount: number;
    sinceCleanCount: number;
    sinceMaintainenceCount: number;
}

export interface Bcrcount {
    lifeTimeCount: number;
    sinceCleanCount: number;
    sinceMaintainenceCount: number;
}

export interface Bnrcount {
    lifeTimeCount: number;
    sinceCleanCount: number;
    sinceMaintainenceCount: number;
}

export interface IUnitData {
    offset: number;
    totalDocuments: number;
    units: IUnitDataValue[];
}

export interface IUnitDataValue {
    customer: string;
    model: string;
    serial: string;
    installDate: string;
    lastPMDate: string;
    nextPMDate: string;
    preventiveMaintainenceCount: string;
    location: Location[];
    total: Total;
    dispatchCount: number;
    path: string;
    bcrcount: Bcrcount;
    bnrcount: Bnrcount;
    maxLimit: string;
}

export interface ICase {
    caseNumber: String;
    phoneFix: Boolean;
    jobType: String;
    caseDate: String;
    description: String;
    status: String;
    comments: String;
}

export interface IDonutChart {
    count: number;
    color: string;
}

export interface IDashboardTiles {
    dispatch: number;
    phoneFix: number;
    location: number;
    revolution: number;
}

export interface ITimeStamp {
    _id?: string;
    lastUpdateDate: string;
}

export interface IPieChart {
    label: string;
    value: string | number;
    color?: string;
}
export interface IPieChartResponse {
    _id: string;
    count: number;
}

export interface IUnitLifeSummary {
    outOfRangePercentage: number;
    averageNotesCount: number;
    inRangePercentage: number;
}

export interface IDispatchData {
    _id?: string;
    store?: string;
    dispatch?: number;
}

export interface IDispatchDataArray {
    caseDetails: IDispatchData[];
}

export interface ISlaAllZone {
    inTimePercentage: number;
    total: number;
    outTimeCases: number;
    inTimeCases: number;
}

export interface IFirstTimeFixAllCase {
    percentage: string;
    total: number;
    linkedCases: number;
    firstTimeFix: number;
}

export interface ICardsWithPeriod {
    aggregateAverageHours?: number;
    totalStores?: number;
    zeroToTwoHoursAverage?: number;
    twoToFourHoursAverage?: number;
    fourToTwelveHoursAverage?: number;
    twelveToTwentyFourHoursAverage?: number;
}

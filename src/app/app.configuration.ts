import * as _ from 'lodash';
import { environment } from '../environments/environment';

type CaseConversion = 'upper' | 'toUpper' | 'toUpperCase' |
    'lower' | 'toLower' | 'toLowerCase' |
    'capitalize' | 'sentence' |
    'start' | 'startCase' | 'capitalizeEach' |
    'capitalizeFirst';

const cashFlowInnovation = 'reliability tree';

export abstract class AppConfiguration {
    public static readonly env = environment;
    public static readonly global = {
        colors: {
            axis: '#e0e0e0',
            threshold: '#2979ff',
            average: '#808080',
            aboveTarget: '#ef4a20',
            belowTarget: '#02b53b',
            defaultBar: '#1e88e5',
            aggregateValueBad: '#c62828',
            aggregateValueNeutral: '#1565c0',
            aggregateValueGood: '#2e7d32'
        },
        apiTimeFormat: 'MM/DD/YYYY',
        displayTimeFormat: 'll',
        kpiChart: {
            resolution: {
                desktop: {
                    width: 900,
                    height: 420,
                    padding: 0.4,
                    fontSize: 10
                },
                tablet: {
                    width: 660,
                    height: 400,
                    padding: 0.3,
                    fontSize: 9
                },
                phone: {
                    width: 500,
                    height: 300,
                    padding: 0.2,
                    fontSize: 8
                }
            }
        },
        reportChart: {
            resolution: {
                desktop: {
                    width: 1200,
                    height: 200,
                    padding: 0.4,
                    fontSize: 10
                },
                tablet: {
                    width: 660,
                    height: 200,
                    padding: 0.3,
                    fontSize: 9
                },
                phone: {
                    width: 500,
                    height: 200,
                    padding: 0.2,
                    fontSize: 8
                }
            }
        },
        api: {
            devUrl: 'http://rrs-api.techolution.qa:8079/api',
            qualUrl: 'https://cpdevapi.rrs360.com/api',
            prodUrl: 'https://cpqa.rrs360.com/api',
            devAuthUrl: 'http://rrs-api.techolution.qa:9999/auth',
            qualAuthUrl: 'https://cpdevapi.rrs360.com/auth',
            prodAuthUrl: 'https://cpqaapi.rrs360.com/auth',
            maxRetries: 0,
            timeOut: 60
        },

        locale: navigator.language || 'en-US',
        showServerErrorMessage: 'snackbar',
        resolution: {
            tablet: 768,
            phone: 480,
            desktop: 1024
        },
        periods: {
            values: ['pasttwelvemonths', 'pastsixmonths', 'pastthirtydays', 'pastsevendays'],
            days: ['12 months', '6 months', '30 days', '7 days'],
            frequency: ['monthly', 'weekly', 'daily', 'daily'],
            newFrequencyMapping: ['monthly', 'weekly', '30', '7'],
            reportFrequency: ['365', '180', '30', '7'],
            titles: ['showingLastTwelveMonthData', 'showingLastSixMonthData', 'showingLastMonthData', 'showingSevenDaysData'],
            default: 2
        },
        filter: {
            disablePeriodsOnRoutes: ['/alert', '/dashboard', '/unit-life'],
            disableFilterOnRoutes: ['/login', '/home', '/user-profile', '/user', '/user-list', '/password', '/user-edit', '/case-history'],
            defaultFiler: { customer: ['ALL'], model: ['ALL'], period: 'pastthirtydays' }
        },
        menu: [
            {
                item: 'home',
                icon: 'home',
                route: '/home',
            },
            {
                item: 'alert',
                icon: 'warning',
                route: '/alert',
            },
            {
                item: 'dashboard',
                icon: 'dashboard',
                route: '/exec-dashboard'
            },
            {
                item: 'cashFlowInnovation',
                icon: 'insert_chart',
                route: '/na'
            },
            {
                item: 'predictiveAnalytics',
                icon: 'timeline',
                route: '/na'
            },
            {
                item: 'volumeDashboard',
                icon: 'pie_chart',
                route: '/na'
            },
            {
                item: 'machineDashboard',
                icon: 'insert_chart',
                route: '/unit-life'
            },
            {
                item: 'userExperience',
                icon: 'insert_chart',
                route: '/user-exp'
            },
            {
                item: 'profile',
                icon: 'person_outline',
                route: '/user-profile'
            }
        ],
        threshold: [
            { label: 'high', value: 'HIGH' },
            { label: 'medium', value: 'MED' },
            { label: 'low', value: 'LOW' }
        ],
        gaugeLimit: 900000
    };

    public static readonly url = environment ? environment.environment === 'qual' ?
        AppConfiguration.global.api.qualUrl : environment.environment === 'dev' ?
            AppConfiguration.global.api.devUrl : AppConfiguration.global.api.prodUrl : AppConfiguration.global.api.prodUrl;

    // not refered any where need to remove
    public static readonly machineImageUrl = environment ? environment.environment === 'qual' ?
        'http://rrs-api.techolution.qa:8999' : environment.environment === 'dev' ?
            'https://cpdev.rrs360.com' : 'http://cpqaapi.rrs360.com:8999' : 'http://cpqaapi.rrs360.com:8999';

    public static readonly authUrl = environment ? environment.environment === 'qual' ?
        AppConfiguration.global.api.qualAuthUrl : environment.environment === 'dev' ?
            AppConfiguration.global.api.devAuthUrl : AppConfiguration.global.api.prodAuthUrl : AppConfiguration.global.api.prodAuthUrl;

    public static readonly averageHours = {
        colors: {
            target: AppConfiguration.global.colors.threshold,
            average: AppConfiguration.global.colors.average
        },
        target: 2
    };

    public static readonly onSiteTime = {
        colors: {
            target: AppConfiguration.global.colors.threshold,
            average: AppConfiguration.global.colors.average
        },
        timePeriods: [
            { key: 'zeroToTwoHours', slot: '0-2hrs', color: '#a4f461' },
            { key: 'twoToFourHours', slot: '2-4hrs', color: '#f4a73a' },
            { key: 'fourToTwelveHours', slot: '4-12hrs', color: '#fc8a8a' },
            { key: 'twelveToTwentyFourHours', slot: '12-24hrs', color: '#a30b0b' }
        ],
        cases: ['number', 'percentage'],
        warningCardColor: '#f9a825'
    };

    public static readonly casesByArea = {
        areas: [
            { name: 'bcr', averageTarget: 20, apiKey: 'BCR' },
            { name: 'bnr', averageTarget: 20, apiKey: 'BNR' },
            { name: 'vault', averageTarget: 20, apiKey: 'Vault' },
            { name: 'other', averageTarget: 20, apiKey: 'Other' }
        ],
        cases: ['number', 'percentage'],
        colorSlots: {
            bcr: [
                { key: 'inScope', slot: 'inScope', color: '#fc4c87' },
                { key: 'outScope', slot: 'outScope', color: '#e32061' },
                { key: 'phoneFix', slot: 'phoneFix', color: '#b38f9a' }
            ],
            bnr: [
                { key: 'inScope', slot: 'inScope', color: '#4cbcfc' },
                { key: 'outScope', slot: 'outScope', color: '#219FE4' },
                { key: 'phoneFix', slot: 'phoneFix', color: '#8fa5b3' }
            ],
            vault: [
                { key: 'inScope', slot: 'inScope', color: '#fcd64c' },
                { key: 'outScope', slot: 'outScope', color: '#e3b920' },
                { key: 'phoneFix', slot: 'phoneFix', color: '#b3ab8f' }
            ],
            other: [
                { key: 'inScope', slot: 'inScope', color: '#9b4cfc' },
                { key: 'outScope', slot: 'outScope', color: '#7420e3' },
                { key: 'phoneFix', slot: 'phoneFix', color: '#9c8fb3' }
            ],
            all: [
                { key: 'bcr', slot: 'bcr', color: '#ff3377' },
                { key: 'bnr', slot: 'bnr', color: '#33b8ff' },
                { key: 'vault', slot: 'vault', color: '#ffcf33' },
                { key: 'other', slot: 'other', color: '#8f33ff' }
            ],
            inScope: [
                { key: 'inScope', slot: 'inScope', color: '#4cbcfc' }
            ],
            outScope: [
                { key: 'outScope', slot: 'outScope', color: '#219FE4' }
            ],
            phoneFix: [
                { key: 'phoneFix', slot: 'phoneFix', color: '#8fa5b3' }
            ],
            dispatch: [
                { key: 'inScope', slot: 'inScope', color: '#4cbcfc' },
                { key: 'outScope', slot: 'outScope', color: '#219FE4' }
            ],
        },
        caseTypes: {
            keys: ['inScope', 'outScope', 'phoneFix']
        },
        dispatchCaseType: {
            keys: ['inScope', 'outScope']
        }
    };

    public static readonly casesByHour = {
        days: [
            { name: 'monday', apiKey: 'MONDAY' },
            { name: 'tuesday', apiKey: 'TUESDAY' },
            { name: 'wednesday', apiKey: 'WEDNESDAY' },
            { name: 'thursday', apiKey: 'THURSDAY' },
            { name: 'friday', apiKey: 'FRIDAY' },
            { name: 'saturday', apiKey: 'SATURDAY' },
            { name: 'sunday', apiKey: 'SUNDAY' }
        ],
        caseTypes: [
            { key: 'phoneFix', slot: 'phoneFix', color: '#92D963' },
            { key: 'dispatch', slot: 'dispatch', color: '#4A4A4A' }
        ]
    };

    public static readonly casesByZones = {
        zones: [
            { name: 'Zone 1', averageTarget: 93, key: 'zone1', apiKey: 'Zone1', hourLimit: '4 hr' },
            { name: 'Zone 2-3', averageTarget: 93, key: 'zone2-3', apiKey: 'Zone2-3', hourLimit: '6 hr' },
            { name: 'Zone 4-5', averageTarget: 93, key: 'zone4-5', apiKey: 'Zone4-5', hourLimit: '24 hr' }
        ],
        cases: ['number', 'percentage'],
        colorSlots: {
            Zone1: [
                { key: 'inTime', slot: 'inTime', color: '#2FBC55' },
                { key: 'outTime', slot: 'outTime', color: '#FFACAF' }
            ],
            'Zone2-3': [
                { key: 'inTime', slot: 'inTime', color: '#229FE4' },
                { key: 'outTime', slot: 'outTime', color: '#FFACAF' }
            ],
            'Zone4-5': [
                { key: 'inTime', slot: 'inTime', color: '#A166EA' },
                { key: 'outTime', slot: 'outTime', color: '#FFACAF' }
            ],
            all: [
                { key: 'zone1', slot: 'zone1', color: '#2FBC55' },
                { key: 'zone2-3', slot: 'zone2-3', color: '#229FE4' },
                { key: 'zone4-5', slot: 'zone4-5', color: '#A166EA' }
            ]
        },
        slaTime: [
            { key: 'inTime', slot: 'made' },
            { key: 'outTime', slot: 'outTime' }
        ]
    };

    public static readonly firstTimeFix = {
        alertTarget: 95,
        cases: ['number', 'percentage'],
        colorSlots: {
            phonefix: [
                { key: 'phoneFix', slot: 'phoneFix', color: '#42BD41' },
                { key: 'linked', slot: 'linked', color: '#F973A2' }
            ],
            dispatch: [
                { key: 'dispatch', slot: 'dispatch', color: '#58B3F3' },
                { key: 'linked', slot: 'linked', color: '#F973A2' }
            ],
            all: [
                { key: 'phoneFix', slot: 'phoneFix', color: '#42BD41' },
                { key: 'dispatch', slot: 'dispatch', color: '#58B3F3' },
                { key: 'linked', slot: 'linked', color: '#F973A2' }
            ]
        },
        caseTypes: [
            {
                key: 'phoneFix',
                value: 'phone_fix'
            },
            {
                key: 'dispatch',
                value: 'dispatch'
            }
        ]
    };

    public static readonly reportList = [
        {
            label: 'userExperience',
            route: 'user-exp'
        },
        {
            label: 'interventionDriver',
            route: 'intervention'
        }
    ];

    public static readonly oAuth = {
        authServer: `${AppConfiguration.authUrl}/oauth/authorize`,
        clientId: 'ui',
        logoutUrl: `${AppConfiguration.authUrl}/logout`,
        // redirectUrl: 'http://rrs-api.techolution.qa/callback',
        tokenEndpoint: `${AppConfiguration.authUrl}/oauth/token/`
    };

    public static readonly kpiList = [{
        'name': 'Average Number Of Hours Spent On Site',
        'apiKey': 'averageHoursSpentOnsite',
        'timeStampKey': 'DAILY_AVERAGE_ONSITE_HOURS'
    },
    {
        'name': 'Onsite time spent (Hours)',
        'apiKey': 'casesByOnsiteHours',
        'timeStampKey': 'CASES_BY_ONSITE_HOURS'
    },
    {
        'name': 'Cases By Area',
        'apiKey': 'casesByArea',
        'timeStampKey': 'DAILY_CASES_BY_AREA'
    },
    {
        'name': 'Service Level Agreement (Zone)',
        'apiKey': 'serviceLevelAgreement',
        'timeStampKey': 'SLA_SUCCESS_RATE_DAILY'
    },
    {
        'name': 'High Frequency Dispatch Stores',
        'apiKey': 'highFrequencyDispatch',
        'timeStampKey': 'HIGH_FREQUENCY_DISPATCH_STORES_7DAYS'
    },
    {
        'name': 'Number Of Cases Created Hourly',
        'apiKey': 'casesByHour',
        'timeStampKey': 'CASES_CREATED_BY_HOURS'
    },
    {
        'name': 'Cash Flow Innovation',
        'apiKey': 'cashFlowInnovation',
        'timeStampKey': ''
    },
    {
        'name': 'First Time Fix',
        'apiKey': 'firstTimeFix',
        'timeStampKey': 'FIRST_TIME_FIX_DAILY'
    },
    {
        'name': 'Unit Life Data',
        'apiKey': 'unitLifeData',
        'timeStampKey': 'UNIT_LIFE_DATA'
    },
    {
        'name': 'User Experience',
        'apiKey': 'userExperience',
        'timeStampKey': 'USER_EXPERIENCE'
    },
    {
        'name': 'Intervention Driver',
        'apiKey': 'interventionDriver',
        'timeStampKey': 'INTERVENTIONS_DRIVER_DAILY'
    }];
}

export class Languages {
    public static readonly locales = {
        'en-US': {
            global: {
                average: 'average',
                percentUnit: '%',
                total: 'total',
                '%ofAllCases': '% of all cases',
                noCaseAvailable: 'no case available',
                noLinkedCaseAvailable: 'no linked cases available',
                target: 'target',
                hrs: 'hrs',
                hr: 'hr',
                hour: 'hour',
                hours: 'hours',
                byWeekLastMonth: 'by week for last 1 month',
                showingLastMonthData: 'showing last 30 days data',
                showingSevenDaysData: 'showing last 7 days data',
                showingLastSixMonthData: 'showing last 6 months data',
                showingLastTwelveMonthData: 'showing last 12 months data',
                case: 'case',
                technician: 'technician',
                error: 'error',
                noData: 'no data available',
                cancel: 'cancel',
                apply: 'apply',
                close: 'close',
                lastUpdated: 'last updated',
                cases: 'cases',
                fromAverageOf: 'from average of',
                refresh: 'refresh',
                tryAgain: 'try again',
                serverError: 'server error',
                problemLoadingData: 'problem loading data',
                ok: 'ok',
                na: 'n/a',
                back: 'back',
                on: 'on',
                of: 'of',
                from: 'from',
                stores: 'stores',
                noAlerts: 'no alerts',
                showDashboard: 'show dashboard',
                inscope: 'inscope',
                outscope: 'outscope',
                phoneFix: 'phone fix',
                dispatch: 'dispatch',
                linked: 'linked',
                noMachineAvailable: 'no machine available',
                barsPerPage: 'bars per page:',
                itemsPerPage: 'items per page:',
                page: 'page',
                inTime: 'In Time',
                outTime: 'Out Time',
                jobType: 'Job Type',
                jobDesc: 'Job Desc',
                model: 'model',
                zone: 'zone',
                durationToArrive: 'duration to arrive',
                confirmTitle: 'are you sure you want to save changes?',
                confirmDeleteTitle: 'are you sure you want to delete this user?',
                successTitle: 'great!',
                failTitle: 'sorry!',
                signUpSuccessMessage: 'Thanks for signing up with RRS Customer Portal',
                emailSuccessMessage: 'email sent successfully to ',
                emailFailMessage: 'we could not send email to ',
                emailAlreadySentMessage: 'we have already sent email to ',
                changePassword: 'change password',
                changePasswordMessage: 'your password has been changed successfully. please sign in to continue',
                forgotPasswordSuccessMessage: 'we’ve sent you an email to reset your password.',
                resetPasswordSuccessMessage: 'your password has been reset successfully. ',
                signInMessage: 'please sign in to continue.',
                successEditProfile: 'the profile changes are done successfully',
                customerInviteTitle: 'invite new customer?',
                customerInviteContent: 'you can invite new customer by entering their email below',
                inviteTitle: 'invite new user?',
                inviteContent: 'you can invite new user by entering their email below',
                successRatioby: 'Success Ratio by ',
                successRatio: 'success ratio',
                downtimeRatio: 'downtime ratio',
                interventionRatioTitle: 'intervention ratio',
                store: 'store',
                interventionCount: 'intervention count by ',
                interventionRatio: 'intervention ratio by ',
                user: 'user',
                transDetails: 'transaction detail',
                details: 'details',
                alerts: 'daily alerts',
                dashboard: 'dashboard',
                analysis: 'analysis',
                intervention: 'intervention ratio',
                caseHistory: 'Case History',
                locations: 'locations',
                revolutions: 'revolutions',
                users: 'users',
                dispatches: 'dispatches',
                dispatchCases: 'dispatch cases',
                unitLifeSummary: 'unit life summary',
                locationsInRange: 'locations in range',
                locationsOutRange: 'locations out range',
                interventionOnly: 'intervention',
                selectNote: 'select high/Low performers from filter*',
                averageDailyNoteVolume: 'Average daily note volume',
                nothingToShow: 'No data to display',
                sla: 'sla',
                allZone: 'all zones',
                alreadyRegistered: 'the email address is already registered',
                successRegister: 'the email address has been registered successfully',
                successGetAccess: 'the request has been successfully sent.',
                failGetAccess: 'please try again.',
                pieChartTitle: 'closed dispatch cases after qa',
                made: 'made',
                missed: 'missed',
                dailyDashboard: 'Daily Dashboard',
                notAvailable: 'na'
            },
            menu: {
                home: 'home',
                alert: 'daily alerts',
                dashboard: 'executive dashboard',
                cashFlowInnovation: cashFlowInnovation,
                predictiveAnalytics: 'predictive analytics',
                volumeDashboard: 'volume dashboard',
                machineDashboard: 'machine dashboard',
                userExperience: 'user experience',
                profile: 'profile'
            },
            filter: {
                percent: 'percent',
                percentage: 'percentage',
                number: 'number',
                all: 'all',
                '0-2hrs': '0 - 2 Hrs',
                '2-4hrs': '2 - 4 Hrs',
                '4-12hrs': '4 - 12 Hrs',
                '12-24hrs': '12 - 24 Hrs',
                casesBy: 'cases by',
                caseType: 'case type',
                area: 'area',
                onSiteTime: 'on-site time',
                filterBy: 'filter by',
                customers: 'customers',
                allCustomers: 'all customers',
                models: 'models',
                allModels: 'all models',
                period: 'period',
                bnr: 'BNR',
                bcr: 'BCR',
                vault: 'vault',
                other: 'other',
                phoneFix: 'phone fix',
                inScope: 'in scope',
                outScope: 'out of scope',
                dispatch: 'dispatch',
                linked: 'linked',
                jobArea: 'job area',
                allTypes: 'all types',
                allDays: 'all days',
                weekDay: 'weekday',
                zone1: 'Zone 1(4 hr)',
                'zone2-3': 'Zone 2 & 3 (6 hr)',
                'zone4-5': 'Zone 4 & 5 (24 hr)',
                slazone: 'SLA zone',
                slaTime: 'SLA Time',
                inTime: 'made',
                outTime: 'missed',
                reportType: 'report type',
                userExperience: 'user experience',
                interventionDriver: 'intervention drivers',
            },
            periods: {
                pasttwelvemonths: 'last 12 months',
                pastsixmonths: 'last 6 months',
                pastthirtydays: 'last 30 days',
                pastsevendays: 'last 7 days'
            },
            periodList: {
                pasttwelvemonths: '365',
                pastsixmonths: '182',
                pastthirtydays: '30',
                pastsevendays: '6'
            },
            areas: {
                bcr: 'BCR',
                bnr: 'BNR',
                vault: 'Vault',
                other: 'Other',
                all: 'ALL'
            },
            caseTypes: {
                phoneFix: 'phone fix',
                inScope: 'in scope',
                outOfScope: 'out of scope',
                dispatch: 'dispatch',
                all: 'all',
            },
            days: {
                monday: 'monday',
                tuesday: 'tuesday',
                wednesday: 'wednesday',
                thursday: 'thursday',
                friday: 'friday',
                saturday: 'saturday',
                sunday: 'sunday'
            },
            kpi: {
                casesByOnSiteHours: 'cases by on-site hours',
                averageNumberOfHoursOnSite: 'average number of hours spent on site',
                averageNumberOfHoursOnSiteSubtitle: 'hours spent on site',
                onSiteTimeSpent: 'on-site time spent',
                casesByArea: 'cases by area',
                numberOfCases: 'number of cases by',
                highFrequencyDispatch: 'High Frequency Dispatch Stores',
                numberOfCasesHourly: 'number of cases created hourly',
                casesByHour: 'number of cases by hour in 24hrs period',
                cashFlowInnovation: cashFlowInnovation,
                serviceLevelAgreement: 'service level agreement',
                slaAllZone: 'SLA All Zones',
                onsiteAll: 'on site time - all',
                firstTimeFix: 'first time fix rate'
            },
            errorMessage: {
                required: 'this is a required field.',
                firstName: 'first name is required.',
                lastName: 'last name is required.',
                emailId: 'email id is required.',
                jobTitle: 'job title is required.',
                contactNumber: {
                    required: 'phone number is required.',
                    length: 'phone number should contain 10 digits.'
                },
                location: 'location is required.',
                password: 'password is required.',
                storeNumber: 'store number is required.',
                departmentName: 'department name is required.',
                userType: 'user type is required.',
                wrongPassword: 'please enter correct old password ',
                invalidPassword: 'Password should contain minimum 8 Characters long '
                    + 'with combination of 1 Upper case, 1 Lower case & Alpha Numeric',
                errorStore: 'Please enter valid store numbers',
                organisation: 'organization is required',
                company: 'company is required'
            },
            machineDashboard: {
                unitLife: {
                    heading: 'Unit Life and PM Rolling 365 Days',
                    sortThreshold: 'sort threshold',
                    installDate: 'install date',
                    preventativeMaintenance: 'preventative maintenance(s)',
                    lastPreventativeMaintenance: 'last preventative maintenance',
                    nextPreventativeMaintenance: 'next preventative maintenance',
                    fromLastPreventativeMaintenance: 'from last preventative maintenance',
                    lifeTimeCount: 'life time count',
                    volumeLimit: 'volume limit : ',
                    dispatchCases: 'Dispatch Cases',
                    phoneFix: 'Phone Fix',
                    notesCount: 'Last PM Notes Count',
                    coinsCount: 'Last PM Coins Count',
                    execHeading: 'unit life and PM rolling 365 days',
                }
            },
            thresholdList: {
                low: 'low',
                high: 'high',
                medium: 'medium'
            },
            homePage: {
                title: 'RRS Customer Portal',
                customerPortal: 'customer portal',
                goToDashboard: 'go to dashboard',
                signIn: 'sign in',
                getAccess: 'get access',
                comingSoon: 'future feature...',
                signinSection: {
                    title: 'introducing your revolution companion',
                    heading: 'reports analytics & insights',
                    description: 'Available at your Fingertips through Revolution Customer Portal'
                },
                customerSection: {
                    why: 'why',
                    heading: 'customer portal?',
                    description: 'The RRS Customer Portal is a user friendly state of the art enterprise'
                        + ' software application designed to drive performance management and enhance '
                        + 'visibility into key business drivers which enable Executives,'
                        + ' Business Unit Managers and Functional Staff the ability to review, analyze, '
                        + 'and make informed business operations decisions in near real-time. '
                },
                executiveDashboard: {
                    heading: 'executive dashboard',
                    description: 'The Executive Dashboard provides Company Executives high level '
                        + 'business insights into business operations which enables Executives to make '
                        + 'informed business decisions.  Additionally, the Executive Dashboard saves '
                        + 'Executives time by displaying key measures and performance data of their business'
                        + ' in near real-time all in one centrally located portal.'
                },
                realTimeAnalytics: {
                    heading: 'timely analytics',
                    description: `Drill down into your business's daily, weekly, monthly and yearly data`
                        + ` to review, analyze and forecast business needs and goals for the future.`
                },
                alertsByMetrics: {
                    heading: 'alerts by metrics',
                    description: 'The Alerts by Metrics provides Company Executives high level business '
                        + 'insights into business operations which enables Executives to make informed '
                        + 'business decisions.  Additionally, the Alerts by Metrics saves Executives time by'
                        + ' displaying key measures and performance data of their business in near real-time '
                        + 'all in one centrally located portal.'
                },
                predictiveAnalytics: {
                    heading: 'predictive analytics',
                    description: 'The Predictive Analytics section of the Customer Portal provides '
                        + 'advanced analytics of RRS Revolution Cash Management Machines.  Predictive '
                        + 'Analytics goes beyond knowing what happened and presents the likelihood of future '
                        + 'events happening.  For example, predictive analytics enables Customer '
                        + 'Organizations the ability to forecast when components of the Revolution may expire '
                        + 'earlier than the factory and supplier date. '
                },
                mobileApplication: {
                    heading: 'Mobile Application',
                    description: `Have your Revolution at your finger tips at all times, on the go, so`
                        + ` you can keep a close eye on your business as you're managing your teams and projects or away from the office.`,
                    extendedDescription: 'Customer Portal is both Mobile and Web responsive and supports iOS, Android & Windows'
                },
                ourCustomers: {
                    heading: 'Our Customers',
                    description: 'Join the Revolution to manage your Reports, Analytics & Data'
                },
                getAccessSection: {
                    heading: 'get access',
                    description: 'contact us with the below details'
                },
                footer: {
                    copyRight: '© revolution retail systems, 2018. all rights reserved.',
                    menuList: {
                        about: 'about',
                        solutions: 'solutions',
                        customers: 'customers',
                        contact: 'contact'
                    }
                }
            }
        }
    };

    static get average(): string {
        return Languages.get('global.average');
    }

    static get target(): string {
        return Languages.get('global.target');
    }

    static get(key: string, toCase?: CaseConversion, locale?: string) {
        let value: string;
        locale = _.has(this.locales, `[${locale}]`) ? locale : AppConfiguration.global.locale;
        value = _.get(this.locales, `['${locale}'].${key}`, _.get(this.locales, `['en-US'].${key}`, ''));
        switch (toCase) {
            case 'upper':
            case 'toUpper':
            case 'toUpperCase':
                value = _.toUpper(value);
                break;
            case 'lower':
            case 'toLower':
            case 'toLowerCase':
                value = _.toLower(value);
                break;
            case 'capitalize':
            case 'sentence':
                value = _.capitalize(value);
                break;
            case 'start':
            case 'startCase':
            case 'capitalizeEach':
                value = value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                break;
            case 'capitalizeFirst':
                value = value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
                break;
        }
        return value;
    }
}

enum PeriodValue {
    'pasttwelvemonths' = 0,
    'pastsixmonths' = 1,
    'pastthirtydays' = 2,
    'pastsevendays' = 3
}

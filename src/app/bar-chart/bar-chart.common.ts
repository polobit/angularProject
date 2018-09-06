import * as moment from 'moment';
import * as _ from 'lodash';
import { AppConfiguration } from '../app.configuration';
import { IChartData } from '../app.interface';

export class BarChart {
    protected chartData: IChartData[];

    constructor() {}

    public getDataByDate(date: string | moment.Moment, data?: {}[]) {
        return _.find(data || this.chartData, ['caseDate', date]);
    }

    protected findLastDate() {
        return _.maxBy(this.chartData, data => moment(data.caseDate, AppConfiguration.global.apiTimeFormat, true)).caseDate;
    }

    protected nullifyObject(rawObject: any) {
        return _.isObjectLike(rawObject) ?
            _.forOwn(rawObject, (value, key, objectRef) => objectRef[key] = this.nullifyObject(value)) :
            typeof rawObject === 'number' || 'object' ? 0 : typeof rawObject === 'boolean' ? false : '';
    }

    protected fillMissingDates(rawData?: Array<any>, dateProperty?: string, days?: any) {
        rawData = rawData || this.chartData;
        dateProperty = dateProperty || 'caseDate';
        days = days ? days : '30 days';
        const daysParsed = days.split(' ');
        const dataSample = this.nullifyObject(_.cloneDeep(rawData[0]));
        const allDates = _.reduceRight(Array(_.toNumber(daysParsed[0])).fill(0),
            (...args) => {
                args[0].push(moment().subtract(daysParsed[1].substr(0, 3) === 'day' ? args[2] + 1 : args[2], daysParsed[1])
                    .format(AppConfiguration.global.apiTimeFormat));
                return args[0];
            },
            []);
        return allDates.map(value =>
            _.find(rawData, [dateProperty, value]) || _.merge({}, dataSample, {[dateProperty]: value}));
    }
}

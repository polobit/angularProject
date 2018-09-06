import { MatPaginatorIntl } from '@angular/material';
import { Languages } from '../app.configuration';
import { Injectable } from '@angular/core';

@Injectable()
export class BarChartPaginator extends MatPaginatorIntl {

    // itemsPerPageLabel = '';

    getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `Nothing to display`;
        }
        return `${Languages.get('global.page', 'start')} ${page + 1} ${Languages.get('global.of')} ${Math.ceil(length / pageSize)}`;
    }
}

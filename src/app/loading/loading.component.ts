import { Component, OnInit } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
    isTimeout = false;
    Languages = Languages;

    constructor() {}

    ngOnInit() {
        setTimeout(() => this.isTimeout = true, AppConfiguration.global.api.timeOut * 1000);
    }
}

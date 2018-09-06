import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const noop = function (): void {};

if (environment.production || environment.qual) {
    enableProdMode();
    console.log = noop;
}

platformBrowserDynamic().bootstrapModule(AppModule);

import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getHeaderLogo() {
    return element(by.css('app-root .mat-toolbar img.logo'));
  }
}

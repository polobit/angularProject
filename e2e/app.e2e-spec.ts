import { AppPage } from './app.po';

describe('RRS App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should show RRS logo in the header', () => {
    page.navigateTo();
    expect(page.getHeaderLogo()).toBeDefined();
  });
});

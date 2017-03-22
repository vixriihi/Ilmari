import { IlmariPage } from './app.po';

describe('ilmari App', function() {
  let page: IlmariPage;

  beforeEach(() => {
    page = new IlmariPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

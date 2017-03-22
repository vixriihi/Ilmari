import { browser, element, by } from 'protractor';

export class IlmariPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('ilm-root h1')).getText();
  }
}

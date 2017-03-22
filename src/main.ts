import './polyfills.ts';
import './rxjs-operators';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { IlmModule } from './app/ilm.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(IlmModule);

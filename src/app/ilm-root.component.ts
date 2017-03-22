import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdDialog, MdIconRegistry, MdSidenav, MdSlideToggleChange, MdSnackBar } from '@angular/material';
import { FormComponent } from './form/form.component';
import { LocationStoreService } from './services/location-store.service';
import { FormService } from './services/form.service';
import { environment } from '../environments/environment';
import { InfoComponent } from './info/info.component';
import { DocumentDatabase } from './db/document.database';
import { StoreDatabase } from './db/store.database';
import { UserService } from './services/user.service';
import { Observable } from 'rxjs/Observable';
import { TaxaDatabase } from './db/taxa.database';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'ilm-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['ilm.component.css']
})
export class IlmRootComponent implements OnInit {
   constructor(
    sanitizer: DomSanitizer,
    iconRegistry: MdIconRegistry
  ) {
    iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/icons.svg'));
  }

  ngOnInit() {

  }
}

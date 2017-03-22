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
import { Stored, StoreService } from './services/store.service';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'ilm-root',
  templateUrl: 'ilm.component.html',
  styleUrls: ['ilm.component.css']
})
export class IlmComponent implements OnInit {
  @ViewChild(FormComponent) form: FormComponent;
  @ViewChild(MdSidenav) sideNav: MdSidenav;
  activePage = 'form';
  savePublically = false;
  record = false;
  records = 0;
  imageRights;
  forms$;

  constructor(
    sanitizer: DomSanitizer,
    iconRegistry: MdIconRegistry,
    private docDB: DocumentDatabase,
    private storeDB: StoreDatabase,
    private taxaDB: TaxaDatabase,
    private storeService: StoreService,
    private locationService: LocationStoreService,
    public snackBar: MdSnackBar,
    public formService: FormService,
    public userService: UserService,
    public dialog: MdDialog,
    public loaderService: LoaderService
  ) {
    iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/icons.svg'));
  }

  ngOnInit() {
    this.checkLogin();
    this.formService.getForm(environment.imageForm)
      .map(form => form.fields || [])
      .map(fields => fields.filter(field => field.name === 'intellectualRights')[0] || {})
      .map(rights => {
        const options = rights.options && rights.options.value_options || {};
        return {
          title: (rights.label || '').toLowerCase(),
          select: Object.keys(options).map(key => ({key: key, value: options[key]})) || []};
      })
      .subscribe(form => this.imageRights = form);
    this.forms$ = this.formService.getAll();
  }

  onSend() {
    this.record = false;
    this.records = 0;
  }

  onSave() {
    this.records++;
  }

  toggleRecording(record: MdSlideToggleChange) {
    if (record.checked) {
      this.record = record.checked;
      this.record ?
        this.locationService.startRecording() :
        this.locationService.stopRecording();
    }
  }

  checkLogin() {
    this.userService.getUser(false)
      .catch(err => {
        this.showLogin();
        return Observable.of({});
      })
      .subscribe();
  }

  showLogin() {
    const dialog = this.dialog.open(LoginComponent, {
      disableClose: true,
      height: '100%',
      width: '95%'
    });
    dialog.afterClosed().subscribe(data => {
      console.log('CLOSED with', data);
      this.storeService.put(Stored.USER_TOKEN, data)
        .subscribe(() => this.checkLogin());
    });
  }

  clearLocal() {
    this.docDB.destroy();
    this.storeDB.destroy();
    this.taxaDB.destroy();
    this.snackBar.open('Tiedot poistettu', undefined, {
      duration: 1500
    });
  }

  openInfo(type) {
    const dialog = this.dialog.open(InfoComponent, {width: '350px'});
    dialog.componentInstance.info = type;
  }

  showPage(page) {
    this.activePage = page;
    this.sideNav.close();
  }
}

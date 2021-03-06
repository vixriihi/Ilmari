import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdDialog, MdDialogRef, MdIconRegistry, MdSidenav, MdSlideToggleChange, MdSnackBar } from '@angular/material';
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
import { DialogsService } from './services/dialog.service';
import { WindowRef } from './ref/window.ref';

@Component({
  selector: 'ilm-root',
  templateUrl: 'ilm.component.html',
  styleUrls: ['ilm.component.css']
})
export class IlmComponent implements OnInit {
  @ViewChild(FormComponent) form: FormComponent;
  @ViewChild(MdSidenav) sideNav: MdSidenav;
  record = false;
  records = 0;
  activePage = 'form';
  nearMeActive = false;
  currentVersion = 2;
  savePublicly = false;
  imageRights;
  version;
  forms$;

  constructor(
    sanitizer: DomSanitizer,
    iconRegistry: MdIconRegistry,
    private windowRef: WindowRef,
    private docDB: DocumentDatabase,
    private storeDB: StoreDatabase,
    private taxaDB: TaxaDatabase,
    private storeService: StoreService,
    private locationService: LocationStoreService,
    private dialogService: DialogsService,
    public snackBar: MdSnackBar,
    public formService: FormService,
    public userService: UserService,
    public dialog: MdDialog
  ) {
    this.version = environment.version;
    iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/icons.svg'));
  }

  ngOnInit() {
    // this._clearLocal();
    this.checkLogin();
    Observable.forkJoin(
      this.locationService.isRecording()
        .switchMap(recording => recording ?
          this.dialogService.confirm('Haluatko jatkaa', 'siitä mihin jäit') :
          Observable.of(false)
        )
        .do(recording => recording ? this.locationService.resumeRecording() : this.form.resetForm(true)),
      this.storeService.get(Stored.FORM_STATES, []),
      this.formService.getForm(environment.imageForm)
        .map(form => form.fields || [])
        .map(fields => fields.filter(field => field.name === 'intellectualRights')[0] || {})
        .map(rights => {
          const options = rights.options && rights.options.value_options || {};
          return {
            title: (rights.label || '').toLowerCase(),
            select: Object.keys(options).map(key => ({key: key, value: options[key]})) || []};
        })
    ).subscribe(data => {
      this.record = data[0];
      this.records = this.record ? data[1].length : 0;
      this.imageRights = data[2];
    });
    this.forms$ = this.formService.getAll();
  }

  onSend() {
    this.record = false;
    this.records = 0;
  }

  onSave() {
    this.records++;
  }
  onRemove() {
    this.records--;
  }

  toggleRecording(record: MdSlideToggleChange) {
    if (record.checked) {
      this.record = record.checked;
      this.record ?
        this.locationService.startRecording() :
        this.locationService.stopRecording();
      this.records = 0;
    }
  }

  checkLogin() {
    this.storeService.get(Stored.ACCEPTED_VERSION, 0)
      .switchMap(version => {
        if (this.currentVersion !== version) {
          this.openInfo('accepted', { disableClose: true })
            .afterClosed()
            .switchMap(accept => {
              return accept ? this.storeService.put(Stored.ACCEPTED_VERSION, this.currentVersion)
                : Observable.of({});
            })
            .subscribe(accept => this.checkLogin());
          return Observable.of({});
        }
        return this.userService.getUser(false)
          .catch(() => {
            this.showLogin();
            return Observable.of({});
          });
      })
      .subscribe();
  }

  showLogin() {
    const dialog = this.dialog.open(LoginComponent, {
      disableClose: true,
      height: '100%',
      width: '95%'
    });
    dialog.afterClosed()
      .switchMap(data => this.storeService.put(Stored.USER_TOKEN, data))
      .subscribe(() => this.checkLogin());
  }

  clearLocal() {
    this.dialogService.confirm('Oletko varma että', 'haluat tyhjentään kaikki paikallisesti tallennetun datan?')
      .subscribe((confirm) =>  {
        if (confirm) {
          this._clearLocal();
        }
      });
  }

  openInfo(type, options: any = {}): MdDialogRef<InfoComponent> {
    const dialog = this.dialog.open(InfoComponent, options);
    dialog.componentInstance.info = type;
    return dialog;
  }

  showPage(page) {
    if (page === 'nearMe') {
      this.nearMeActive = true;
    }
    this.activePage = page;
    this.sideNav.close();
  }

  private _clearLocal() {
    this.docDB.destroy();
    this.storeDB.destroy();
    this.taxaDB.destroy();
    this.snackBar.open('Tiedot poistettu', undefined, {duration: 1500})
      .afterDismissed()
      .subscribe(() => this.windowRef.nativeWindow.location.reload());
  }
}

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AutocompleteService, TaxonAutocomplete } from '../services/autocomplete.service';
import { FormControl } from '@angular/forms';
import { MdDialog, MdSnackBar } from '@angular/material';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { MapDialogComponent } from '../map-dialog/map-dialog.component';
import { FileListComponent } from './file-list/file-list.component';
import { Stored, StoreService } from '../services/store.service';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { FormState } from './form.reducer';
import { AppState } from '../reducers/index';
import { FormActions } from './form.actions';
import { ExtraComponent } from './extra/extra.component';
import { DocumentService } from '../services/document.service';
import { SpeechInputComponent } from './speech-input/speech-input.component';
import { LocationStoreService } from '../services/location-store.service';
import { SpeechResponse } from './speech-input/types/speech-type.interface';
import { DialogsService } from '../services/dialog.service';

@Component({
  selector: 'ilm-form',
  templateUrl: './form.component.html',
  styleUrls: ['form.component.scss', 'form-host.css']
})
export class FormComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(ExtraComponent) extras: ExtraComponent;
  @ViewChild(FileListComponent) files: FileListComponent;
  @ViewChild(SpeechInputComponent) speech: SpeechInputComponent;
  @ViewChild('ilmForm') form;

  @Input() record: boolean;
  @Output() onSave = new EventEmitter();
  @Output() onRemove = new EventEmitter();
  @Output() onDocumentSend = new EventEmitter();

  formStates: FormState[] = [];
  formState: Observable<FormState>;
  nameControl = new FormControl();
  filteredOptions: Observable<TaxonAutocomplete[]>;
  activeGroup: InformalTaxonGroup = {id: 'MVL.1', icon: 'MVL-1', name: 'Linnut'};
  extra = {};
  parsed = {};
  hasName = false;
  useSpeech = false;
  fields = [];

  private currentExtra = '';
  private changeSub: Subscription;

  constructor(

    public dialog: MdDialog,
    public snackBar: MdSnackBar,
    private store: Store<AppState>,
    private formActions: FormActions,
    private storeService: StoreService,
    private dialogService: DialogsService,
    private documentService: DocumentService,
    private locationService: LocationStoreService,
    private autocompleteService: AutocompleteService
  ) {
    this.formState = this.store.select<FormState>(state => state.form);
  }

  ngOnInit() {
    this.resetForm();
    Observable.forkJoin(
      this.storeService.get(Stored.FORM_STATE, false),
      this.storeService.get(Stored.USE_SPEECH, this.useSpeech),
      this.storeService.get(Stored.FORM_STATES, this.formStates),
      this.storeService.get(Stored.ACTIVE_GROUP, this.activeGroup)
    )
      .subscribe(data => {
        this.setState(data[0]);
        this.useSpeech = data[1];
        this.formStates = data[2];
        this.activeGroup = data[3];
      });
    this.filteredOptions = this.nameControl.valueChanges
      .do(name => typeof name === 'object' ? this.store.dispatch(this.formActions.updateName(name)) : '')
      .do(name => this.hasName = !!(name && name.value || ''))
      .map(name => this.autocompleteService.makeValue(name))
      .debounceTime(400)
      .switchMap(name => this.autocompleteService.filterByTaxon(name && name.value || '', this.activeGroup.id));
    this.changeSub = this.formState
      .debounceTime(3000)
      .distinctUntilChanged()
      .subscribe(values => this.saveState(values));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['group']) {
      this.resetForm();
    }
  }

  ngOnDestroy() {
    this.changeSub.unsubscribe();
  }

  save(): Observable<FormState> {
    return this.formState
      .take(1)
      .switchMap((data: FormState) => {
        if (this.speech) {
          this.speech.stopSpeech();
        }
        data.group = this.activeGroup.id;
        const extras = JSON.parse(JSON.stringify(data.extra));
        const document: FormState = JSON.parse(JSON.stringify(data));
        document.images = this.files.images.reduce((cum, curr) => curr.id ? [...cum, curr.id] : cum, []);
        this.autocompleteService.addUsedTaxon(data.name, this.activeGroup.id);
        this.store.dispatch(this.formActions.reset());
        this.storeService.set(Stored.FORM_STATE, false);
        this.extras.emptyUnit(extras);
        this.files.reset();
        return Observable.of(document);
      });
  }

  hereAndNow() {
    this.store.dispatch(this.formActions.dateToNow());
    this.store.dispatch(this.formActions.locationToHere());
  }

  resetForm(all = false) {
    this.resetName();
    this.parsed = {};
    if (all) {
      this.updateFormStates([]);
    }
  }

  displayTaxon(taxon: TaxonAutocomplete) {
    return taxon ? taxon.value : taxon;
  }

  selectGroup(group) {
    this.activeGroup = group;
    this.storeService.set(Stored.ACTIVE_GROUP, group);
    this.nameControl.setValue('');
  }

  showMap() {
    const mapDialog = this.dialog.open(MapDialogComponent, {height: '95%', width: '95%'});
    mapDialog.afterClosed()
      .switchMap(() => mapDialog.componentInstance.location)
      .take(1)
      .subscribe(location => {
        this.store.dispatch(this.formActions.updateLocation(location));
      });
  }

  saveState(value) {
    this.storeService.set(Stored.FORM_STATE, value);
  }

  updateExtra(value) {
    if (value && Object.keys(value).length > 0) {
      const key = JSON.stringify(value);
      if (this.currentExtra !== key) {
        this.currentExtra = key;
        this.store.dispatch(this.formActions.updateExtra(value));
      }
    }
  }

  updateDate(value) {
    this.store.dispatch(this.formActions.updateDate(value));
  }

  addUnit() {
    this.save().subscribe(data => {
      this.updateFormStates([...this.formStates, data]);
      this.onSave.emit(data);
      this.snackBar.open('Havainto lisätty', undefined, {
        duration: 1500
      });
    });
  }

  sendDocument() {
    this.save()
      .switchMap(data => this.documentService.formStatesToDocument(
        this.locationService.isCurrentlyRecording() ? this.formStates : [data],
        this.locationService.getGathering()
      ))
      .switchMap(document => {
        const hasData = !this.documentService.isEmpty(document);
        this.onDocumentSend.emit(JSON.parse(JSON.stringify(this.formStates)));
        this.updateFormStates([]);
        this.locationService.stopRecording();
        if (hasData) {
          this.documentService.sendDocument(document);
        }
        return Observable.of(hasData);
      })
      .do(hasData => this.snackBar.open(hasData ? 'Havaintoerä lähetetty' : 'Tyhjennetty', undefined, {duration: 1500}))
      .subscribe();
  }

  setState(state: FormState) {
    if (state) {
      this.store.dispatch(this.formActions.updateState(state));
    }
  }

  removeState(idx) {
    this.dialogService.confirm('Oletko varma että' , 'haluat poistaa kyseisen havainnon?')
      .subscribe(confirm => {
        if (confirm) {
          this.onRemove.emit(true);
          this.updateFormStates([
            ...this.formStates.slice(0, idx),
            ...this.formStates.slice(idx + 1)
          ]);
        }
      });
  }

  onSettingChange(settings) {
    this.useSpeech = settings.useSpeech;
  }

  setUserFields(fields) {
    this.fields = [
      {
        label: 'nimi',
        path: 'name',
        type: 'autocomplete',
        root: true
      },
      {
        label: 'aika',
        path: 'time',
        type: 'datetime',
        root: true
      },
      {
        label: 'paikka',
        path: 'location',
        type: 'text',
        root: true
      },
      ...fields,
      {
        label: 'Tallenna (kyllä/ei)',
        type: 'send',
        path: 'submit',
        root: true
      }
    ];
  }

  setValueBySpeech(value: SpeechResponse) {
    if (value.field.root) {
      switch (value.field.path) {
        case 'name':
          this.store.dispatch(this.formActions.updateName(value.result.value));
          break;
        case 'time':
          this.updateDate(value.result.value);
          break;
        case 'location':
          this.store.dispatch(this.formActions.locationToHere());
          break;
        case 'submit':
          this.record ?
            this.addUnit() :
            this.sendDocument();
          break;
      }
      return;
    }
    return this.formState
      .take(1)
      .subscribe(data => {
        data.extra[value.field.path] = value.result.value;
        this.updateExtra(data.extra);
      });
  }

  private updateFormStates(states) {
    this.formStates = states;
    this.storeService.set(Stored.FORM_STATES, states);
  }

  private resetName() {
    this.nameControl.setValue('');
    this.nameControl.markAsTouched();
  }
}

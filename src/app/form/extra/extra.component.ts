import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormService } from '../../services/form.service';
import { Stored, StoreService } from '../../services/store.service';
import { Field } from './field/field.component';
import { MdDialog } from '@angular/material';
import { SettingsComponent } from './settings/settings.component';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'ilm-extra',
  templateUrl: './extra.component.html',
  styleUrls: ['./extra.component.css']
})
export class ExtraComponent implements OnInit, OnChanges {
  @Input() groupId;
  @Input() value = {};
  @Output() valueChange = new EventEmitter<any>();
  @Output() settingsChange = new EventEmitter<any>();
  @Output() userFieldsChange = new EventEmitter<any>();

  formId = 'JX.519';
  imageRights = 'MZ.intellectualRightsARR';
  savePublicly = true;
  subItems = ['collection', 'fieldset'];
  skip = ['editors', 'dateBegin', 'dateEnd', 'geometry', 'images', 'taxon', 'taxonID'];
  field: any;
  fields = [];
  allFields = [];
  userFormFields: {[formId: string]: string[]} = {};
  settingsDialog: SettingsComponent;
  useSpeech = false;
  overrideFields = {
    'leg': {
      'label': 'Muut havainnoitsijat'
    }
  };

  constructor(
    private formService: FormService,
    private storeService: StoreService,
    public dialog: MdDialog
  ) {
    Observable.forkJoin(
      this.storeService.get(Stored.ACTIVE_FORM, this.formId),
      this.storeService.get(Stored.USE_SPEECH, this.useSpeech),
      this.storeService.get(Stored.IMAGE_RIGHTS, this.imageRights),
      this.storeService.get(Stored.SAVE_PUBLIC, this.savePublicly),
      this.storeService.get(Stored.SELECTED_FIELDS, {})
    ).subscribe(data => {
      this.formId = data[0];
      this.useSpeech = data[1];
      this.imageRights = data[2];
      this.savePublicly = data[3];
      this.userFormFields = data[4];
    });
  }

  ngOnInit() {
    this.initFormData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['groupId']) {
      this.initFormData();
    }
  }

  initFormData() {
    if (!this.formId || !this.groupId) {
      return;
    }
    this.formService.getForm(this.formId)
      .map(form => this.pickFields(form || {}))
      .map(fields => fields.sort((a, b) => (a.title  === b.title) ? 0 : (a.title > b.title) ? 1 : -1 ))
      .do(fields => this.allFields = fields )
      .map(fields => this.pickSelectedFields(fields))
      .subscribe(fields => {
        this.fields = fields;
        this.setDefaultValues();
        this.userFieldsChange.emit(this.fields);
        if (this.settingsDialog) {
          this.settingsDialog.allFields = this.allFields;
          this.settingsDialog.userSelected = this.userFormFields[this.formId] || [];
          this.settingsDialog.initFields();
        }
      });
  }

  pickSelectedFields(fields) {
    return (this.userFormFields[this.formId] || [])
      .map(path => fields.filter(field => field.path === path)[0] || undefined)
      .filter(value => value !== undefined);
  }

  emptyUnit(extras) {
    this.setDefaultValues(true);
    Object.keys(extras).map(path => {
      if (path.indexOf('/units/') === -1) {
        this.value[path] = extras[path];
      }
    });
    this.valueChange.emit(this.value);
  }

  setDefaultValues(reset = false) {
    if (!this.fields) {
      return;
    }
    this.value = this.fields.reduce((prev, curr) => {
      if (reset || typeof this.value[curr.path] === 'undefined') {
        prev[curr.path] = this.pickDefault(curr);
      }
      return prev;
    }, {});
  }

  pickDefault(field: Field) {
    if (field.options && field.options.default) {
      return field.options.default;
    } else if (field.type === 'fieldset') {
      return {};
    } else if (field.type === 'collection') {
      return [];
    } else if (field.type === 'boolean') {
      return false;
    }
    return '';
  }

  pickFields(form, path = '', level = 'document', result = []) {
    if (form.fields) {
      form.fields.map(field => {
        if (this.subItems.indexOf(field.type) > -1 && field.fields) {
          this.pickFields(
            field, field.type === 'collection' ? path + '/' + field.name + '/*' : path + '/' + field.name, field.name, result
          );
        } else if (this.skip.indexOf(field.name) === -1) {
          if (this.overrideFields[field.name]) {
            field = Object.assign({}, field, this.overrideFields[field.name]);
          }
          field['path'] = path + '/' + field.name;
          field['level'] = level;
          result.push(field);
        }
      });
    }
    return result;
  }

  onFieldChange(path, value) {
    this.value[path] = value;
    this.valueChange.emit(this.value);
  }

  openFieldSelectDialog() {
    const dialogRef = this.dialog.open(SettingsComponent, {disableClose: true, height: '100%', width: '95%'});
    this.settingsDialog = dialogRef.componentInstance;
    this.setSettingDialog(this.settingsDialog);
    const onFormChange = this.settingsDialog.onFormSelect.subscribe(formId => {
      this.userFormFields[this.formId] = (dialogRef.componentInstance._selectedFields || []).map(field => field.path);
      this.formId = formId;
      this.initFormData();
      this.storeService.set(Stored.ACTIVE_FORM, formId);
    });
    dialogRef.afterClosed().subscribe(result => {
      onFormChange.unsubscribe();
      this.updateSettings(result);
    });
  }

  private setSettingDialog(component: SettingsComponent) {
    component.userSelected = this.userFormFields[this.formId] || [];
    component.allFields = this.allFields;
    component.selectedForm = this.formId;
    component.selectedImageRights = this.imageRights;
    component.savePublicly = this.savePublicly;
    component.useSpeech = this.useSpeech;
  }

  private updateSettings(result) {
    this.userFormFields[this.formId] = (result.selectedFields || []).map(field => field.path);
    this.imageRights = result.selectedImageRights;
    this.savePublicly = result.savePublicly;
    this.useSpeech = result.useSpeech;
    this.fields = this.pickSelectedFields(this.allFields);
    this.storeService.set(Stored.IMAGE_RIGHTS, this.imageRights);
    this.storeService.set(Stored.SAVE_PUBLIC, this.savePublicly);
    this.storeService.set(Stored.USE_SPEECH, this.useSpeech);
    this.storeService.set(Stored.SELECTED_FIELDS, this.userFormFields);
    this.setDefaultValues(true);
    this.settingsDialog = null;
    this.userFieldsChange.emit(this.fields);
    this.settingsChange.emit({
      useSpeech: this.useSpeech
    });
  }

}

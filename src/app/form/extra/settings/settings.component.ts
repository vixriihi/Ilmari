import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Field } from '../field/field.component';
import { MdDialogRef } from '@angular/material';
import { FormService } from '../../../services/form.service';
import { environment } from '../../../../environments/environment';
import { SpeechService } from '../../../services/speech.service';

@Component({
  selector: 'ilm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnChanges {

  @Input() allFields: Field[];
  @Input() userSelected: string[];
  @Input() selectedForm = 'JX.519';
  @Input() selectedImageRights = 'MZ.intellectualRightsARR';
  @Input() savePublicly = true;
  @Input() useSpeech = false;

  @Output() onFormSelect = new EventEmitter<string>();
  @Output() onImageRightsSelect = new EventEmitter<string>();
  @Output() onSavePublicallyChange = new EventEmitter<boolean>();
  @Output() onSpeechChange = new EventEmitter<boolean>();

  imageRights;
  forms$;
  isSpeechCapable = false;
  _selectedFields: Field[] = [];
  _fields: Field[] = [];


  constructor(
    public dialogRef: MdDialogRef<SettingsComponent>,
    public formService: FormService,
    private speechService: SpeechService
  ) {
  }

  ngOnInit() {
    this.isSpeechCapable = this.speechService.hasSpeechSupport();
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
    this.initFields();
  }

  ngOnChanges() {
    this.initFields();
  }

  initFields() {
    if (!this.allFields || !this.userSelected) {
      return;
    }
    const ref = {};
    this.allFields.map(field => { ref[field.path] = field; });
    this._selectedFields = this.userSelected.map(path => ref[path]).filter(field => typeof field !== 'undefined');
    this._fields = this.allFields.filter(field => this.userSelected.indexOf(field.path) === -1);
    this._sortFields();
  }

  unselect(field: Field) {
    const idx = this._selectedFields.indexOf(field);
    if (idx === -1) {
      return;
    }
    this._selectedFields.splice(idx, 1);
    this._fields.push(field);
    this._sortFields();
  }

  select(field: Field) {
    const idx = this._fields.indexOf(field);
    if (idx === -1) {
      return;
    }
    this._fields.splice(idx, 1);
    this._selectedFields.push(field);
  }

  moveUp(field: Field) {
    this._move(field, -1);
  }

  moveDown(field: Field) {
    this._move(field, 1);
  }

  togglePublic() {
    this.savePublicly = !this.savePublicly;
    this.onSavePublicallyChange.emit(this.savePublicly);
  }

  toggleSpeech() {
    this.useSpeech = !this.useSpeech;
    this.onSpeechChange.emit(this.useSpeech);
  }

  close() {
    this.dialogRef.close({
      selectedForm: this.selectedForm,
      savePublicly: this.savePublicly,
      useSpeech: this.useSpeech,
      selectedImageRights: this.selectedImageRights,
      selectedFields: this._selectedFields
    });
  }

  _move(field: Field, delta: number) {
    const idx = this._selectedFields.indexOf(field);
    if (idx === -1) {
      return;
    }
    const tmp = this._selectedFields[idx];
    this._selectedFields[idx] = this._selectedFields[idx + delta];
    this._selectedFields[idx + delta] = tmp;
  }

  _sortFields() {
    this._fields = this._fields.sort((a, b) => (a.label  === b.label) ? 0 : (a.label > b.label) ? 1 : -1 );
  }

}

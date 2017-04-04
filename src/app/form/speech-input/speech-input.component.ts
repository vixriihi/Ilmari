import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { SpeechService } from '../../services/speech.service';
import { Subscription } from 'rxjs/Subscription';
import { BooleanType } from './types/boolean.type';
import { TextType } from './types/text.type';
import { AnalysedResponse, SpeechResponse, SpeechTypeInterface } from './types/speech-type.interface';
import { Observable } from 'rxjs/Observable';
import { DatetimeType } from './types/datetime.type';
import { AutocompleteType } from './types/autocomplete.type';
import { SelectType } from './types/select.type';

@Component({
  selector: 'ilm-speech-input',
  templateUrl: './speech-input.component.html',
  styleUrls: ['./speech-input.component.css'],
  providers: [
    AutocompleteType,
    BooleanType,
    DatetimeType,
    TextType,
    SelectType
  ]
})
export class SpeechInputComponent implements OnInit, OnDestroy {

  @Input() fields = [];
  @Input() group = '';
  @Output() onValue = new EventEmitter<SpeechResponse>();
  hasSpeechSupport;
  speechRecording = false;
  label = '';
  idx = 0;
  types = {};

  private speechSub: Subscription;

  constructor(
    private speechService: SpeechService,
    private zone: NgZone,
    booleanType: BooleanType,
    textType: TextType,
    datetimeType: DatetimeType,
    autocompleteType: AutocompleteType,
    selectType: SelectType,
  ) {
    this.hasSpeechSupport = speechService.hasSpeechSupport();
    this.types = {
      'autocomplete': autocompleteType,
      'checkbox': booleanType,
      'text': textType,
      'datetime': datetimeType,
      'select': selectType
    };
  }

  ngOnInit() {
    this.speechSub = this.speechService.getObserver()
      .switchMap(value => this.analyzeResponse(value, this.fields[this.idx]))
      .subscribe((response: AnalysedResponse) => {
        if (response.transcribed.toLowerCase() === 'takaisin') {
          if (this.idx > 0) {
            this.idx--;
            this.setlabel(this.fields[this.idx]);
          }
        } else if (response.transcribed.toLowerCase() === 'seuraava' || response.moveToNext) {
          if (response.moveToNext && response.transcribed.toLowerCase() !== 'seuraava' ) {
            this.setFieldValue(response, this.fields[this.idx]);
          }
          this.idx++;
          this.fields[this.idx] ?
            this.setlabel(this.fields[this.idx]) :
            this.stopSpeech();
        }
        this.zone.run(() => {});
      });
  }

  ngOnDestroy() {
    if (this.speechSub) {
      this.speechSub.unsubscribe();
    }
  }

  startSpeech() {
    this.speechRecording = true;
    this.idx = 0;
    this.setlabel(this.fields[0]);
    this.speechService.startRecording();
  }

  stopSpeech() {
    this.speechRecording = false;
    this.speechService.stopRecording();
  }

  setlabel(field) {
    this.label = this.getSpeechType(field).getLabel(field);
  }

  analyzeResponse(value, field): Observable<AnalysedResponse>  {
    return this.getSpeechType(field).analyseResponse(value, field, {group: this.group});
  }

  setFieldValue(response: AnalysedResponse, field) {
    this.onValue.emit({
      result: response,
      field: field
    });
  }

  getSpeechType(field: any): SpeechTypeInterface {
    if (this.types[field.type]) {
      return this.types[field.type];
    }
    return this.types['text'];
  }

}

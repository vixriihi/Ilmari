import { Injectable } from '@angular/core';
import { AnalysedResponse, SpeechTypeInterface } from './speech-type.interface';
import { Observable } from 'rxjs/Observable';
import { MdDialog } from '@angular/material';
import { SpeechSelectComponent } from './speech-select/speech-select.component';
import { SpeechService } from '../../../services/speech.service';

@Injectable()
export class SelectType implements SpeechTypeInterface {

  private _dialog;

  constructor(
    public dialog: MdDialog,
    private speechService: SpeechService
  ) { }

  getLabel(field: any): string {
    const options = field.options && field.options.value_options || {};
    this._dialog = this.dialog.open(SpeechSelectComponent, {height: '80%', width: '95%' });
    this._dialog.componentInstance.valueOptions = Object.keys(options).reduce((cum, cur) => {
      if (cur) {
        cum.push({
          value: options[cur],
          key: cur
        });
      }
      return cum;
    }, []);
    this._dialog.afterClosed()
      .take(1)
      .subscribe(result => {
        if (result) {
          this.speechService.sendResult(result);
        }
      });
    return field.label;
  }

  analyseResponse(response: string, field: any): Observable<AnalysedResponse> {
    this._dialog.close(false);
    const possible = [];
    const options = field.options && field.options.value_options || {};
    response = (response || '').toLowerCase();
    Object.keys(options).map(key => {
      if (options[key].toLowerCase().indexOf(response) > -1) {
        possible.push({
          value: options[key],
          key: key
        });
      }
    });
    return Observable.of({
      transcribed: response,
      moveToNext: true,
      value: possible[0] && possible[0].key || field.options && field.options.default || ''
    });
  }
}

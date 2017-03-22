import { Injectable } from '@angular/core';
import { SpeechTypeInterface, AnalysedResponse } from './speech-type.interface';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DatetimeType implements SpeechTypeInterface {

  constructor() { }

  getLabel(field: any): string {
    return field.label;
  }

  analyseResponse(response: string): Observable<AnalysedResponse> {
    response = response.toLowerCase();
    if (response === 'nyt') {
      return Observable.of({
        moveToNext: true,
        transcribed: response,
        value: this.getCurrentTime()
      });
    }
    return Observable.of({
      moveToNext: false,
      transcribed: response,
      value: ''
    });
  }

  private getCurrentTime() {
    const now = new Date();
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    return now.getFullYear() +
      '-' + pad(now.getMonth() + 1) +
      '-' + pad(now.getDate()) +
      'T' + pad(now.getHours()) +
      ':' + pad(now.getMinutes());
  }
}

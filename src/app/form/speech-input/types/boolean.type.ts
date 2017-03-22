import { Injectable } from '@angular/core';
import { SpeechTypeInterface, AnalysedResponse } from './speech-type.interface';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class BooleanType implements SpeechTypeInterface {

  constructor() { }

  getLabel(field: any): string {
    return field.label + ' (kyllä/ei)';
  }

  analyseResponse(response: string): Observable<AnalysedResponse> {
    return Observable.of({
      transcribed: response,
      moveToNext: true,
      value: response.toLowerCase() === 'kyllä'
    });
  }
}

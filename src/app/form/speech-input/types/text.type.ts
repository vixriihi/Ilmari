import { Injectable } from '@angular/core';
import { SpeechTypeInterface, AnalysedResponse } from './speech-type.interface';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TextType implements SpeechTypeInterface {

  constructor() { }

  getLabel(field: any): string {
    return field.label;
  }

  analyseResponse(response: string, field: any): Observable<AnalysedResponse> {
    return Observable.of(<AnalysedResponse>{
      transcribed: response,
      moveToNext: true,
      value: response
    });
  }

}

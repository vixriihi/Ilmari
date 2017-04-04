import { Injectable } from '@angular/core';
import { AnalysedResponse, SpeechMeta, SpeechTypeInterface } from './speech-type.interface';
import { Observable } from 'rxjs/Observable';
import { AutocompleteService } from '../../../services/autocomplete.service';

@Injectable()
export class AutocompleteType implements SpeechTypeInterface {

  constructor(private autocompleteService: AutocompleteService) { }

  getLabel(field: any): string {
    return field.label;
  }

  analyseResponse(response: string, field: any, meta: SpeechMeta): Observable<AnalysedResponse> {
    return this.autocompleteService
      .filterByTaxon(response, meta.group)
      .map(values => {
        let value = {value: response};
        if (values[0] && values[0].value.toLowerCase() === response.toLowerCase()) {
          value = values[0];
        }
        return {
          transcribed: response,
          moveToNext: true,
          value: value
        }
      });
  }

}

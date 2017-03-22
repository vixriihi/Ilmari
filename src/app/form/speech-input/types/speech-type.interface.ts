import { Observable } from 'rxjs/Observable';

export interface AnalysedResponse {
  transcribed: string;
  moveToNext: boolean;
  value: any;
  meta?: any;
}

export interface SpeechResponse {
  field: any;
  result: AnalysedResponse;
}

export interface SpeechMeta {
  group: string;
}

export abstract class SpeechTypeInterface {
  abstract getLabel(field: any): string;
  abstract analyseResponse(response: string, field: any, meta: SpeechMeta): Observable<AnalysedResponse>;
}

import { Injectable } from '@angular/core';
import { StoreDatabase } from '../db/store.database';
import { Observable } from 'rxjs/Observable';

export enum Stored {
  IMAGE_RIGHTS = 0,
  FORM_SCHEMAS = 1,
  ACTIVE_GROUP = 2,
  GROUPS = 3,
  AUTOCOMPLETE = 4,
  FORM_STATE = 5,
  ACTIVE_FORM = 6,
  SELECTED_FIELDS = 7,
  IMAGES = 8,
  CURRENT_USER = 9,
  SAVE_PUBLIC = 10,
  USE_SPEECH = 11,
  DATE_FILTER = 12,
  PLACE_FILTER = 13,
  USER_TOKEN = 14
}

@Injectable()
export class StoreService {

  constructor(private storeDatabase: StoreDatabase) {
  }

  get(key: Stored, emptyValue: any = ''): Observable<any> {
    return this.storeDatabase.get('' + key, emptyValue)
      .catch(err => Observable.of(emptyValue));
  }

  put(key: Stored, value: any): Observable<any> {
    return this.storeDatabase.put('' + key, value);
  }

  set(key: Stored, value: any): void {
    this.put(key, value)
      .subscribe();
  }

}

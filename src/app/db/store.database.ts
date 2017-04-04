import { Injectable } from '@angular/core';
import { AbstractDatabase } from './abstract.database';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class StoreDatabase extends AbstractDatabase<any> {

  protected getCollection() {
    return 'store';
  }

  get(key: string, emptyValue: any = ''): Observable<any> {
    return super.get('' + key)
      .map(data => data || emptyValue);
  }

}

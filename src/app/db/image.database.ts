import { Injectable } from '@angular/core';
import { AbstractDatabase } from './abstract.database';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ImageDatabase extends AbstractDatabase<any> {

  protected getCollection() {
    return 'images';
  }

  get(key: string, emptyValue: any = ''): Observable<any> {
    return super.get('' + key)
      .map(data => data || emptyValue);
  }
}

import { Injectable } from '@angular/core';
import { AbstractDatabase } from './abstract.database';
import { Taxon } from '../model/Taxon';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TaxaDatabase extends AbstractDatabase<Taxon> {

  protected getCollection() {
    return 'taxa';
  }

  get(taxonId: string): Observable<Taxon> {
    return Observable.fromPromise(this.db.getItem(taxonId));
  }

  set(value: Taxon): Observable<any> {
    return super.put(value.info.id, value);
  }

}

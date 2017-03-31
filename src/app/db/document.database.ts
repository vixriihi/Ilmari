import { Injectable } from '@angular/core';
import { AbstractDatabase } from './abstract.database';
import { Observable } from 'rxjs/Observable';
import { Document } from '../model/Document';

export interface DocumentPayload {
  document: Document;
  images?: any[];
}

@Injectable()
export class DocumentDatabase extends AbstractDatabase<Document[]> {

  private key = 'documents';

  protected getCollection() {
    return 'document';
  }

  get(): Observable<Document[]> {
    return Observable.fromPromise(this.db.getItem(this.key))
      .map(docs => docs || []);
  }

  count(): Observable<number> {
    return this.get()
      .map(docs => docs.length);
  }

  push(value: Document): Observable<Document[]> {
    return this.get()
      .switchMap((docs) => {
        docs.unshift(value);
        return super.put(this.key, docs);
      });
  }

  peak(): Observable<Document> {
    return this.get()
      .map(docs => docs.pop());
  }

  pop(): Observable<Document> {
    return this.get()
      .switchMap(docs => {
        const removed = docs.pop();
        return this.put(this.key, docs)
          .switchMap(() => Observable.of(removed));
      });
  }

}

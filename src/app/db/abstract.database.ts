import * as LocalForage from 'localforage';
import { Observable } from 'rxjs/Observable';

export abstract class AbstractDatabase<T> {
  protected db: LocalForage;

  constructor() {
    this.initDB();
  }

  fetch(): Observable<any> {
    return Observable.of([]);
    // return Observable.fromPromise(this.db.iterate());
  }

  get(id: string): Observable<any> {
    return Observable.fromPromise(this.db.getItem(id));
  }

  put(key: string, value: T): Observable<any> {
    return Observable.fromPromise(this.db.setItem(key, value));
  }

  remove(key): Observable<any> {
    return Observable.fromPromise(this.db.removeItem(key));
  }

  destroy() {
    this.db.clear();
  }

  protected abstract getCollection();

  private initDB() {
    if (!this.db) {
      this.db = LocalForage.createInstance({
        name: this.getCollection()
      });
    }
  }
}

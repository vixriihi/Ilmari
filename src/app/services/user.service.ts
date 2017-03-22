import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { StoreService, Stored } from './store.service';
import { Person } from '../model/Person';

@Injectable()
export class UserService {

  user;
  updated = false;

  constructor(private http: Http, private store: StoreService) { }

  getUser(allowLocal = true): Observable<Person> {
    return allowLocal ? this._getUserLocal() : this._getUserRemote();
  }

  private _getUserLocal(): Observable<Person> {
    if (this.user) {
      if (!this.updated) {
        this._getUserRemote();
        this.updated = true;
      }
      return Observable.of(this.user);
    }
    return this.store.get(Stored.CURRENT_USER, false)
      .map(user => this.user = user)
      .switchMap(() => this._getUserRemote());
  }

  private _getUserRemote(): Observable<Person> {
    return this.store.get(Stored.USER_TOKEN, '')
      .switchMap((personToken) => this.http.get( environment.apiBase + '/person/' + personToken
        + '?access_token=' + environment.accessToken)
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      })
      .do((user: Person) => {
        this.user = user;
        this.store.set(Stored.CURRENT_USER, this.user);
      }));
  }

}

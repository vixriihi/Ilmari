import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { Stored, StoreService } from './store.service';

@Injectable()
export class FormService {

  forms;

  constructor(private http: Http, private store: StoreService) { }

  getForm(id, type: 'schema'|'json' = 'json'): Observable<any> {
    const key = id + type;
    if (!this.forms) {
      return this.store.get(Stored.FORM_SCHEMAS, {})
        .map(forms => this.forms = forms)
        .switchMap(() => this._getFormLocal(id, type, key));
    }
    return this._getFormLocal(id, type, key);
  }

  getAll(type: 'schema'|'json' = 'json'): Observable<any> {
    return this.http.get( environment.apiBase +
      '/forms' +
      '?lang=fi' +
      '&format=' + type +
      '&access_token=' + environment.accessToken
    )
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      })
      .map(result => result.results)
      .map(forms => forms.filter(form => environment.whiteListForms.indexOf(form.id) > -1));
  }

  private _getFormLocal(id, type, key) {
    if (this.forms[key]) {
      return Observable.of(this.forms[key]);
    }
    return this._getFormRemote(id, type, key);
  }

  private _getFormRemote(id, type, key) {
    return this.http.get( environment.apiBase +
      '/forms/' + id +
      '?lang=fi' +
      '&format=' + type +
      '&access_token=' + environment.accessToken
    )
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      })
      .do(form => {
        this.forms[key] = form;
        this.store.set(Stored.FORM_SCHEMAS, this.forms);
      });
  }

}

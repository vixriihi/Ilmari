import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { environment } from '../../environments/environment';
import { Stored, StoreService } from './store.service';

@Injectable()
export class GroupsService {

  groups;

  constructor(private http: Http, private store: StoreService) { }

  getGroup(id: string): Observable<InformalTaxonGroup> {
    return this.getAllGroups()
      .map(groups => groups.filter(group => group.id === id)[0]);
  }

  getAllGroups(): Observable<InformalTaxonGroup[]> {
    if (!this.groups) {
      return this.store.get(Stored.GROUPS)
        .switchMap(groups => groups ? Observable.of(groups) : this._getAllGroups());
    }
    return Observable.of(this.groups);
  }

  private _getAllGroups() {
    return this.http.get(environment.apiBase +
      '/informal-taxon-groups/roots' +
      '?lang=fi&access_token=' + environment.accessToken
    )
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      })
      .map(response => response.results.map(group => {
        if (group['hasSubGroup']) {
          delete group['hasSubGroup'];
        }
        group['icon'] = group['id'].replace('.', '-');
        return group;
      }))
      .do(groups => this.groups = groups)
      .do(groups => this.store.set(Stored.GROUPS, groups));
  }

}

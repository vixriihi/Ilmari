import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import { environment } from '../../environments/environment';
import { Stored, StoreService } from './store.service';

export interface TaxonAutocomplete {
  key: string;
  value: string;
  payload?: {
    informalTaxonGroups: {
      id: string;
      name: string;
    }[];
    scientificName: string;
    scientificNameAuthorship: string;
    taxonRankId: string;
    matchType: string;
    cursiveName: boolean;
  };
}

@Injectable()
export class AutocompleteService {

  usedNames: { [group: string]: TaxonAutocomplete[] } = {};

  constructor(private http: Http, private store: StoreService) {
    this.store.get(Stored.AUTOCOMPLETE, {}).subscribe(used => this.usedNames = used);
  }

  filterByTaxon(name: string, group: string): Observable<TaxonAutocomplete[]> {
    if (!name || name.length < 4) {
      return this.getUsedNames(name, group);
    }
    return this.getTaxa(name, group);
  }

  addUsedTaxon(taxon: TaxonAutocomplete, group: string) {
    if (!taxon.key) {
      return;
    }
    if (!this.usedNames[group]) {
      this.usedNames[group] = [];
    }
    const idx = this.usedNames[group].findIndex(usedTaxon => usedTaxon.value === taxon.value);
    if (idx === -1) {
      this.usedNames[group] = [taxon, ...this.usedNames[group]]
        .sort((a, b) => (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0));
      this.store.set(Stored.AUTOCOMPLETE, this.usedNames);
    } else if (idx > -1 && taxon.key && taxon.key.length > 3 && !this.usedNames[group][idx].key) {
      this.usedNames[group][idx] = taxon;
      this.store.set(Stored.AUTOCOMPLETE, this.usedNames);
    }
  }

  makeValue(value) {
    if (value && typeof value !== 'object') {
      value = {value: this.capitalize(value)};
    }
    return value;
  }

  private capitalize(value) {
    if (typeof value === 'string' && value.length > 2) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  }

  private getTaxa(name: string, group: string): Observable<TaxonAutocomplete[]> {
    return this.http.get( environment.apiBase +
      '/autocomplete/taxon' +
      '?lang=fi' +
      '&q=' + name +
      '&informalTaxonGroup=' + group +
      '&access_token=' + environment.accessToken
    )
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      })
      .map(data => data.map(auto => ({
        key: auto.key,
        value: this.capitalize(auto.value)
      })))
      .catch(err => Observable.of([{
        key: '',
        value: name
      }]));
  }

  private getUsedNames(name: string, group: string): Observable<TaxonAutocomplete[]> {
    if (!this.usedNames[group]) {
      return Observable.of([]);
    } else if (!name || name.length === 0) {
      return Observable.of(this.usedNames[group]);
    }
    return Observable.of(this.usedNames[group])
      .map(names => names.filter(taxon => new RegExp(name, 'gi').test((taxon.value))));
  }
}

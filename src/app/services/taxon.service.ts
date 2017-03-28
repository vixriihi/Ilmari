import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { Taxon } from '../model/Taxon';
import { TaxaDatabase } from '../db/taxa.database';
import { Taxa } from '../model/Taxa';
import { TaxaDescription } from '../model/TaxaDescription';
import { TaxaMedia } from '../model/TaxaMedia';

@Injectable()
export class TaxonService {

  constructor(private http: Http, private taxaDb: TaxaDatabase) {
  }

  getTaxon(id): Observable<Taxon> {
    return this._getTaxonLocal(id);
  }

  setTaxonActiveMedia(id, idx) {
    this._getTaxonLocal(id)
      .switchMap((data: Taxon) => {
        data.activeMedia = idx;
        return this.taxaDb.set(data);
      })
      .subscribe();
  }

  private _getTaxonLocal(id): Observable<Taxon> {
    return this.taxaDb.get(id)
      .switchMap((data: Taxon) => {
        if (data) {
          this._getTaxonRemote(id, data.activeMedia);
          return Observable.of(data);
        }
        return this._getTaxonRemote(id, 0);
      });
  }

  private _getTaxonRemote(id, activeMedia): Observable<Taxon> {
    const url = environment.apiBase + '/taxa/' + id;
    return Observable.forkJoin(
      this.http.get( url + '?lang=fi&access_token=' + environment.accessToken)
        .map((response: Response) => response.json()),
      this.http.get( url + '/descriptions?lang=fi&blacklist=eol:api&access_token=' + environment.accessToken)
        .map((response: Response) => response.json())
        .map(descriptions => {
          if (descriptions.length < 2) {
            return descriptions;
          }
          const result = [descriptions[0]];
          descriptions.map(desc => {
            if (desc.title && desc.title === 'Laji.fi lajikuvaukset') {
              result[0] = desc;
            }
          });
          return result;
        })
        .catch(err => []),
      this.http.get( url + '/media?lang=fi&access_token=' + environment.accessToken)
        .map((response: Response) => response.json())
        .catch(err => []),
      (info: Taxa, description: TaxaDescription[], media: TaxaMedia[]) => ({
        info: info,
        descriptions: description,
        media: media,
        activeMedia: activeMedia
      }))
      .do((taxon) => {
        this.taxaDb.set(taxon);
      });
  }

}

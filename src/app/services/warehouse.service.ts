import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class WarehouseService {

  constructor(private http: Http) { }

  aggregate(query: AggregateQuery) {
    return this.http.get( environment.apiBase +
      '/warehouse/query/aggregate' +
      '?access_token=' + environment.accessToken +
      '&' + this.queryToQueryparams(query)
    )
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      });
  }

  private queryToQueryparams(query) {
    return Object.keys(query).map(k => k + '=' + encodeURIComponent(query[k])).join('&');
  }
}

export interface Query {
  area?: string;
  page?: number;
  pageSize?: number;
  time?: string;
  coordinates?: string;
  coordinateAccuracyMax?: string;
  informalTaxonGroupId?: string;
  includeNonValidTaxa?: boolean;
  typeScript?: boolean;
  nativeOccurence?: boolean;
  hasDocumentMedia?: boolean;
  hasGatheringMedia?: boolean;
  hasUnitMedia?: boolean;
  hasMedia?: boolean;
}

export interface AggregateQuery extends Query {
  aggregateBy?: string;
  orderBy?: string;
  onlyCount?: boolean;
}

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
      this.queryToQueryParams(query)
    )
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      });
  }

  private queryToQueryParams(query) {
    return Object.keys(query).reduce((cumm, k) => {
      if (typeof query[k] === 'undefined') {
        return cumm;
      }
      return cumm + '&' + k + '=' + encodeURIComponent(query[k]);
    }, '');
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

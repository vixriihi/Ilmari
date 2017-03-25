import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { environment } from '../../environments/environment';
import { StoreService, Stored } from './store.service';
import { Person } from '../model/Person';
import { UserService } from './user.service';
import { Document } from '../model/Document';
import { Observable } from 'rxjs/Observable';
import { FormState } from '../form/form.reducer';
import { Gatherings } from '../model/Gatherings';
import { Units } from '../model/Units';
import { Identifications } from '../model/Identifications';
import { Geometry } from '../model/Geometry';
import * as jsonpatch from 'fast-json-patch';
import PublicityRestrictionsEnum = Document.PublicityRestrictionsEnum;

@Injectable()
export class DocumentService {

  constructor(
    private http: Http,
    private storeService: StoreService,
    private userService: UserService
  ) { }

  formStatesToDocument(states: FormState[], gatheringData: Gatherings): Observable<Document> {
    const gathering: Gatherings = {};
    const document: Document = {
      gatherings: [gathering]
    };

    if (gatheringData.geometry) {
      gathering.geometry = gatheringData.geometry;
    }
    if (gatheringData.dateBegin) {
      if (!document.gatheringEvent) {
        document.gatheringEvent = {};
      }
      document.gatheringEvent.dateBegin = document.gatheringEvent.dateBegin || gatheringData.dateBegin;
      document.gatheringEvent.dateEnd = document.gatheringEvent.dateEnd || gatheringData.dateEnd;
    }

    gathering.units = [];
    states.map((state, idx) => {
      const unit: Units = {};
      const identification: Identifications = {};
      gathering.units[idx] = unit;
      unit.unitType = [state.group];
      unit.identifications = [identification];
      identification.taxonID = state.name.key || '';
      identification.taxon = state.name.value || '';
      unit.unitGathering = {};
      unit.unitGathering.dateBegin = state.date;
      unit.unitGathering.geometry = {
        'type': Geometry.TypeEnum.Point,
        'coordinates': [state.location.lng, state.location.lat]
      };
      const patches = [];
      Object.keys(state.extra).map(path => {
        const normalizePath = path
          .replace(/\/units\/\*\//g, '/units/' + idx + '/')
          .replace(/\/\*\//g, '/0/');
        patches.push({'op': 'replace', 'path': normalizePath, 'value': state.extra[path] });
      });
      if (patches.length > 0) {
        jsonpatch.apply(document, patches);
      }
      if (!unit.recordBasis) {
        unit.recordBasis = Units.RecordBasisEnum.RecordBasisHumanObservation;
      }
    });
    return Observable.of(document);
  }

  sendDocument(data: Document): Observable<any> {
    return Observable.combineLatest(
      this.storeService.get(Stored.ACTIVE_FORM, 'JX.519'),
      this.userService.getUser(),
      this.storeService.get(Stored.SAVE_PUBLIC, false),
      this.storeService.get(Stored.USER_TOKEN, ''),
      (s1, s2: Person, s3, s4) => {
        data.formID = s1;
        data.publicityRestrictions = s3 ?
          PublicityRestrictionsEnum.PublicityRestrictionsPublic :
          PublicityRestrictionsEnum.PublicityRestrictionsPrivate;
        if (!data.gatheringEvent) {
          data.gatheringEvent = {};
        }
        data.gatheringEvent.leg = data.gatheringEvent.leg || [s2.id] || [];
        return {document: data, token: s4};
      })
      .switchMap(docWrap => this.http.post(environment.apiBase +
        '/documents' +
        '?personToken=' + docWrap.token +
        '&access_token=' + environment.accessToken,
        docWrap.document
      ))
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      });
  }

  isEmpty(document: Document): boolean {
    return !(document
      && document.gatherings
      && document.gatherings[0]
      && document.gatherings[0].units
      && document.gatherings[0].units[0]
      && document.gatherings[0].units[0].identifications
      && document.gatherings[0].units[0].identifications[0]
      && document.gatherings[0].units[0].identifications[0].taxon);
  };
}

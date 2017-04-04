import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { environment } from '../../environments/environment';
import { Stored, StoreService } from './store.service';
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
import { DocumentDatabase } from '../db/document.database';
import { Subscription } from 'rxjs/Subscription';
import PublicityRestrictionsEnum = Document.PublicityRestrictionsEnum;

const RETRY_INTERVAL = 180; // sec

@Injectable()
export class DocumentService {

  private resendInterval;
  private subResend: Subscription;

  constructor(
    private http: Http,
    private storeService: StoreService,
    private userService: UserService,
    private docDb: DocumentDatabase
  ) {
    this.resendInterval = setInterval(() => {
      if (this.subResend) {
        return;
      }
      this.subResend = this._resendFailed()
        .subscribe(count => {
          this.subResend.unsubscribe();
          delete this.subResend;
        });
    }, 1000 * RETRY_INTERVAL);
  }

  formStatesToDocument(states: FormState[], gatheringData: Gatherings): Observable<Document> {
    const gathering: Gatherings = {};
    const document: Document = {
      gatheringEvent: {},
      gatherings: [gathering]
    };

    if (gatheringData.geometry) {
      gathering.geometry = gatheringData.geometry;
    }
    if (gatheringData.dateBegin) {
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
      identification.taxon = state.name.value || '';
      unit.unitGathering = {};
      unit.unitGathering.dateBegin = state.date;
      unit.unitGathering.geometry = {
        'type': Geometry.TypeEnum.Point,
        'coordinates': [state.location.lng, state.location.lat]
      };
      if (state.images && state.images.length > 0) {
        unit.images = state.images;
      }
      const patches = [];
      Object.keys(state.extra).map(path => {
        if (typeof state.extra[path] !== 'undefined') {
          const normalizePath = path
            .replace(/\/units\/\*\//g, '/units/' + idx + '/')
            .replace(/\/\*\//g, '/0/');
          patches.push({'op': 'replace', 'path': normalizePath, 'value': state.extra[path] });
        }
      });
      if (patches.length > 0) {
        jsonpatch.apply(document, patches);
      }
      if (!unit.recordBasis) {
        unit.recordBasis = Units.RecordBasisEnum.RecordBasisHumanObservation;
      }
    });

    return Observable.combineLatest(
      this.storeService.get(Stored.ACTIVE_FORM, 'JX.519'),
      this.userService.getUser(),
      this.storeService.get(Stored.SAVE_PUBLIC, false),
      (s1, s2: Person, s3) => {
        document.formID = s1;
        document.publicityRestrictions = s3 ?
          PublicityRestrictionsEnum.PublicityRestrictionsPublic :
          PublicityRestrictionsEnum.PublicityRestrictionsPrivate;
        if (!document.gatheringEvent) {
          document.gatheringEvent = {};
        }
        document.gatheringEvent.leg = document.gatheringEvent.leg ? [s2.id, ...document.gatheringEvent.leg] : [s2.id];
        return document;
      });
  }

  sendDocument(document: Document): void {
    this._sendDocument(document)
      .subscribe();
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

  private _sendDocument(document: Document, isResend = false): Observable<boolean> {
    return this.storeService.get(Stored.USER_TOKEN, '')
      .switchMap(token => this.http.post(environment.apiBase +
        '/documents' +
        '?personToken=' + token +
        '&access_token=' + environment.accessToken,
        document
      ))
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      })
      .catch(err => {
        if (!isResend) {
          this.docDb.push(document)
            .subscribe();
        }
        return Observable.of(false);
      });
  }

  private _resendFailed(): Observable<number> {
    return this.docDb
      .count()
      .switchMap(count => count === 0 ?
        Observable.of(count) :
        this.docDb
          .peak()
          .switchMap(document => this._sendDocument(document, true))
          .switchMap(success => {
            if (success) {
              return this.docDb.pop()
                .switchMap(() => count > 1 ? this._resendFailed() : Observable.of(0));
            }
            return Observable.of(count);
          })
      );
  }
}

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
import { ImageService } from './image.service';

const RETRY_INTERVAL = 10; // sec

@Injectable()
export class DocumentService {

  private resendInterval;
  private subResend: Subscription;

  constructor(
    private http: Http,
    private storeService: StoreService,
    private imageService: ImageService,
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
      gathering.units[idx] = this.getUnitFromState(state, idx);
    });

    // Needed so that the gathering would be valid
    if (states.length === 1 && !gatheringData.geometry && gathering.units[0] && gathering.units[0].unitGathering) {
      Object.keys(gathering.units[0].unitGathering).map((key: string) => {
        if (key === 'dateBegin') {
          document.gatheringEvent.dateBegin = gathering.units[0].unitGathering[key];
        } else {
          gathering[key] = gathering.units[0].unitGathering[key];
        }
      });
      gathering.units[0].unitGathering = undefined;
    } else if (states.length > 1 && !gatheringData.geometry) {
      console.log('GATHEIGN!!!');
      gathering.geometry = this.getBoundingBox(gathering.units);
      console.log(gathering.geometry);
    }

    return Observable.combineLatest(
      this.storeService.get(Stored.ACTIVE_FORM, 'JX.519'),
      this.userService.getUser(),
      this.storeService.get(Stored.SAVE_PUBLIC, true),
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

  private getBoundingBox(units: Units[]) {
    let latMin = 999;
    let latMax = -999;
    let lngMin = 999;
    let lngMax = -999;
    units.map(unit => {
      if (unit.unitGathering && unit.unitGathering.geometry && unit.unitGathering.geometry.coordinates) {
        const lng = unit.unitGathering.geometry.coordinates[0];
        const lat = unit.unitGathering.geometry.coordinates[1];
        if (lng > lngMax) {
          lngMax = lng;
        }
        if (lng < lngMin) {
          lngMin = lng;
        }
        if (lat > latMax) {
          latMax = lat;
        }
        if (lat < latMin) {
          latMin = lat;
        }
      }
    });
    return{
      'type': Geometry.TypeEnum.Polygon,
      'coordinates': [[
        [lngMin, latMin],
        [lngMax, latMin],
        [lngMax, latMax],
        [lngMin, latMax],
        [lngMin, latMin]
      ]]
    };
  }

  private getUnitFromState(state: FormState, idx: number) {
    const unit: Units = {};
    const identification: Identifications = {};
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
    return unit;
  }

  private _sendDocument(document: Document, isResend = false): Observable<boolean> {
    return this._sendImage(document)
      .switchMap(() => this.storeService.get(Stored.USER_TOKEN, ''))
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

  private _sendImage(document: Document): Observable<any> {
    if (document.images) {
      for (const idx in document.images) {
        if (this.imageService.isTempImage(document.images[idx])) {
          return this.imageService.sendLocalImage(document.images[idx])
            .map(imgId => document.images[idx] = imgId)
            .switchMap(() => this._sendImage(document));
        }
      }
    }
    if (document.gatherings) {
      for (const gIdx in document.gatherings) {
        if (!document.gatherings.hasOwnProperty(gIdx)) {
          continue;
        }
        if (document.gatherings[gIdx].images) {
          for (const idx in document.gatherings[gIdx].images) {
            if (document.gatherings[gIdx].images.hasOwnProperty(idx) &&
              this.imageService.isTempImage(document.gatherings[gIdx].images[idx])
            ) {
              return this.imageService.sendLocalImage(document.gatherings[gIdx].images[idx])
                .map(imgId => document.gatherings[gIdx].images[idx] = imgId)
                .switchMap(() => this._sendImage(document));
            }
          }
        }
        if (document.gatherings[gIdx].units) {
          for (const uIdx in document.gatherings[gIdx].units) {
            if (!document.gatherings[gIdx].units.hasOwnProperty(uIdx)) {
              continue;
            }
            if (document.gatherings[gIdx].units[uIdx].images) {
              for (const idx in document.gatherings[gIdx].units[uIdx].images) {
                if (this.imageService.isTempImage(document.gatherings[gIdx].units[uIdx].images[idx])) {
                  return this.imageService.sendLocalImage(document.gatherings[gIdx].units[uIdx].images[idx])
                    .map(imgId => document.gatherings[gIdx].units[uIdx].images[idx] = imgId)
                    .switchMap(() => this._sendImage(document));
                }
              }
            }
          }
        }
      }
    }
    return Observable.of(true);
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

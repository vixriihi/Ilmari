import { Injectable } from '@angular/core';
import { Gatherings } from '../model/Gatherings';
import { Geometry } from '../model/Geometry';
import { WindowRef } from '../ref/window.ref';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Stored, StoreService } from './store.service';

const proj4 = require('proj4').default;

proj4.defs('WGS84', '+title=*GPS (WGS84) (deg) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');
proj4.defs('EPSG:2393', '+title=KKJ Zone 3 +proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=3500000 +y_0=0 +ellps=intl ' +
  '+towgs84=-96.0617,-82.4278,-121.7435,4.80107,0.34543,-1.37646,1.4964 +units=m +no_defs');

const POSITION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 10000
};

@Injectable()
export class LocationStoreService {

  lastLat;
  lastLng;
  coordinates: [number, number][] = [];
  geoLocationEnabled = false;
  timeStart;
  _record = false;

  private watchId;

  constructor(
    private windowRef: WindowRef,
    private storeService: StoreService
  ) {
    if (
      this.windowRef.nativeWindow.navigator.geolocation &&
      this.windowRef.nativeWindow.navigator.geolocation.watchPosition
    ) {
      this.geoLocationEnabled = true;
    }
  }

  /**
   * Returns currently stored recording state
   *
   * @returns {Observable<boolean>}
   */
  isRecording(): Observable<boolean> {
    return this.storeService.get(Stored.IS_RECORDING, this._record);
  }

  /**
   * Is recording active
   *
   * @returns {boolean}
   */
  isCurrentlyRecording() {
    return this._record;
  }

  /**
   * Resume location recording
   */
  resumeRecording() {
    Observable.forkJoin(
      this.storeService.get(Stored.LOCATIONS, this.coordinates),
      this.storeService.get(Stored.GATHERING_START, this.timeStart)
    )
      .subscribe(data => {
        this.coordinates = data[0];
        this.timeStart = data[1];
        this._startRecording();
      });
  }

  /**
   * Start recording loaction
   */
  startRecording() {
    this.timeStart = this.getCurrentTime();
    this.storeService.set(Stored.GATHERING_START, this.timeStart);
    this._startRecording();
  }

  /**
   * Stop recording location
   */
  stopRecording() {
    this._record = false;
    this.storeService.set(Stored.IS_RECORDING, this._record);
    if (this.watchId) {
      this.windowRef.nativeWindow.navigator.geolocation.clearWatch(this.watchId);
      delete this.watchId;
    }
  }

  /**
   * Get the currently stored locations as Gatherings
   *
   * @returns {Gatherings}
   */
  getGathering(): Gatherings {
    if (!this._record) {
      return {};
    }
    const gathering: Gatherings = {};
    if (this.coordinates.length > 0) {
      gathering.geometry = {
        type: this.coordinates.length === 1 ? Geometry.TypeEnum.Point : Geometry.TypeEnum.LineString,
        coordinates: JSON.parse(JSON.stringify(this.coordinates.length === 1 ? this.coordinates[0] : this.coordinates))
      };
    }
    gathering.dateBegin = this.timeStart;
    gathering.dateEnd = this.getCurrentTime();
    return gathering;
  }

  /**
   * Get current location observable
   *
   * @returns {Observable<Position>}
   */
  getCurrentLocation(): Observable<Position> {
    if (this.windowRef.nativeWindow.navigator.geolocation) {
      return new Observable((observer: Observer<Position>) => {
        this.windowRef.nativeWindow.navigator.geolocation.getCurrentPosition(
          (position: Position) => {
            observer.next(position);
            observer.complete();
          },
          (error: PositionError) => {
            observer.error(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 10000
          }
        );
      });
    }
  }

  /**
   * Distance between coordinates in km
   *
   * @param lat1
   * @param lon1
   * @param lat2
   * @param lon2
   * @returns {number}
   */
  distance(lat1, lon1, lat2, lon2): number {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 +
      c(lat1 * p) * c(lat2 * p) *
      (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  /**
   * Convert wgs84 coordinates to ykj
   *
   * @param lat
   * @param lng
   * @returns {number[]}
   */
  convertToWgsToYkj(lat, lng) {
    return this.toInteger(proj4('WGS84', 'EPSG:2393', [lng, lat])).reverse();
  }

  private addLocation(pos) {
    const crd = pos.coords;
    if (crd.accuracy > 30) {
      return;
    }
    const latitude = crd.latitude;
    const longitude = crd.longitude;
    if (this.isNewLocation(latitude, longitude)) {
      this.coordinates.push([longitude, latitude]);
      this.initTimer();
      this.storeService.set(Stored.LOCATIONS, this.coordinates);
    }
  }

  private isNewLocation(lat, lng) {
    if (!this.lastLat || !this.lastLng || this.distance(lat, lng, this.lastLat, this.lastLng) > 0.05) {
      this.lastLat = lat;
      this.lastLng = lng;
      return true;
    }
    return false;
  }

  private _startRecording() {
    this._record = true;
    this.storeService.set(Stored.IS_RECORDING, this._record);
    if (this.geoLocationEnabled) {
      this.watchId = this.windowRef.nativeWindow.navigator.geolocation
        .watchPosition(this.addLocation.bind(this), undefined, POSITION_OPTIONS);
    }
  }

  private getCurrentTime() {
    const now = new Date();
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    return now.getFullYear() +
      '-' + pad(now.getMonth() + 1) +
      '-' + pad(now.getDate()) +
      'T' + pad(now.getHours()) +
      ':' + pad(now.getMinutes());
  }

  private initTimer() {
    if (this._record && !this.watchId) {
      this.startRecording();
    }
  }

  private toInteger(val: any[]) {
    return val.map(Math.floor);
  }
}

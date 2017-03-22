import { Injectable } from '@angular/core';
import { Gatherings } from '../model/Gatherings';
import { Geometry } from '../model/Geometry';
import { WindowRef } from '../ref/window.ref';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

const proj4 = require('proj4').default;

proj4.defs('WGS84', '+title=*GPS (WGS84) (deg) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');
proj4.defs('EPSG:2393', '+title=KKJ Zone 3 +proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=3500000 +y_0=0 +ellps=intl ' +
  '+towgs84=-96.0617,-82.4278,-121.7435,4.80107,0.34543,-1.37646,1.4964 +units=m +no_defs');

@Injectable()
export class LocationStoreService {

  lastLat;
  lastLng;
  coordinates: [number, number][] = [];
  geoLocationEnabled = false;
  timeStart;
  _record = false;
  _timer;

  constructor(private windowRef: WindowRef) {
    if (this.windowRef.nativeWindow.navigator.geolocation) {
      this.geoLocationEnabled = true;
    }
  }

  isRecording() {
    return this._record;
  }

  startRecording() {
    this.timeStart = this.getCurrentTime();
    if (this.geoLocationEnabled) {
      this._record = true;
      this.addLocation();
      if (!this._timer) {
        this._timer = setInterval(this.addLocation.bind(this), 10000);
      }
    }
  }

  stopRecording() {
    if (this._timer) {
      this._record = false;
      clearInterval(this._timer);
      delete this._timer;
    }
  }

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

  addLocation() {
    if (!this._record) {
      return;
    }
    this.getCurrentLocation()
      .subscribe(pos => {
        const crd = pos.coords;
        if (crd.accuracy > 20) {
          return;
        }
        const latitude = crd.latitude;
        const longitude = crd.longitude;
        if (this.isNewLocation(latitude, longitude)) {
          this.coordinates.push([longitude, latitude]);
        }
      });
  }

  isNewLocation(lat, lng) {
    if (!this.lastLat || !this.lastLng || this.distance(lat, lng, this.lastLat, this.lastLng) > 0.05) {
      this.lastLat = lat;
      this.lastLng = lng;
      return true;
    }
    return false;
  }

  distance(lat1, lon1, lat2, lon2) {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 +
      c(lat1 * p) * c(lat2 * p) *
      (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  getCurrentTime() {
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

  convertToWgsToYkj(lat, lng) {
    return this.toInteger(proj4('WGS84', 'EPSG:2393', [lng, lat])).reverse();
  }

  private toInteger(val: any[]) {
    return val.map(Math.floor);
  }
}

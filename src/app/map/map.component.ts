import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { SebmGoogleMap } from 'angular2-google-maps/core';
import { FormLocation } from '../form/form.reducer';

@Component({
  selector: 'ilm-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnChanges {
  @ViewChild(SebmGoogleMap) map: SebmGoogleMap;
  @Input() location: FormLocation;
  @Input() showControls = true;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.map.triggerResize();
  }

  _setMarkerCenter(loc) {
    if (loc.lat && loc.lng) {
      this.location.lat = loc.lat;
      this.location.lng = loc.lng;
    }
  }

  _setZoom(zoom) {
    this.location.zoom = zoom;
  }
}

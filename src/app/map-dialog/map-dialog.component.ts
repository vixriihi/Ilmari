import { Component, OnInit, ViewChild } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { MapComponent } from '../map/map.component';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/index';
import { FormLocation } from '../form/form.reducer';
import { Observable } from 'rxjs/Observable';
import { FormActions } from '../form/form.actions';

@Component({
  selector: 'ilm-map-dialog',
  templateUrl: './map-dialog.component.html',
  styleUrls: ['./map-dialog.component.css']
})
export class MapDialogComponent implements OnInit {
  @ViewChild(MapComponent) map: MapComponent;
  location: Observable<FormLocation>;

  constructor(
    public dialogRef: MdDialogRef<MapDialogComponent>,
    private store: Store<AppState>,
    private formActions: FormActions
  ) {
    this.location = this.store.select<FormLocation>(state => state.form.location);
  }

  ngOnInit() {
  }

  selectLocation() {
    this.dialogRef.close(this.location);
  }

  setToMyLocation() {
    this.store.dispatch(this.formActions.locationToHere());
  }

}

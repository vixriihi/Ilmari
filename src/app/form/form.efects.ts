import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { FormActions } from './form.actions';
import { LocationStoreService } from '../services/location-store.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FormEffects {
  constructor(
    private actions$: Actions,
    private formActions: FormActions,
    private locationService: LocationStoreService
  ) { }

  @Effect() toCurrentPosition$ = this.actions$
    .ofType(FormActions.LOCATION_TO_HERE)
    .map(action => action.payload)
    .switchMap(() =>
      this.locationService.getCurrentLocation()
          .map((pos: any) => pos.coords)
          .map(coords => this.formActions.updateLocation({
            lat: coords.latitude,
            lng: coords.longitude,
            zoom: 15
          }))
        .catch(err => Observable.of(this.formActions.noLocationApi()))
    );
}

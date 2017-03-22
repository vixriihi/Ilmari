import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { FormLocation, FormName } from './form.reducer';

@Injectable()
export class FormActions {

  static UPDATE_NAME = '[Form] update name';
  static UPDATE_DATE = '[Form] update date';
  static UPDATE_LOCATION = '[Form] update location';
  static UPDATE_EXTRA = '[Form] update extra';
  static UPDATE_STATE = '[Form] update whole form state';
  static LOCATION_TO_HERE = '[Form] location to here';
  static NO_GEO_LOCATE = '[Form] no geo locate';
  static RESET = '[Form] reset';

  constructor() {}

  updateName(value: FormName): Action {
    return {
      type: FormActions.UPDATE_NAME,
      payload: value
    };
  }

  updateDate(value: string): Action {
    return {
      type: FormActions.UPDATE_DATE,
      payload: value
    };
  }

  updateLocation(value: FormLocation): Action {
    return {
      type: FormActions.UPDATE_LOCATION,
      payload: value
    };
  }

  updateExtra(value: any): Action {
    return {
      type: FormActions.UPDATE_EXTRA,
      payload: value
    };
  }

  updateState(value: any): Action {
    return {
      type: FormActions.UPDATE_STATE,
      payload: value
    };
  }

  dateToNow(): Action {
    return {
      type: FormActions.UPDATE_DATE,
      payload: getCurrentTime()
    };
  }

  noLocationApi(): Action {
    return {
      type: FormActions.NO_GEO_LOCATE
    };
  }

  locationToHere() {
    return {
      type: FormActions.LOCATION_TO_HERE
    };
  }

  reset(): Action {
    return {
      type: FormActions.RESET
    };
  }

}

function getCurrentTime() {
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

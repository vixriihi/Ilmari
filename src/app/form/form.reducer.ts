import { ActionReducer, Action } from '@ngrx/store';
import { FormActions } from './form.actions';

export interface FormName {
  key: string;
  value: string;
}

export interface FormLocation {
  lat: number;
  lng: number;
  zoom: number;
}

export interface FormState {
  name?: FormName;
  date?: string;
  location?: FormLocation;
  extra?: Object;
  group?: string;
}

const initialState: FormState = {
  name: {key: '', value: ''},
  date: '',
  location: {lat: 60.2449602, lng: 24.9868472, zoom: 5},
  extra: {},
  group: ''
};

export const formReducer: ActionReducer<FormState> = function formReducer(state = initialState, action: Action) {
  switch (action.type) {
    case FormActions.UPDATE_STATE:
      return JSON.parse(JSON.stringify(action.payload));
    case FormActions.UPDATE_NAME:
      return Object.assign({}, state, {name: action.payload});
    case FormActions.UPDATE_DATE:
      return Object.assign({}, state, {date: action.payload});
    case FormActions.UPDATE_EXTRA:
      return Object.assign({}, state, {extra: JSON.parse(JSON.stringify(action.payload))});
    case FormActions.UPDATE_LOCATION:
      const zoom = Math.max(action.payload.zoom, state.location.zoom);
      return Object.assign({}, state, {location: {
        lat: action.payload.lat,
        lng: action.payload.lng,
        zoom: zoom
      }});
    case FormActions.RESET:
      return Object.assign({}, initialState, {location: state.location || initialState.location});
    default:
      return state;
  }
};

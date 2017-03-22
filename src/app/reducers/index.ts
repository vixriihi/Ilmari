import { formReducer, FormState } from '../form/form.reducer';
import { compose } from '@ngrx/core';
import { combineReducers } from '@ngrx/store';

export interface AppState {
  form: FormState;
}

export const reducers = {
  form: formReducer
};

const resetOnLogout = (reducer: Function) => {
  return function (state, action) {
    let newState;
    if (action.type === '[User] Logout Success') {
      newState = Object.assign({}, state);
    }
    return reducer(newState || state, action);
  };
};

// const developmentReducer = compose(...DEV_REDUCERS, resetOnLogout, combineReducers)(reducers);
const productionReducer = compose(resetOnLogout, combineReducers)(reducers);

export function rootReducer(state: any, action: any) {
  return productionReducer(state, action);
  // return developmentReducer(state, action);
}

import { Injectable } from '@angular/core';

@Injectable()
export class LoaderService {

  private _showLoader = 0;

  get showLoader(): boolean {
    return this._showLoader !== 0;
  }

  set showLoader(value: boolean) {
    if (value) {
      this._showLoader++;
    } else {
      if (this._showLoader > 0) {
        this._showLoader--;
      }
    }
  }
}

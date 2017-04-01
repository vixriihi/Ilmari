import { Injectable } from '@angular/core';
import { AbstractDatabase } from './abstract.database';
import { Observable } from 'rxjs/Observable';
import { Document } from '../model/Document';

@Injectable()
export class ImageDatabase extends AbstractDatabase<Document[]> {

  protected getCollection() {
    return 'images';
  }



}

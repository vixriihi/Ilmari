import { Injectable } from '@angular/core';
import { AbstractDatabase } from './abstract.database';
import { Document } from '../model/Document';

export interface DocumentPayload {
  document: Document;
  images?: any[];
}

@Injectable()
export class DocumentDatabase extends AbstractDatabase<DocumentPayload> {

  protected getCollection() {
    return 'document';
  }

}

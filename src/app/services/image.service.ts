import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { Image } from '../model/Image';
import { Stored, StoreService } from './store.service';
import { ImageDatabase } from '../db/image.database';

@Injectable()
export class ImageService {

  user;

  constructor(private http: Http,
              private storeService: StoreService,
              private imageDb: ImageDatabase
  ) { }

  getImageSrc(id): Observable<string> {
    if (id.indexOf('MM.') === 0) {
      return Observable.of(environment.apiBase + '/images/' + id + '/thumbnail.jpg?access_token=' + environment.accessToken);
    }
    return this.imageDb.get(id, '');
  }

  addImage(data, meta: Image, fileName = ''): Observable<string> {
    if (!data) {
      return Observable.of('');
    } else if (data.startsWith('MM.')) {
      return Observable.of(data);
    }
    const formData = new FormData();
    const imgBlob = this.dataUrlToBlob(data);
    formData.append('data', imgBlob, fileName);
    return this.storeService.get(Stored.USER_TOKEN, '')
      .switchMap(personToken =>
        this.http.post( environment.apiBase +
          '/images' +
          '?personToken=' + personToken +
          '&access_token=' + environment.accessToken,
          formData
        )
        .map((response: Response) => {
          if (response.status === 204) {
            return undefined;
          } else {
            return response.json();
          }
        })
        .switchMap(response => this.http.post( environment.apiBase +
          '/images/' + response[0].id +
          '?personToken=' + personToken +
          '&access_token=' + environment.accessToken,
          meta
        ))
        .map((response: Response) => {
          if (response.status === 204) {
            return undefined;
          } else {
            return response.json();
          }
        })
        .map(response => response.id)
      );
  }

  deleteImage(id: string): Observable<boolean> {
    return this.storeService.get(Stored.USER_TOKEN, '')
      .switchMap(personToken => this.http.delete(
        environment.apiBase +
        '/images' +
        '/' + id +
        '?personToken=' + personToken +
        '&access_token=' + environment.accessToken
      ))
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      });
  }

  private dataUrlToBlob(dataURI): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], {type: mimeString});
  }

  private generateUUID () {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r: number = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}

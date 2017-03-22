import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { Image } from '../model/Image';
import { Stored, StoreService } from './store.service';

@Injectable()
export class ImageService {

  user;

  constructor(private http: Http,
              private storeService: StoreService) { }

  addImage(data, meta: Image): Observable<Image> {
    if (!data || !data.img) {
      return Observable.of(meta);
    } else if (data.img.startsWith('MM.')) {
      meta.id = data;
      return Observable.of(meta);
    }
    const formData = new FormData();
    formData.append('file', this.dataUrlToBlob(data.img), data.filename);
    return this.storeService.get(Stored.USER_TOKEN, '')
      .switchMap(personToken => this.http.post( environment.apiBase +
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
      }));
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
}

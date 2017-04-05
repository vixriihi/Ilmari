import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { MdDialogRef } from '@angular/material';
import { Http, Response } from '@angular/http';
import { Observable } from '../../../node_modules/rxjs/Observable';

@Component({
  selector: 'ilm-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

  private static cache;
  changeLog = '';

  info = 'about';
  version;

  constructor(
    public dialogRef: MdDialogRef<InfoComponent>,
    private http: Http
  ) {
  }

  ngOnInit() {
    this.version = environment.version;
    if (InfoComponent.cache) {
      this.changeLog = InfoComponent.cache;
    }
    if (this.changeLog === '') {
      this.http.get('/CHANGELOG.md')
        .catch(() => Observable.of('väliaikaisesti poissa käytöstä'))
        .map((response: Response) => response.toString())
        .do(changelog => InfoComponent.cache = changelog)
        .subscribe(changelog => this.changeLog = changelog);
    }
  }

}

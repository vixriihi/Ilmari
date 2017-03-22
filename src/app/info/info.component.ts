import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'ilm-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

  info = 'about';
  version;

  constructor() { }

  ngOnInit() {
    this.version = environment.version;
  }

}

import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'ilm-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

  info = 'about';
  version;

  constructor(public dialogRef: MdDialogRef<InfoComponent>) { }

  ngOnInit() {
    this.version = environment.version;
  }

}

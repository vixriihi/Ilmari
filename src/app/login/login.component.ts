import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { WindowRef } from '../ref/window.ref';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'ilm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginUrl;

  constructor(private sanitizer: DomSanitizer,
              private windowRef: WindowRef,
              public dialogRef: MdDialogRef<LoginComponent>) { }

  ngOnInit() {
    this.loginUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.login);
    this.windowRef.nativeWindow.onmessage = (e) => {
      if (e.data && e.data.token) {
        this.dialogRef.close(e.data.token);
      }
    };
  }

}

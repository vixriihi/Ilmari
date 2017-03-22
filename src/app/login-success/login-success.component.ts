import { Component, OnInit } from '@angular/core';
import { WindowRef } from '../ref/window.ref';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ilm-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit {

  constructor(private windowRef: WindowRef,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.windowRef.nativeWindow.top.postMessage({
      token: this.route.snapshot.queryParams['token']
    }, '*');
  }

}

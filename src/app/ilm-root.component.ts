import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdIconRegistry } from '@angular/material';

@Component({
  selector: 'ilm-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['ilm.component.css']
})
export class IlmRootComponent implements OnInit {
   constructor(
    sanitizer: DomSanitizer,
    iconRegistry: MdIconRegistry
  ) {
    iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/icons.svg'));
  }

  ngOnInit() {

  }
}

import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TaxaMedia } from '../model/TaxaMedia';

@Component({
  selector: 'ilm-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnChanges {

  @Input() media: TaxaMedia[] = [];
  @Input() active = 0;
  @Output() activeChanged = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
    this.initActive();
  }

  ngOnChanges() {
    this.initActive();
  }

  moveToIndex(idx) {
    this.active = idx;
    this.activeChanged.emit(this.active);
  }

  moveToNext() {
    this.active++;
    if (!this.media[this.active]) {
      this.active = 0;
    }
    this.activeChanged.emit(this.active);
  }

  private initActive() {
    if (!this.media[this.active]) {
      this.active = 0;
    }
  }

}

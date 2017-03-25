import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Field } from '../field.component';

@Component({
  selector: 'ilm-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit, OnChanges {

  @Input() min = 1;
  @Input() field: Field;
  @Input() value: any[];
  @Output() valueChange = new EventEmitter<string>();
  newField: Field;
  idxs: number[] = [];
  current;

  constructor() { }

  ngOnInit() {
    this.initMinMax();
    this.initSubField();
    this.initCollections();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.field) {
      this.initSubField();
    }
    if (changes.value) {
      this.initCollections();
    }
  }

  onValueChange(idx, value) {
    this.value[idx] = value;
  }

  add() {
    this.current++;
    this.initCollections();
  }

  del(idx) {
    this.current--;
    this.value.splice(idx, 1);
    this.initCollections();
  }

  private initMinMax() {
    this.current = this.min;
  }

  private initSubField() {
    if (this.field.options.target_element) {
      this.newField = this.field.options.target_element;
    }
    if (!this.newField.options && this.field.options) {
      this.newField.options = JSON.parse(JSON.stringify(this.field.options));
    }
    if (!this.newField.label) {
      this.newField.label = this.field.label;
    }
  }

  private initCollections() {
    this.idxs = [];
    for (let i = 0; i < this.current; i++) {
      this.idxs.push(i);
    }
  }

}

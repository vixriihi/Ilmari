import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Field } from '../field.component';

@Component({
  selector: 'ilm-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit, OnChanges {

  @Input() field: Field;
  @Input() value: string;
  @Output() valueChange = new EventEmitter<string>();
  options: {key: string, value: string}[] = [];
  hasReset = false;

  constructor() { }

  ngOnInit() {
    this.initOptions();
  }

  ngOnChanges() {
    this.initOptions();
  }

  initOptions() {
    if (!this.field) {
      this.options = [];
      return;
    }
    const options = this.field.options && this.field.options.value_options || {};
    this.options = Object.keys(options)
      .filter(key => {
        if (key === '') {
          this.hasReset = true;
          return false;
        }
        return true;
      })
      .map(key => ({key: key, value: options[key]}));
  }

  updateValue(value) {
    this.value = value;
    this.valueChange.emit(value);
  }
}

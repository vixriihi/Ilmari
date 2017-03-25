import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

export interface Field {
  type: string;
  label: string;
  name: string;
  path: string;
  level: string;
  options?: any;
  validators?: any;
  enumNames?: string[];
}

@Component({
  selector: 'ilm-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent implements OnInit {

  @Input() subField = false;
  @Input() field: Field;
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  updateValue(value) {
    this.value = value;
    this.valueChange.emit(value);
  }

}

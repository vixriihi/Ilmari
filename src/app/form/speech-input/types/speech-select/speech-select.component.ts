import { Component, OnInit, Input } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'ilm-speech-select',
  templateUrl: './speech-select.component.html',
  styleUrls: ['./speech-select.component.css']
})
export class SpeechSelectComponent implements OnInit {

  @Input() valueOptions;

  constructor(public dialogRef: MdDialogRef<SpeechSelectComponent>) { }

  ngOnInit() {
  }

  select(item) {
    this.dialogRef.close(item.value);
  }

}

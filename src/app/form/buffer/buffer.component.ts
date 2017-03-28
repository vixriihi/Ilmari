import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormState } from '../form.reducer';
import { MdDialog } from '@angular/material';
import { TaxonModalComponent } from '../../taxon-modal/taxon-modal.component';

@Component({
  selector: 'ilm-buffer',
  templateUrl: './buffer.component.html',
  styleUrls: ['./buffer.component.css']
})
export class BufferComponent implements OnInit, OnChanges {

  @Input() formStates: FormState[] = [];
  @Output() remove = new EventEmitter<number>();

  states: {idx: number, data: FormState, added: string}[];

  constructor(public dialog: MdDialog) { }

  ngOnInit() {
    this.initList();
  }

  ngOnChanges() {
    this.initList();
  }

  initList() {
    this.states = [];
    this.formStates.map((value, idx) => {
      this.states.push({idx: idx, data: value, added: value.date});
    });
    this.states = this.states.reverse();
  }

  showTaxon(taxon) {
    const taxonDialog = this.dialog.open(TaxonModalComponent, {height: '95%', width: '95%'});
    taxonDialog.componentInstance.taxonId = taxon;
  }

}

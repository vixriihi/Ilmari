import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormState } from '../form.reducer';
import { MdDialog } from '@angular/material';
import { TaxonModalComponent } from '../../taxon-modal/taxon-modal.component';

export interface BufferedState {
  idx: number;
  data: FormState;
  added: string;
}

@Component({
  selector: 'ilm-buffer',
  templateUrl: './buffer.component.html',
  styleUrls: ['./buffer.component.css']
})
export class BufferComponent implements OnInit, OnChanges {

  @Input() formStates: FormState[] = [];
  @Output() remove = new EventEmitter<number>();

  states: BufferedState[];

  constructor(
    public dialog: MdDialog
  ) { }

  ngOnInit() {
    this.initList();
  }

  ngOnChanges() {
    this.initList();
  }

  initList() {
    this.states = this.formStates
      .reduce(
        (prev: BufferedState[], curr: FormState, idx: number) => [{idx, data: curr, added: curr.date}, ...prev],
        []
      );
  }

  showTaxon(taxon) {
    const taxonDialog = this.dialog.open(TaxonModalComponent, {height: '95%', width: '95%'});
    taxonDialog.componentInstance.taxonId = taxon;
  }

}

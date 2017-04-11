import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormState } from '../form.reducer';
import { MdDialog } from '@angular/material';
import { TaxonModalComponent } from '../../taxon-modal/taxon-modal.component';
import { LocationStoreService } from '../../services/location-store.service';

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
  @Output() copy   = new EventEmitter<FormState>();

  states: BufferedState[];

  constructor(
    public dialog: MdDialog,
    private locationService: LocationStoreService
  ) { }

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

  add(state: BufferedState) {
    this.locationService
      .isCurrentLocationFar(state.data.location.lat, state.data.location.lng)
      .subscribe(isFar => {
        if (isFar) {
          return this.copy.emit(state.data);
        }
        if (state.data.extra &&
          state.data.extra['/gatherings/*/units/*/count'] &&
          state.data.extra['/gatherings/*/units/*/count'].match(/^\d*$/)
        ) {
          state.data.extra['/gatherings/*/units/*/count'] = '' + (parseInt(state.data.extra['/gatherings/*/units/*/count'], 10) + 1);
        } else {
          return this.copy.emit(state.data);
        }
      },
      err => this.copy.emit(state.data))
    ;
  }

}

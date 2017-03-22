import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { TaxonService } from '../services/taxon.service';
import { Taxon } from '../model/Taxon';

@Component({
  selector: 'ilm-taxon',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.css']
})
export class TaxonComponent implements OnInit, OnChanges {

  @Input() taxonId;
  taxon: Taxon;
  loading;

  private currentTaxon;

  constructor(public taxonService: TaxonService) { }

  ngOnInit() {
    this.initTaxon();
  }

  ngOnChanges(changes) {
    if (changes.taxonId) {
      this.initTaxon();
    }
  }

  initTaxon() {
    if (!this.taxonId || this.currentTaxon === this.taxonId) {
      return;
    }
    this.loading = true;
    this.currentTaxon = this.taxonId;
    this.taxonService.getTaxon(this.taxonId)
      .subscribe((taxon: Taxon) => {
        this.taxon = taxon;
        this.loading = false;
      });
  }

}

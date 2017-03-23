import { Component, OnInit, ViewChild } from '@angular/core';
import { AggregateQuery, WarehouseService } from '../services/warehouse.service';
import { LocationStoreService } from '../services/location-store.service';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { MdButtonToggleChange, MdDialog } from '@angular/material';
import { TaxonModalComponent } from '../taxon-modal/taxon-modal.component';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AutocompleteService, TaxonAutocomplete } from '../services/autocomplete.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs/Subscription';
import { Stored, StoreService } from '../services/store.service';

@Component({
  selector: 'ilm-near-me',
  templateUrl: './near-me.component.html',
  styleUrls: ['./near-me.component.scss']
})
export class NearMeComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;

  public group: InformalTaxonGroup;
  public taxon: TaxonAutocomplete = {key: '', value: ''};
  public timeLimit = '';
  public place = 0;
  public grid = '';
  public rows = [];
  public loader = false;
  public taxonControl = new FormControl();
  public filteredOptions: Observable<TaxonAutocomplete[]>;

  private allRows = [];
  private subList: Subscription;
  private current;

  constructor(
    private autocompleteService: AutocompleteService,
    private storeService: StoreService,
    public warehouseService: WarehouseService,
    public locationSerivce: LocationStoreService,
    public dialog: MdDialog
  ) {
    this.storeService.get(Stored.DATE_FILTER, this.timeLimit)
      .subscribe(time => this.timeLimit = time);
    this.storeService.get(Stored.PLACE_FILTER, this.place)
      .subscribe(place => this.place = place);
  }

  ngOnInit() {
    this.initList();
    this.filteredOptions = this.taxonControl.valueChanges
      .map(name => this.autocompleteService.makeValue(name))
      .do(name => this.taxon = name)
      .do(name => this.filter(name))
      .switchMap(name => this.autocompleteService.filterByTaxon(name && name.value || '', this.group && this.group.id || ''));
  }

  initList() {
    const key = this.timeLimit + ':' + this.place + ':' + (this.group && this.group.id || '');
    if (this.current === key) {
      return;
    }
    this.current = key;
    this.loader = true;
    this.rows = [];
    if (this.subList) {
      this.subList.unsubscribe();
    }
    this.subList = this.locationSerivce.getCurrentLocation()
      .map(pos => {
        if (!this.place) {
          console.log('NO PLACFE');
          this.grid = '';
          return {};
        }
        this.grid = this.locationSerivce
          .convertToWgsToYkj(pos.coords.latitude, pos.coords.longitude)
          .map(coord => ('' + coord).substring(0, this.place)).join(':');
        return {
          coordinateAccuracyMax: Math.pow(10, (7 - this.place)),
          coordinates: this.grid + ':YKJ'
        };
      })
      .switchMap((base: AggregateQuery) => {
        base.pageSize = 1000;
        base.onlyCount = false;
        base.time = this.timeLimit;
        base.aggregateBy = 'unit.linkings.taxon.speciesId,' +
          'unit.linkings.taxon.speciesNameFinnish,' +
          'unit.linkings.taxon.scientificName';
        if (this.group && this.group.id) {
          base.informalTaxonGroupId = this.group.id;
        }
        return this.warehouseService
          .aggregate(base);
      })
      .map(result => result.results)
      .map(rows => rows.map(row => ({
        id: row.aggregateBy['unit.linkings.taxon.speciesId'].replace('http://tun.fi/', ''),
        count: row.count,
        individualCountSum: row.individualCountSum,
        speciesNameFinnish: row.aggregateBy['unit.linkings.taxon.speciesNameFinnish'],
        scientificName: row.aggregateBy['unit.linkings.taxon.scientificName'],
        name: row.aggregateBy['unit.linkings.taxon.speciesNameFinnish'] || row.aggregateBy['unit.linkings.taxon.scientificName']
      })))
      .subscribe(result => {
        this.table.offset = 0;
        this.rows = result;
        this.allRows = [...result];
        this.loader = false;
      });
  }

  timeChange(toggleChange: MdButtonToggleChange) {
    if (this.timeLimit === toggleChange.value) {
      return;
    }
    this.timeLimit = toggleChange.value;
    this.storeService.set(Stored.DATE_FILTER, this.timeLimit);
    this.initList();
  }

  placeChange(toggleChange: MdButtonToggleChange) {
    if (this.place === toggleChange.value) {
      return;
    }
    this.place = toggleChange.value;
    this.storeService.set(Stored.PLACE_FILTER, this.place);
    this.initList();
  }

  displayTaxon(taxon: TaxonAutocomplete) {
    return taxon ? taxon.value : taxon;
  }

  showTaxon(taxon) {
    const taxonDialog = this.dialog.open(TaxonModalComponent, {height: '95%', width: '95%'});
    taxonDialog.componentInstance.taxonId = taxon;

  }

  selectGroup(group) {
    if (this.group === group) {
      return;
    }
    this.group = group;
    this.initList();
  }

  private filter(auto) {
    const input = auto && auto.value && auto.value.toLowerCase() || '';
    this.rows = this.allRows.filter(data => data.name.toLowerCase().indexOf(input) > -1);
    this.table.offset = 0;
  }
}

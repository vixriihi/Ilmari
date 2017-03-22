import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'ilm-taxon-modal',
  templateUrl: './taxon-modal.component.html',
  styleUrls: ['./taxon-modal.component.css']
})
export class TaxonModalComponent implements OnInit {

  taxonId: string;

  constructor(public dialogRef: MdDialogRef<TaxonModalComponent>) { }

  ngOnInit() {
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { Observable } from 'rxjs/Observable';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { StoreService, Stored } from '../services/store.service';

@Component({
  selector: 'ilm-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  @Input() enableAll = false;
  @Input() activeGroup: InformalTaxonGroup;
  @Output() onSelect = new EventEmitter();
  public rootGroups: Observable<InformalTaxonGroup[]>;

  constructor(public groupsService: GroupsService, private store: StoreService) { }

  ngOnInit() {
    this.rootGroups = this.groupsService.getAllGroups();
  }

  select(group) {
    this.activeGroup = group;
    this.onSelect.emit(group);
  }

}

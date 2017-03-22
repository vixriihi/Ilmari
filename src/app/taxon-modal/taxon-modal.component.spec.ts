import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonModalComponent } from './taxon-modal.component';

describe('TaxonModalComponent', () => {
  let component: TaxonModalComponent;
  let fixture: ComponentFixture<TaxonModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

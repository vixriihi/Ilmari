import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechSelectComponent } from './speech-select.component';

describe('SpeechSelectComponent', () => {
  let component: SpeechSelectComponent;
  let fixture: ComponentFixture<SpeechSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeechSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeechSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

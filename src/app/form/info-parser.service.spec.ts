/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { InfoParserService } from './info-parser.service';

describe('InfoParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InfoParserService]
    });
  });

  it('should ...', inject([InfoParserService], (service: InfoParserService) => {
    expect(service).toBeTruthy();
  }));
});

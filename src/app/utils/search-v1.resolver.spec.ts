import { TestBed } from '@angular/core/testing';

import { SearchV1Resolver } from './search-v1.resolver';

describe('SearchV1Resolver', () => {
  let resolver: SearchV1Resolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(SearchV1Resolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

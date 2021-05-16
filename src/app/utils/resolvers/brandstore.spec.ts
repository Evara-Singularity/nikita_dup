import { TestBed } from '@angular/core/testing';

import { BrandStoreResolver } from './brandstore.resolver';

describe('BrandStoreResolver', () => {
  let resolver: BrandStoreResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(BrandStoreResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

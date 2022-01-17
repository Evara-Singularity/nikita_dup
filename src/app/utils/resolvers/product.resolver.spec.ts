import { TestBed } from '@angular/core/testing';

import { ProductResolver } from './product/product-main.resolver';

describe('ProductResolver', () => {
  let resolver: ProductResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ProductResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AboutResolver } from './about.resolver';

describe('AboutResolver', () => {
  let resolver: AboutResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AboutResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});

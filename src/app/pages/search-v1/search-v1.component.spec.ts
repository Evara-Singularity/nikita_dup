import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchV1Component } from './search-v1.component';

describe('SearchV1Component', () => {
  let component: SearchV1Component;
  let fixture: ComponentFixture<SearchV1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchV1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

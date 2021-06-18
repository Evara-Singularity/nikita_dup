import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedProductListingComponent } from './shared-product-listing.component';

describe('SharedProductListingComponent', () => {
  let component: SharedProductListingComponent;
  let fixture: ComponentFixture<SharedProductListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedProductListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedProductListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

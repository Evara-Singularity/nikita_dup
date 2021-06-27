import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariantSelectListingPageComponent } from './product-variant-select-listing-page.component';

describe('ProductVariantSelectListingPageComponent', () => {
  let component: ProductVariantSelectListingPageComponent;
  let fixture: ComponentFixture<ProductVariantSelectListingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductVariantSelectListingPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductVariantSelectListingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

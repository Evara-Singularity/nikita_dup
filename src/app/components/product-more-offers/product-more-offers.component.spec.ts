import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMoreOffersComponent } from './product-more-offers.component';

describe('ProductMoreOffersComponent', () => {
  let component: ProductMoreOffersComponent;
  let fixture: ComponentFixture<ProductMoreOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductMoreOffersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductMoreOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

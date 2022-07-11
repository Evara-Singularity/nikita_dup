import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCardHorizontalScrollComponent } from './product-card-horizontal-scroll.component';

describe('ProductCardHorizontalScrollComponent', () => {
  let component: ProductCardHorizontalScrollComponent;
  let fixture: ComponentFixture<ProductCardHorizontalScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductCardHorizontalScrollComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductCardHorizontalScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCardVerticalContainerComponent } from './product-card-vertical-container.component';

describe('ProductCardVerticalContainerComponent', () => {
  let component: ProductCardVerticalContainerComponent;
  let fixture: ComponentFixture<ProductCardVerticalContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductCardVerticalContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductCardVerticalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

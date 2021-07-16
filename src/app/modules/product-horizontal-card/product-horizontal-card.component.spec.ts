import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductHorizontalCardComponent } from './product-horizontal-card.component';

describe('ProductHorizontalCardComponent', () => {
  let component: ProductHorizontalCardComponent;
  let fixture: ComponentFixture<ProductHorizontalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductHorizontalCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductHorizontalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

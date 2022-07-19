import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRfqUpdatePopupComponent } from './product-rfq-update-popup.component';

describe('ProductRfqUpdatePopupComponent', () => {
  let component: ProductRfqUpdatePopupComponent;
  let fixture: ComponentFixture<ProductRfqUpdatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductRfqUpdatePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductRfqUpdatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

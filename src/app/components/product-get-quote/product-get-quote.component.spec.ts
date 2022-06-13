import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGetQuoteComponent } from './product-get-quote.component';

describe('ProductGetQuoteComponent', () => {
  let component: ProductGetQuoteComponent;
  let fixture: ComponentFixture<ProductGetQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductGetQuoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductGetQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

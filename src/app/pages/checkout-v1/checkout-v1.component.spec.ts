import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutV1Component } from './checkout-v1.component';

describe('CheckoutV1Component', () => {
  let component: CheckoutV1Component;
  let fixture: ComponentFixture<CheckoutV1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckoutV1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

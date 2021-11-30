import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EGiftVoucherComponent } from './e-gift-voucher.component';

describe('EGiftVoucherComponent', () => {
  let component: EGiftVoucherComponent;
  let fixture: ComponentFixture<EGiftVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EGiftVoucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EGiftVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

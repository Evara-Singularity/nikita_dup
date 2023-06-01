import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingCouponWidgetComponent } from './floating-coupon-widget.component';

describe('FloatingCouponWidgetComponent', () => {
  let component: FloatingCouponWidgetComponent;
  let fixture: ComponentFixture<FloatingCouponWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingCouponWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingCouponWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

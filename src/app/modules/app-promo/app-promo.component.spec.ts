import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPromoComponent } from './app-promo.component';

describe('AppPromoComponent', () => {
  let component: AppPromoComponent;
  let fixture: ComponentFixture<AppPromoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppPromoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

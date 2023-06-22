import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductThreeSixtyViewComponent } from './product-three-sixty-view.component';

describe('ProductThreeSixtyViewComponent', () => {
  let component: ProductThreeSixtyViewComponent;
  let fixture: ComponentFixture<ProductThreeSixtyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductThreeSixtyViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductThreeSixtyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

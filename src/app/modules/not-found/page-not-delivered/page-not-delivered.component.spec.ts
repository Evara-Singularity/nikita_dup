import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNotDeliveredComponent } from './page-not-delivered.component';

describe('PageNotDeliveredComponent', () => {
  let component: PageNotDeliveredComponent;
  let fixture: ComponentFixture<PageNotDeliveredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageNotDeliveredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNotDeliveredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

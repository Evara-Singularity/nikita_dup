import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeFixedHeaderComponent } from './home-fixed-header.component';

describe('HomeFixedHeaderComponent', () => {
  let component: HomeFixedHeaderComponent;
  let fixture: ComponentFixture<HomeFixedHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeFixedHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeFixedHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BnplComponent } from './bnpl.component';

describe('BnplComponent', () => {
  let component: BnplComponent;
  let fixture: ComponentFixture<BnplComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BnplComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BnplComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

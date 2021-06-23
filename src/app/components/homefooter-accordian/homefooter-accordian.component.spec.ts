import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomefooterAccordianComponent } from './homefooter-accordian.component';

describe('HomefooterAccordianComponent', () => {
  let component: HomefooterAccordianComponent;
  let fixture: ComponentFixture<HomefooterAccordianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomefooterAccordianComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomefooterAccordianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutologinPageComponent } from './autologin-page.component';

describe('AutologinPageComponent', () => {
  let component: AutologinPageComponent;
  let fixture: ComponentFixture<AutologinPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutologinPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutologinPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

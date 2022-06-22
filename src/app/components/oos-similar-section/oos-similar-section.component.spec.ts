import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OosSimilarSectionComponent } from './oos-similar-section.component';

describe('OosSimilarSectionComponent', () => {
  let component: OosSimilarSectionComponent;
  let fixture: ComponentFixture<OosSimilarSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OosSimilarSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OosSimilarSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

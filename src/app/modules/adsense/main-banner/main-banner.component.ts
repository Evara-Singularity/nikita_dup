import { Component, ElementRef, Input, NgModule, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Siema from 'siema';
@Component({
  selector: 'adsense-main-banner',
  templateUrl: './main-banner.component.html',
  styleUrls: ['./main-banner.component.scss']
})
export class MainAdsenseBannerComponent {

  @Input() data: any = null;
  @ViewChild('siemaContainer') siemaContainer: ElementRef;
  activeIndex = 0;

  constructor() { }

  ngAfterViewInit() {
    const siema = new Siema({
      selector: this.siemaContainer.nativeElement,
      loop: true,
      duration: 500,
      easing: 'ease-out',
      onChange: () => {
        this.activeIndex = siema.currentSlide;
      }
    });

    setInterval(() => {
      siema.next();
    }, 3000); 
  }

  goToSlide(index: number) {
    const siema = Siema.getInstance(this.siemaContainer.nativeElement);
    siema.goTo(index);
    this.activeIndex = index;
  }
}


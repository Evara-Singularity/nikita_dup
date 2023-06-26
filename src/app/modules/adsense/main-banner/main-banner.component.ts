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
  siemaOptions = {};
  slides = [
    { imageUrl: '../../../assets/img/banner-3.png' },
    { imageUrl: '../../../assets/img/banner-3.png' },
    { imageUrl: '../../../assets/img/banner-3.png' }
  ];

  constructor() { }

  ngAfterViewInit() {
    const siema = new Siema({
      selector: this.siemaContainer.nativeElement,
      loop: true,
      duration: 500,
      easing: 'ease-out'
      // Add any other Siema options you want to customize
    });
    setInterval(() => {
      siema.next();
    }, 3000); 
  }
}


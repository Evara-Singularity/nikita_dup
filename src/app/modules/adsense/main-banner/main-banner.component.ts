import { Component, Input, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSiemaOptions } from 'ngx-siema';
@Component({
  selector: 'adsense-main-banner',
  templateUrl: './main-banner.component.html',
  styleUrls: ['./main-banner.component.scss']
})
export class MainAdsenseBannerComponent {

  @Input() data: any = null;
  carouselOptions = {};
  ngxSiemaOptions: NgxSiemaOptions;

  slides = [
    { imageUrl: '../../../assets/img/banner-3.png' },
    { imageUrl: '../../../assets/img/banner-3.png' },
    { imageUrl: '../../../assets/img/banner-3.png' }
  ];

  constructor() { }

}


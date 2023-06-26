import { Component, Input, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'adsense-main-banner',
  templateUrl: './main-banner.component.html',
  styleUrls: ['./main-banner.component.scss']
})
export class MainAdsenseBannerComponent implements OnInit {

  @Input() data: any = null;

  constructor() { }

  ngOnInit(): void {
    console.log('data', this.data);
  }

}


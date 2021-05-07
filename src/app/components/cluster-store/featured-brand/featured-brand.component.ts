import { CommonModule } from '@angular/common';
import { Input, NgModule } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from 'src/app/config/constants';

@Component({
  selector: 'app-featured-brand',
  templateUrl: './featured-brand.component.html',
  styleUrls: ['./featured-brand.component.scss']
})
export class FeaturedBrandComponent implements OnInit {
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  
  constructor() { 
    
  }

  ngOnInit() {
  }

}

@NgModule({
  declarations: [
    FeaturedBrandComponent
  ],
  imports: [
      CommonModule,
      RouterModule
  ],
})
export class FeaturedBrandModule { }

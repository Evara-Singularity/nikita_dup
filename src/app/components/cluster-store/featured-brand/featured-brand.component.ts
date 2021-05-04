import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
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

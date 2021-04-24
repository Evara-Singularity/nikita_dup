import { Component, OnInit, Input } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';

@Component({
  selector: 'shopby-brand',
  templateUrl: './shopby-brand.component.html',
  styleUrls: ['./shopby-brand.component.scss']
})
export class ShopbyBrandComponent implements OnInit {
  @Input('brand_Data') brand_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;

  constructor() { }

  ngOnInit() {
  }
}
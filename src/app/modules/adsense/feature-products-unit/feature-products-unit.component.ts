import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'adsense-feature-products-unit',
  templateUrl: './feature-products-unit.component.html',
  styleUrls: ['./feature-products-unit.component.css']
})
export class FeatureProductsUnitComponent {

  @Input() data: string[] | null = null;

  constructor() { }

}

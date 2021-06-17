import { Component, Input, OnInit } from '@angular/core';
import { ProductsEntity } from '@app/utils/models/product.listing.search';
import { environment } from 'environments/environment';

@Component({
  selector: 'product-horizontal-card',
  templateUrl: './product-horizontal-card.component.html',
  styleUrls: ['./product-horizontal-card.component.scss']
})
export class ProductHorizontalCardComponent implements OnInit {

  @Input() product: ProductsEntity;
  readonly imageCdnPath = environment.IMAGE_BASE_URL ;

  constructor() { }

  ngOnInit(): void {
  }

}

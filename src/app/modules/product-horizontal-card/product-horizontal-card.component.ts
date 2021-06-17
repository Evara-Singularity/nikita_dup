import { Component, Input, OnInit } from '@angular/core';
import { ProductsEntity } from '@app/utils/models/product.listing.search';
import { environment } from 'environments/environment';

@Component({
  selector: 'product-horizontal-card',
  templateUrl: './product-horizontal-card.component.html',
  styleUrls: ['./product-horizontal-card.component.scss']
})
export class ProductHorizontalCardComponent implements OnInit {

  readonly imageCdnPath = environment.IMAGE_BASE_URL;
  @Input() product: ProductsEntity;

  isOutOfStockByQuantity: boolean = false;
  isOutOfStockByPrice: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.isOutOfStockByQuantity = !this.product.quantityAvailable;
    this.isOutOfStockByPrice = !this.product.salesPrice && !this.product.mrp
  }

}

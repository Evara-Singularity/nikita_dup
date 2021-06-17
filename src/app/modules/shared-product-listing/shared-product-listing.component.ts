import { Component, Input, OnInit } from '@angular/core';
import { ProductListingDataEntity } from '@app/utils/models/product.listing.search';

@Component({
  selector: 'shared-product-listing',
  templateUrl: './shared-product-listing.component.html',
  styleUrls: ['./shared-product-listing.component.scss']
})
export class SharedProductListingComponent implements OnInit {

  @Input() productsListingData: ProductListingDataEntity;

  constructor() { }

  ngOnInit(): void {
  }

}

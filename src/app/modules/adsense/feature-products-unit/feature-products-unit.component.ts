import { AfterViewInit, Component, Input } from '@angular/core';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductService } from '@app/utils/services/product.service';
import { ProductListService } from '@app/utils/services/productList.service';

@Component({
  selector: 'adsense-feature-products-unit',
  templateUrl: './feature-products-unit.component.html',
  styleUrls: ['./feature-products-unit.component.scss']
})
export class FeatureProductsUnitComponent implements AfterViewInit {

  @Input() data: string[] | null = null;
  @Input('pageName') pageName = "pdp";
  @Input('moduleUsedIn') moduleUsedIn = "PRODUCT_RECENT_PRODUCT";
  @Input() analytics = null;
  public msnListData: ProductsEntity[] = null;
  readonly cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: true,
    enableBuyNow: true,
    enableFeatures: false,
    enableRating: true,
    enableVideo: false,
    // design config
    enableCard: true,
    verticalOrientation: true,
    horizontalOrientation: false,
    lazyLoadImage: false,
  }
  cardMetaInfo: ProductCardMetaInfo = null;

  constructor(
    private _productService: ProductService,
    private _productListService: ProductListService,
  ) { }


  ngAfterViewInit(): void {
    this.getAllProducts();
  }

  getAllProducts() {

    if (this.data && this.data.length > 0) {
      this._productService.getProductList(this.data).subscribe(result => {
        if (result && result['searchProductList'] && result['searchProductList'].length > 0) {
          this.msnListData = this._productListService.getSerachProductList(result['searchProductList']);
        }
      })
    }
  }

}

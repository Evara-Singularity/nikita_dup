import { CommonModule } from "@angular/common";
import { Component, Input, NgModule, OnInit } from "@angular/core";
import { ProductCardVerticalGridViewModule } from "@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module";
import { ProductCardVerticalContainerModule } from "@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module";
import { ProductCardFeature } from "@app/utils/models/product.listing.search";
import { ProductService } from "@app/utils/services/product.service";
import { timeStamp } from "console";

@Component({
  selector: "shop-by-brands",
  templateUrl: "./shop-by-brands.component.html",
  styleUrls: ["./shop-by-brands.component.scss"],
})
export class ShopByBrandsComponent implements OnInit {
  @Input("data") data: any;
  @Input("categoryName") categoryName;
  @Input('productStaticData') productStaticData;

  readonly cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: false,
    enableBuyNow: false,
    enableFullAddToCart: true,
    enableFeatures: false,
    enableRating: true,
    enableVideo: false,
    // design config
    enableCard: true,
    verticalOrientation: true,
    horizontalOrientation: false,
    lazyLoadImage: true,
  };

  tabsArray: { id: number; name: string; data: any[]; isSelected: boolean }[] = [];

  constructor(private _productService: ProductService) {}

  ngOnInit(): void {
    let count = 0;
    for (const i in this.data) {
      count += 1;
      this.tabsArray.push({
        id: count,
        name: i,
        data: (this.data[i] as any[]).map((item) =>
          this._productService.recentProductResponseToProductEntityV1(item)
        ),
        isSelected: false,
      });
    }
    this.tabsArray.reverse();
    if (this.tabsArray.length > 0) {
      this.tabsArray[0].isSelected = true;
    }
  }

  setProductTab(tabName) {
    this.tabsArray.forEach((element, index) => {
      this.tabsArray[index].isSelected = false;
    });
    this.tabsArray.forEach((element, index) => {
      if (this.tabsArray[index].id == tabName) {
        this.tabsArray[index].isSelected = true;
      }
    });
  }
}

@NgModule({
  declarations: [ShopByBrandsComponent],
  imports: [
    CommonModule,
    ProductCardVerticalContainerModule,
    ProductCardVerticalGridViewModule,
  ],
  exports: [ShopByBrandsComponent],
})
export class ShopByBrandsModule {}

import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  Input,
  NgModule,
  OnInit,
} from "@angular/core";
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
    enableAddToCart: true,
    enableBuyNow: true,
    enableFullAddToCart: false,
    enableFeatures: false,
    enableRating: true,
    enableVideo: false,
    // design config
    enableCard: true,
    verticalOrientation: true,
    horizontalOrientation: false,
    lazyLoadImage: true,
  };

  tabsArray: {
    id: number;
    name: string;
    data: any[];
    msnList: any[];
    isSelected: boolean;
  }[] = [];

  constructor(
    private _productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let count = 0;
    for (const i in this.data) {
      count += 1;
      this.tabsArray.push({
        id: count,
        name: i,
        msnList: this.data[i],
        data: [],
        isSelected: false,
      });
    }
    // get First brand Data
    this.getBrandData(0);
  }

  setProductTab(tabName) {
    this.tabsArray.forEach((element, index) => {
      this.tabsArray[index].isSelected = false;
    });
    this.tabsArray.forEach((element, index) => {
      if (
        this.tabsArray[index].id == tabName &&
        this.tabsArray[index].data.length == 0
      ) {
        this.getBrandData(index);
      } else if (
        this.tabsArray[index].id == tabName &&
        this.tabsArray[index].data.length > 0
      ) {
        this.tabsArray[index].isSelected = true;
      }
    });
  }

  getBrandData(index) {
    this._productService
      .getProductList(this.tabsArray[index].msnList)
      .subscribe((response) => {
        if (response && response["searchProductList"]?.length > 0) {
          const data =
            (response["searchProductList"] as any[]) 
              .map((item) =>
                this._productService.searchResponseToProductEntity(
                  item
                )
              )
              .filter((res) => this._productService.isInStock(res) == true) ||
            [];
          if(data.length == 0){ 
            this.removeBrandData(index); 
          }else{
            this.tabsArray[index].isSelected = true;
            this.tabsArray[index].data = data;
          }
          this.cdr.detectChanges();
        }else{
          this.tabsArray[index].data = [];
          this.tabsArray[index].isSelected = false;
          this.tabsArray[index].msnList = [];
        }
      });
      this.cdr.detectChanges();
  }

  private removeBrandData(index){
    this.tabsArray.splice(index, 1);
    this.getBrandData(index);
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

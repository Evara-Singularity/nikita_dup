import { CommonModule } from "@angular/common";
import {
  Component,
  NgModule,
  Output,
  EventEmitter,
} from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { ProductCardFeature } from "@app/utils/models/product.listing.search";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { DataService } from "@app/utils/services/data.service";
import { ProductService } from "@app/utils/services/product.service";
import { Subscription } from "rxjs";
import { BottomMenuModule } from "../../modules/bottomMenu/bottom-menu.module";
import { ProductCardVerticalGridViewModule } from "../../modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module";
import { ProductCardVerticalContainerModule } from "../../modules/ui/product-card-vertical-container/product-card-vertical-container.module";
import { ProductSkeletonsModule } from "../product-skeletons/product-skeletons.component";

@Component({
  selector: "wishlist-popup",
  templateUrl: "./wishlist-popup.component.html",
  styleUrls: ["./wishlist-popup.component.scss"],
})
export class WishlistPopupComponent {
  wishListData: Array<object> = [];
  @Output("closePopup$") closePopup$ = new EventEmitter();
  isDataFetched: any = null;
  cartSubscription: Subscription;

  readonly cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: false,
    enableBuyNow: false,
    enableFeatures: false,
    enableRating: true,
    enableVideo: false,
    enableFullAddToCart: true,
    // design config
    enableCard: true,
    verticalOrientation: true,
    horizontalOrientation: false,
    lazyLoadImage: false,
  };

  constructor(
    private _productService: ProductService,
    private _localAuthService: LocalAuthService,
    private _dataService: DataService,
    private _cartService: CartService
  ) {
    this.getWishlistData();
  }

  closePopup() {
    this.closePopup$.emit(true);
  }

  ngOnInit(): void {
    this.cartSubscription = this._cartService.isAddedToCartSubject.subscribe(
      (response) => {
        this.getWishlistData();
      }
    );
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
  }

  private getWishlistData() {
    const userSession = this._localAuthService.getUserSession();
    const wishlistPayload = {
      idUser: userSession["userId"],
      userType: "business",
    };
    const wishlistUrl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRC_LIST;
    this._dataService
      .callRestful("GET", wishlistUrl, { params: wishlistPayload })
      .subscribe(
        (response) => {
          if (response && response["status"]) {
            const wishListResponseData = response["data"];
            this.wishListData = wishListResponseData
              .map((product) =>
                this._productService.wishlistToProductEntity(product)
              )
              .filter((res) => this._productService.isInStock(res) == true);
          }
          this.isDataFetched = response;
        },
        (error) => {
          this.wishListData = [];
        }
      );
  }
}

@NgModule({
  declarations: [WishlistPopupComponent],
  imports: [
    CommonModule,
    BottomMenuModule,
    ProductCardVerticalGridViewModule,
    ProductCardVerticalContainerModule,
    ProductSkeletonsModule,
  ],
})
export class WishlistPopupModule {}

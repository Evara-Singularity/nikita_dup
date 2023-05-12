import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { ClientUtility } from '@app/utils/client.utility';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { CommonService } from '@app/utils/services/common.service';
import { ProductService } from '@app/utils/services/product.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProductCardVerticalGridViewProductPriceCompareModule } from "../../modules/product-card/product-card-vertical-grid-view-product-price-compare/product-card-vertical-grid-view-product-price-compare.module";

@Component({
  selector: 'app-product-price-compare',
  templateUrl: './product-price-compare.component.html',
  styleUrls: ['./product-price-compare.component.scss']
})
export class ProductPriceCompareComponent implements OnInit {

  productStaticData = this.commonService.defaultLocaleValue;
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    similarProducts: ProductsEntity[] = null;
    @Input('outOfStock') outOfStock = false;
    @Input('partNumber') partNumber;
    @Input('groupId') groupId;
    @Input('productName') productName;
    @Input('categoryCode') categoryCode;
    @Input('analytics') analytics = null;
    @Output('similarDataLoaded$') similarDataLoaded$ = new EventEmitter();
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
        lazyLoadImage: false
    }
    cardMetaInfo: ProductCardMetaInfo = null;

    constructor(
        public commonService: CommonService,
        private router: Router,
        private productService: ProductService,
    ) { }

    ngOnInit(): void {
        this.getStaticSubjectData()
        this.getProductSimilar();
        this.cardMetaInfo = {
            redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
            redirectedSectionName: this.outOfStock ? 'similar_product_oos' : 'similar_products'
        }
    }
    getStaticSubjectData(){
        this.commonService.changeStaticJson.subscribe(staticJsonData => {
          this.commonService.defaultLocaleValue = staticJsonData;
          this.productStaticData = staticJsonData;
        });
      }

    getProductSimilar() {
        this.productService.getSimilarProducts(this.productName, this.categoryCode, this.partNumber, this.groupId).subscribe((response: any) => {
            let products = response['products'];
            if (products && (products as []).length > 0) {
                this.similarProducts = (products as any[]).map(product => this.productService.searchResponseToProductEntity(product));
                this.similarDataLoaded$.emit(true);
            }
        })
    }

    navigateTo(url) {
        this.commonService.setSectionClickInformation(this.outOfStock ? 'similar_product_oos' : 'similar_products', 'pdp')
        this.router.navigateByUrl(url);
        if (this.commonService.isBrowser) {
            ClientUtility.scrollToTop(100);
        }
    }

}





@NgModule({
    declarations: [
        ProductPriceCompareComponent
    ],
    exports: [ProductPriceCompareComponent],
    imports: [
        CommonModule,
        MathFloorPipeModule,
        MathCeilPipeModule,
        LazyLoadImageModule,
        ProductCardVerticalContainerModule,
        ProductCardVerticalGridViewProductPriceCompareModule
    ]
})
export class ProductPriceCompareModule { }

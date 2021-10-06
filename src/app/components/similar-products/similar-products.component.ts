import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../utils/services/product.service';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '@app/config/constants';
import { ClientUtility } from '@app/utils/client.utility';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductHorizontalCardModule } from '@app/modules/product-horizontal-card/product-horizontal-card.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProductListService } from '@app/utils/services/productList.service';

@Component({
    selector: 'app-similar-products',
    templateUrl: './similar-products.component.html',
    styleUrls: ['./similar-products.component.scss']
})
export class SimilarProductsComponent implements OnInit
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    similarProducts: ProductsEntity[] = null;
    @Input('outOfStock') outOfStock = false;
    @Input('productName') productName;
    @Input('categoryCode') categoryCode;
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
        private router:Router,
        private productService: ProductService,
        private productListService: ProductListService,
    ) { }

    ngOnInit(): void {
        this.getProductSimilar();
        this.cardMetaInfo = {
            redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
            redirectedSectionName: this.outOfStock ? 'similar_product_oos' : 'similar_products'
        }
    }

    getProductSimilar() {
        this.productService.getSimilarProducts(this.productName, this.categoryCode).subscribe((response: any) => {
            let products = response['products'];
            if (products && (products as []).length > 0) {
                this.similarProducts = (products as any[]).map(product => this.productListService.searchResponseToProductEntity(product));
            }
        })
    }

    navigateTo(url){
        this.commonService.setSectionClickInformation(this.outOfStock ? 'similar_product_oos' : 'similar_products', 'pdp')
        this.router.navigateByUrl(url);
        if ( this.commonService.isBrowser ) {
            ClientUtility.scrollToTop(100);
        }
    }

}

@NgModule({
    declarations: [
        SimilarProductsComponent
    ],
    imports: [
        CommonModule,
        MathFloorPipeModule,
        MathCeilPipeModule,
        ProductHorizontalCardModule,
        LazyLoadImageModule
    ]
})
export class ProductModule { }
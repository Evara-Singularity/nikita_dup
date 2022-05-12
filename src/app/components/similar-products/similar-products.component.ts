import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../utils/services/product.service';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '@app/config/constants';
import { ClientUtility } from '@app/utils/client.utility';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductCardModule } from '@app/modules/product-horizontal-card/product-card.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';

@Component({
    selector: 'app-similar-products',
    templateUrl: './similar-products.component.html',
    styleUrls: ['./similar-products.component.scss']
})
export class SimilarProductsComponent implements OnInit {
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
        this.getProductSimilar();
        this.cardMetaInfo = {
            redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
            redirectedSectionName: this.outOfStock ? 'similar_product_oos' : 'similar_products'
        }
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
        SimilarProductsComponent
    ],
    imports: [
        CommonModule,
        MathFloorPipeModule,
        MathCeilPipeModule,
        ProductCardModule,
        LazyLoadImageModule,
        ProductCardVerticalContainerModule
    ]
})
export class ProductModule { }
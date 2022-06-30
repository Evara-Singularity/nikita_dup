import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductService } from '../../utils/services/product.service';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '@app/config/constants';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';

@Component({
    selector: 'product-popular-deals',
    templateUrl: './product-popular-deals.html',
    styleUrls: ['./product-popular-deals.scss']
})
export class ProductPopularDealsComponent implements OnInit {
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    polpularDealsProducts: ProductsEntity[] = null;
    @Input('outOfStock') outOfStock = false;
    
    @Input('partNumber') partNumber; //REVIEW POINTS:: no use 
    @Input('groupId') groupId;//REVIEW POINTS:: no use 
    @Input('productName') productName;//REVIEW POINTS:: no use 
    @Input('categoryCode') categoryCode;//REVIEW POINTS:: no use 

    @Input('analytics') analytics = null;

    @Output('popularDealsDataLoaded$') popularDealsDataLoaded$ = new EventEmitter(); // no use 

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
    resultArray: any[];
    selectedIndex: any;
    selectedProducts: ProductsEntity[] = null;

    constructor(
        public commonService: CommonService,
        private productService: ProductService,
    ) { }

    ngOnInit(): void {
        this.getProductPopularDeals();
        // REVIEW POINTS:: verify is this working. 
        this.cardMetaInfo = {
            redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
            redirectedSectionName: this.outOfStock ? 'product_popular_deals_oos' : 'product_popular_deals_oos'
        }
    }

    getProductPopularDeals() {
        this.productService.getProductPopular(this.categoryCode).subscribe((response: any) => {
            this.resultArray = Object.keys(response['taggedProducts']).map(index => {
                return response['taggedProducts'][index];
            }).filter((item) => item.productList.length !== 0); // removing Tags with 0 products
            this.setProductList(0, this.resultArray[0]);        // to set first default value
        })
    }
    

    setProductList(index, products) {
        this.selectedIndex = index;
        if (products['productList'] && (products['productList'] as []).length > 0) {
            this.selectedProducts = (products['productList'] as any[]).map(product => this.productService.searchResponseToProductEntity(product));
        }
    }

}

@NgModule({
    declarations: [
        ProductPopularDealsComponent
    ],
    imports: [
        CommonModule,
        MathFloorPipeModule,
        MathCeilPipeModule,
        LazyLoadImageModule,
        ProductCardVerticalContainerModule,
        ProductCardVerticalGridViewModule
    ]
})
export class ProductModule { }
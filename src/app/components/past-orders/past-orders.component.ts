import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { ProductCardFeature, ProductCardMetaInfo } from '@app/utils/models/product.listing.search';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { ProductBrowserService } from '@app/utils/services/product-browser.service';
import { LocalStorageService } from 'ngx-webstorage';
import { CommonService } from '../../utils/services/common.service';

@Component({
    selector: 'past-orders',
    templateUrl: './past-orders.component.html',
    styleUrls: ['./past-orders.component.scss']
})
export class PastOrdersComponent implements OnInit
{
    productStaticData = this._commonService.defaultLocaleValue;
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    productList: any[] = [];
    @Input('userId') userId = null;
    @Input('outOfStock') outOfStock: boolean = false;
    @Input('analytics') analytics = null;
    isRequested = false;
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

    constructor(private _productService: ProductBrowserService, public localStorageService: LocalStorageService,private _commonService:CommonService) { }

    ngOnInit(): void
    {
        this.getStaticSubjectData();
        this.userId = this.localStorageService.retrieve('user').userId;
        this.cardMetaInfo = {
            redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
            redirectedSectionName: this.outOfStock ? 'past_orders_product_oos' : 'past_orders__products'
        }
    }
    getStaticSubjectData(){
        this._commonService.changeStaticJson.subscribe(staticJsonData => {
          this.productStaticData = staticJsonData;
        });
      }

    onVisiblePastOrders($event)
    {
        if (!this.userId) { this.isRequested = true;return}
        this._productService.getPastOrderProducts(this.userId).subscribe((response) =>
        {
            if (response['status']) {
                this.productList = (response['data'] as any[]).slice(0,10).map(product => this._productService.pastOrdersProductResponseToProductEntity(product));
            }
            this.isRequested = true;
        });
        
    }

    get pageDisplay() { return !(this.isRequested) || this.productList.length >= 2 }
}

@NgModule({
    declarations: [PastOrdersComponent],
    imports: [
        RouterModule,
        CommonModule,
        MathCeilPipeModule,
        MathFloorPipeModule,
        ProductCardVerticalGridViewModule,
        ObserveVisibilityDirectiveModule,
        ProductCardVerticalContainerModule,
    ],
    exports: [PastOrdersComponent]
})
export class PastOrdersModule { }


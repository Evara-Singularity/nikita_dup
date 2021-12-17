import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ProductHorizontalCardModule } from '@app/modules/product-horizontal-card/product-horizontal-card.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { ProductCardFeature, ProductCardMetaInfo } from '@app/utils/models/product.listing.search';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { ProductBrowserService } from '@app/utils/services/product-browser.service';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'past-orders',
    templateUrl: './past-orders.component.html',
    styleUrls: ['./past-orders.component.scss']
})
export class PastOrdersComponent implements OnInit
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    productList: any[] = [];
    @Input('userId') userId = null;
    @Input('outOfStock') outOfStock: boolean = false;
    @Input('analytics') analytics = null;
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

    constructor(private _productService: ProductBrowserService, public localStorageService: LocalStorageService,) { }

    ngOnInit(): void
    {
        let user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == 'true') { this.userId = user.userId };
    }

    onVisiblePastOrders($event)
    {
        if (!this.userId) return;
        this._productService.getPastOrderProducts(this.userId).subscribe((response) =>
        {
            if (response['status']) {
                this.productList = (response['data'] as any[]).map(product => this._productService.pastOrdersProductResponseToProductEntity(product));
            }
        });
    }

    get pageDisplay() { return this.productList.length > 2 && this.userId !== null; }
}

@NgModule({
    declarations: [PastOrdersComponent],
    imports: [
        RouterModule,
        CommonModule,
        MathCeilPipeModule,
        MathFloorPipeModule,
        ProductHorizontalCardModule,
        ObserveVisibilityDirectiveModule,
    ],
    exports: [PastOrdersComponent]
})
export class PastOrdersModule { }


import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./alp.routing";
import { MetaModule } from '@ngx-meta/core';
import { AlpComponent } from "./alp.component";
import { AlpService } from "./alp.service";
import { ObjectToArrayPipeModule } from "@pipes/object-to-array.pipe";
import { MathFloorPipeModule } from "@pipes/math-floor";
import { ProductListModule } from '@modules/productList/productList.module'
import { SortByModule } from "@components/sortBy/sortBy.module";
import { KpToggleDirectiveModule } from '@utils/directives/kp-toggle.directive';
import { PopUpModule } from '@modules/popUp/pop-up.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgxSiemaModule } from 'ngx-siema';
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { DiscountPipeModule } from '@pipes/discount.pipe';
import { GroupByComponent } from './group-by/group-by.component';
import { BestSellerComponent } from './best-seller/best-seller.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { BreadcrumbNavModule } from '@app/modules/breadcrumb-nav/breadcrumb-nav.module';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { ProductListingAppPromoModule } from '@app/modules/product-listing-app-promo/product-listing-app-promo.module';

@NgModule({
    imports: [
        CommonModule,
        routing,
        ObjectToArrayPipeModule,
        RouterModule,
        ProductListModule,
        SortByModule,
        NgxPaginationModule,
        ObserveVisibilityDirectiveModule,
        MetaModule.forRoot(),
        PopUpModule,
        LazyLoadImageModule,
        BreadcrumbNavModule,
        KpToggleDirectiveModule,
        MathFloorPipeModule,
        NgxSiemaModule.forRoot(),
        MathCeilPipeModule,
        DiscountPipeModule,
        SharedProductListingModule,
        ProductListingAppPromoModule
    ],
    declarations: [
        AlpComponent,
        GroupByComponent,
        BestSellerComponent,
    ],
    providers: [
        AlpService,
    ]
})

export class AlpModule { }
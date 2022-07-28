import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { CategoryRoutingModule } from "./category.routing";
import { CategoryComponent } from "./category.component";
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { BreadcrumbNavModule } from '@app/modules/breadcrumb-nav/breadcrumb-nav.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { RecentArticlesModule } from '@app/components/recent-articles/recent-articles.component';
import { CategoryFooterModule } from '@app/components/category-footer/category-footer.component';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';
import { ProductListingAppPromoModule } from '@app/modules/product-listing-app-promo/product-listing-app-promo.module';
import { AccordianModule } from "@app/modules/accordian/accordian.module";
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';
@NgModule({
    imports: [
        CommonModule,
        BreadcrumbNavModule,
        LazyLoadImageModule,
        CategoryFooterModule,
        RecentArticlesModule,
        WhatsAppToastModule,
        CategoryRoutingModule,
        KpToggleDirectiveModule,
        SharedProductListingModule,
        ProductListingAppPromoModule,
        AccordianModule,
        AppPromoModule
    ],
    declarations: [
        CategoryComponent,
    ],
})

export class CategoryModule { }
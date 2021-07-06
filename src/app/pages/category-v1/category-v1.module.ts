import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { CategoryV1RoutingModule } from "./category-v1.routing";
import { CategoryV1Component } from "./category-v1.component";
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { BreadcrumbNavModule } from '@app/modules/breadcrumb-nav/breadcrumb-nav.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { RecentArticlesModule } from '@app/components/recent-articles/recent-articles.component';
import { CategoryFooterModule } from '@app/components/category-footer/category-footer.component';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';

@NgModule({
    imports: [
        CommonModule,
        BreadcrumbNavModule,
        LazyLoadImageModule,
        CategoryFooterModule,
        RecentArticlesModule,
        CategoryV1RoutingModule,
        KpToggleDirectiveModule,
        SharedProductListingModule
    ],
    declarations: [
        CategoryV1Component,
    ],
})

export class CategoryV1Module { }
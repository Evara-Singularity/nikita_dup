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

@NgModule({
    imports: [
        CommonModule,
        BreadcrumbNavModule,
        LazyLoadImageModule,
        CategoryFooterModule,
        RecentArticlesModule,
        CategoryRoutingModule,
        KpToggleDirectiveModule,
        SharedProductListingModule
    ],
    declarations: [
        CategoryComponent,
    ],
})

export class CategoryModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { CategoryRoutingModule } from "./category.routing";
import { MetaModule } from '@ngx-meta/core';
import { CategoryComponent } from "./category.component";
import { ObjectToArrayPipeModule } from "@app/utils/pipes/object-to-array.pipe";
import { BreadcrumbNavModule } from '@app/modules/breadcrumb-nav/breadcrumb-nav.module';
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { ProductListModule } from '@app/modules/productList/productList.module'
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CmsModule } from '../../modules/cms/cms.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { SubCategoryModule } from '@components/subCategory/subCategory.component';
import { CategoryFooterModule } from '@components/category-footer/category-footer.component';
import { RecentArticlesModule } from '@app/components/recent-articles/recent-articles.component';

@NgModule({
    imports: [
        CommonModule,
        CategoryRoutingModule,
        NgxPaginationModule,
        BreadcrumbNavModule,
        CmsModule,
        ObjectToArrayPipeModule,
        ProductListModule,
        SubCategoryModule,
        CategoryFooterModule,
        RecentArticlesModule,
        ObserveVisibilityDirectiveModule,
        MetaModule.forRoot(),
        PopUpModule,
        LazyLoadImageModule,
        KpToggleDirectiveModule,
        MathFloorPipeModule
    ],
    declarations: [
        CategoryComponent,
    ],
})

export class CategoryModule { }
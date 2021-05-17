import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing as CategoryRouting } from "./category.routing";
import { MetaModule } from '@ngx-meta/core';
import { CategoryComponent } from "./category.component";
import { ObjectToArrayPipeModule } from "@app/utils/pipes/object-to-array.pipe";
import { BreadcrumbNavModule } from '@app/modules/breadcrumb-nav/breadcrumb-nav.module';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { ProductListModule } from '@app/modules/productList/productList.module'
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CmsModule } from '../../modules/cms/cms.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
    imports: [
        CommonModule,
        CategoryRouting,
        NgxPaginationModule,
        BreadcrumbNavModule,
        CmsModule,
        ObjectToArrayPipeModule,
        RouterModule,
        ProductListModule,
        NgxPageScrollModule,
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
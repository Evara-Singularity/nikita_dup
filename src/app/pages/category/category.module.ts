import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./category.routing";
import { MetaModule } from '@ngx-meta/core';
import {CategoryComponent} from "./category.component";
import { FilterModule } from "@app/modules/filter/filter.module";
import {CategoryService} from "./category.service";
import {ObjectToArrayPipeModule} from "@app/utils/pipes/object-to-array.pipe";
import {PaginationModule} from "@app/modules/pagination/pagination.module";
import {SubCategoryService} from "./subCategory/subCategory.service";
import {SubCategoryComponent} from "./subCategory/subCategory.component";
import { BreadCrumpModule } from '@app/modules/breadcrump/breadcrump.module';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { ProductListModule } from '@app/modules/productList/productList.module'
import {SortByModule} from "@app/modules/sortBy/sortBy.module";
import { PageSizeModule } from "@app/modules/pageSize/pageSize.module";
import { LoaderModule } from '@app/modules/loader/loader.module';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CatBestsellerComponent } from './cat-bestseller/cat-bestseller.component';
import { CatStaticComponent } from './cat-static/cat-static.component';
import { ShopbyBrandComponent } from './shopby-brand/shopby-brand.component';
import { ShopbyFeatrComponent } from './shopby-featr/shopby-featr.component';
import { SlpSubCategoryComponent } from './slp-sub-category/slp-sub-category.component';
import { CmsModule } from '../../modules/cms/cms.module';

@NgModule({
    imports: [
        CommonModule,
        routing,
        CmsModule,
        ObjectToArrayPipeModule,
        RouterModule,
        BreadCrumpModule,
        FilterModule,
        ProductListModule,
        NgxPageScrollCoreModule,
        NgxPageScrollModule,
        PaginationModule,
        SortByModule,
        PageSizeModule,
        LoaderModule,
        MetaModule.forRoot(),
        PopUpModule,
        LazyLoadImageModule,
        KpToggleDirectiveModule,
        MathFloorPipeModule
    ],
    declarations: [
        CategoryComponent,
        SubCategoryComponent,
        CatBestsellerComponent,
        CatStaticComponent,
        ShopbyBrandComponent,
        ShopbyFeatrComponent,
        SlpSubCategoryComponent,
    ],
    providers: [
        CategoryService,
        SubCategoryService
    ]
})

export class CategoryModule{}
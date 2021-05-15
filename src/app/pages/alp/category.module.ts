import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./category.routing";
import { MetaModule } from '@ngx-meta/core';
import {CategoryComponent} from "./category.component";
import {CategoryService} from "./category.service";
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgxSiemaModule } from 'ngx-siema';
import { FilterModule } from 'src/app/modules/filter/filter.module';
import { MathFloorPipeModule } from 'src/app/utils/pipes/math-floor';
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';
import { DiscountPipeModule } from 'src/app/utils/pipes/discount.pipe';
import { PaginationModule } from 'src/app/modules/pagination/pagination.module';
import { BreadCrumpModule } from 'src/app/modules/breadcrump/breadcrump.module';
import { PopUpModule } from 'src/app/modules/popUp/pop-up.module';
//import { LoaderModule } from 'src/app/modules/loader/loader.module';
import { SortByModule } from 'src/app/modules/sortBy/sortBy.module';
import { ProductListModule } from 'src/app/modules/productList/productList.module';
import { GroupByComponent } from 'src/app/components/group-by/group-by.component';
import { BestSellerComponent } from 'src/app/components/best-seller/best-seller.component';

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule,
        BreadCrumpModule,
        FilterModule,
        ProductListModule,
        NgxPageScrollModule,
        PaginationModule,
        SortByModule,
        //LoaderModule,
        MetaModule.forRoot(),
        PopUpModule,
        LazyLoadImageModule,
        NgxSiemaModule.forRoot(),
        MathCeilPipeModule,
        DiscountPipeModule,
    ],
    declarations: [
        CategoryComponent,
        GroupByComponent,
        BestSellerComponent,
    ],
    providers: [
        CategoryService
    ]
})

export class CategoryModule{}
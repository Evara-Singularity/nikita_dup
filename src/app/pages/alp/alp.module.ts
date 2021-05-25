import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./alp.routing";
import { MetaModule } from '@ngx-meta/core';
import {CategoryComponent} from "./alp.component";
import {CategoryService} from "./alp.service";
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgxSiemaModule } from 'ngx-siema';
import { FilterModule } from '@modules/filter/filter.module';
import { MathCeilPipeModule } from '@utils/pipes/math-ceil';
import { DiscountPipeModule } from '@utils/pipes/discount.pipe';
import { PaginationModule } from '@modules/pagination/pagination.module';
import { BreadCrumpModule } from '@modules/breadcrump/breadcrump.module';
import { PopUpModule } from '@modules/popUp/pop-up.module';
import { SortByModule } from '@modules/sortBy/sortBy.module';
import { ProductListModule } from '@modules/productList/productList.module';
import { GroupByComponent } from '@components/group-by/group-by.component';
import { BestSellerComponent } from '@components/best-seller/best-seller.component';

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule,
        BreadCrumpModule,
        FilterModule,
        ProductListModule,
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
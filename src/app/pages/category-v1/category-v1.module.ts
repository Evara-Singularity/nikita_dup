import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { CategoryV1RoutingModule } from "./category-v1.routing";
import { CategoryV1Component } from "./category-v1.component";
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';

@NgModule({
    imports: [
        CommonModule,
        CategoryV1RoutingModule,
        SharedProductListingModule
    ],
    declarations: [
        CategoryV1Component,
    ],
})

export class CategoryV1Module { }
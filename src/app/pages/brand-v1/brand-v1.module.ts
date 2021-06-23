import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { BrandV1Component } from "./brand-v1.component";
import { BrandV1RoutingModule } from './brand-v1.routing';

@NgModule({
    imports: [
        CommonModule,
        BrandV1RoutingModule,
        SharedProductListingModule
    ],
    declarations: [
        BrandV1Component,
    ],
})

export class BrandV1Module {}
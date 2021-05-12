import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import { routing as BrandRouting } from "./brand.routing";
import { MetaModule } from '@ngx-meta/core';
import {BrandComponent} from "./brand.component";
import {ObjectToArrayPipeModule} from "@app/utils/pipes/object-to-array.pipe";
import { BreadCrumpModule } from '@app/modules/breadcrump/breadcrump.module';
import { ProductListModule } from '@app/modules/productList/productList.module';
import { LoaderModule } from '@app/modules/loader/loader.module';
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';
import { CmsModule } from '@app/modules/cms/cms.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
    imports: [
        CmsModule,
        BrandRouting,
        LoaderModule,
        CommonModule,
        BreadCrumpModule,
        NgxPaginationModule,
        ReplacePipeModule,
        ProductListModule,
        MathFloorPipeModule,
        MetaModule.forRoot(),
        NgxPageScrollCoreModule,
        ObjectToArrayPipeModule,
        KpToggleDirectiveModule,
        ObserveVisibilityDirectiveModule,
    ],
    declarations: [
        BrandComponent,
    ],
    providers: [
    ]
})

export class BrandModule{}
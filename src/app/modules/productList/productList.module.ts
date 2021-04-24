import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ProductListComponent } from "./productList.component";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { RatingPipeModule } from 'src/app/utils/pipes/rating.pipe';
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';
import { MathFloorPipeModule } from 'src/app/utils/pipes/math-floor';
import { ArrayFilterPipeModule } from 'src/app/utils/pipes/k-array-filter.pipe';
import { ShowAvailableOnRequestLastPipeModule } from 'src/app/utils/pipes/show-available-on-request-last.pipe';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MathCeilPipeModule,
        MathFloorPipeModule,
        LazyLoadImageModule,
        ShowAvailableOnRequestLastPipeModule,
        ArrayFilterPipeModule,
        RatingPipeModule,
    ],
    exports: [ProductListComponent],
    declarations: [ProductListComponent],
    providers: [],
})
export class ProductListModule { }
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FloatingCouponWidgetComponent } from "./floating-coupon-widget.component";
import { MathFloorPipeModule } from "../../utils/pipes/math-floor";



@NgModule({
    declarations: [FloatingCouponWidgetComponent],
    exports: [
        FloatingCouponWidgetComponent,
    ],
    imports: [
        CommonModule,
        MathFloorPipeModule
    ]
})

export class FloatingCouponWidgetModule{};
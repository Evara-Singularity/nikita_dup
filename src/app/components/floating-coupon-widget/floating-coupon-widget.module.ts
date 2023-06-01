import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FloatingCouponWidgetComponent } from "./floating-coupon-widget.component";



@NgModule({
    declarations: [FloatingCouponWidgetComponent],
    imports: [
        CommonModule
    ],
    exports: [
        FloatingCouponWidgetComponent,
    ]
})

export class FloatingCouponWidgetModule{};
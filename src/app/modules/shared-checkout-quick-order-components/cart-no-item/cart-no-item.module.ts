import { RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CartNoItemComponent } from "./cart-no-item.component";
import { TrendingCategoriesModule } from '@app/components/ternding-categories/trending-categories.component';
import { MockLottiePlayerModule } from "../../../components/mock-lottie-player/mock-lottie-player.module";

@NgModule({
    exports: [CartNoItemComponent],
    declarations: [CartNoItemComponent],
    providers: [],
    imports: [
        CommonModule,
        RouterModule,
        TrendingCategoriesModule,
        MockLottiePlayerModule
    ]
})

export class CartNoItemModule {}
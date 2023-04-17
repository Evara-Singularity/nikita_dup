import { RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CartNoItemComponent } from "./cart-no-item.component";
import { TrendingCategoriesModule } from '@app/components/ternding-categories/trending-categories.component';
import { MockLottiePlayerModule } from "@app/components/mock-lottie-player/mock-lottie-player.module";
@NgModule({
    imports: [
        CommonModule, 
        RouterModule,
        MockLottiePlayerModule,
        TrendingCategoriesModule
    ],
    exports: [CartNoItemComponent],
    declarations: [CartNoItemComponent],
    providers: []
})

export class CartNoItemModule {}
import { RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CartNoItemComponent } from "./cart-no-item/cart-no-item.component";

@NgModule({
    imports: [
        CommonModule, 
        RouterModule
    ],
    exports: [CartNoItemComponent],
    declarations: [CartNoItemComponent],
    providers: []
})

export class SharedCartModule {}
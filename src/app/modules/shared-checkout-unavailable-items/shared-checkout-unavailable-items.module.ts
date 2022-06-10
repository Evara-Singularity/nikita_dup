import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedCheckoutUnavailableItemsComponent } from './shared-checkout-unavailable-items.component';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';



@NgModule({
    declarations: [SharedCheckoutUnavailableItemsComponent],
    imports: [CommonModule,RouterModule, BottomMenuModule],
    exports: [SharedCheckoutUnavailableItemsComponent],
    entryComponents: [SharedCheckoutUnavailableItemsComponent]
})
export class SharedCheckoutUnavailableItemsModule { }

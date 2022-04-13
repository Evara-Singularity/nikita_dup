import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedCheckoutUnavailableItemsComponent } from './shared-checkout-unavailable-items.component';



@NgModule({
    declarations: [SharedCheckoutUnavailableItemsComponent],
    imports: [CommonModule,RouterModule],
    exports: [SharedCheckoutUnavailableItemsComponent],
    entryComponents: [SharedCheckoutUnavailableItemsComponent]
})
export class SharedCheckoutUnavailableItemsModule { }

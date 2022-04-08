import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartNotifiesComponent } from './cart-notifies.component';
import { RouterModule } from '@angular/router';
import { OutOfStockValidationMessagePipeModule } from '@app/utils/pipes/oos-validation-message.pipe';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';

@NgModule({
    declarations: [CartNotifiesComponent],
    exports: [CartNotifiesComponent],
    imports: [
        CommonModule,
        RouterModule,
        OutOfStockValidationMessagePipeModule,
        KpToggleDirectiveModule
    ]
})
export class CartNotifiesModule { }

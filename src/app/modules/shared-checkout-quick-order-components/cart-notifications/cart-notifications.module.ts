import { UnAvailableItemsComponent } from './unAvailableItems/unAvailableItems.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartNotificationsComponent } from './cart-notifications.component';
import { OutOfStockValidationMessagePipeModule } from '@pipes/oos-validation-message.pipe'
import { KpToggleDirectiveModule } from '@utils/directives/kp-toggle.directive';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        OutOfStockValidationMessagePipeModule,
        KpToggleDirectiveModule
    ],
    declarations: [
        CartNotificationsComponent,
        UnAvailableItemsComponent,
    ],
    exports: [
        CartNotificationsComponent,
        UnAvailableItemsComponent,
    ],
    providers: [

    ]
})

export class CartNotificationsModule { }

import { UnAvailableItemsComponent } from './unAvailableItems/unAvailableItems.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartUpdatesComponent } from './cartUpdates.component';
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
        CartUpdatesComponent,
        UnAvailableItemsComponent,
    ],
    exports: [
        CartUpdatesComponent,
        UnAvailableItemsComponent,
    ],
    providers: [

    ]
})

export class CartUpdatesModule { }

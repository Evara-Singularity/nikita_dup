import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartUpdatesComponent } from '../cartUpdates/cartUpdates.component';
import { OutOfStockValidationMessagePipeModule } from '../../utils/pipes/oos-validation-message.pipe'
import { KpToggleDirectiveModule } from '../../utils/directives/kp-toggle.directive';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        OutOfStockValidationMessagePipeModule,
        KpToggleDirectiveModule
    ],
    declarations: [
        CartUpdatesComponent,
    ],
    exports: [
        CartUpdatesComponent,
    ],
    providers: [

    ]
})

export class CartUpdatesModule { }

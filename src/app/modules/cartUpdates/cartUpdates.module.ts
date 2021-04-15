import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartUpdatesComponent } from '../cartUpdates/cartUpdates.component';
import { OutOfStockValidationMessagePipeModule } from '../../utils/pipes/oos-validation-message.pipe'

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        OutOfStockValidationMessagePipeModule
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

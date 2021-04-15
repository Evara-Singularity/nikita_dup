/**
 * Created by kuldeep on 14/08/20.
 */
import { NgModule} from '@angular/core';
import { CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import { UnAvailableItemsComponent } from './unAvailableItems.component';

@NgModule({
    imports: [
        CommonModule,        
        RouterModule
    ],
    declarations: [
        UnAvailableItemsComponent
    ],
    exports: [
        UnAvailableItemsComponent
    ],    
    entryComponents: [
        UnAvailableItemsComponent
    ]    
})

export class UnAvailableItemsModule {}

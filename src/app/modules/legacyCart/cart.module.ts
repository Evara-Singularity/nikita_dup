import { NgModule} from '@angular/core';
import { CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CartComponent} from './cart.component';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';
import { KpToggleDirectiveModule } from '@utils/directives/kp-toggle.directive';
import { MathFloorPipeModule } from '@pipes/math-floor';
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { PopUpModule } from '../popUp/pop-up.module';
import { CartUpdatesModule } from '../cartUpdates/cartUpdates.module';


@NgModule({
    imports: [
        CommonModule,
        MathFloorPipeModule,
        RouterModule,
        MathCeilPipeModule,
        BottomMenuModule,
        HttpClientModule,
        KpToggleDirectiveModule,
        PopUpModule,
        CartUpdatesModule
        
    ],
    declarations: [
        CartComponent
    ],
    exports: [
        CartComponent,
    ],
    providers: []
})

export class CartModule {}

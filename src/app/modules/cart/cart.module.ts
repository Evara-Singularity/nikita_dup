import { NgModule} from '@angular/core';
import { CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { CartComponent} from './cart.component';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';
import { KpToggleDirectiveModule } from 'src/app/utils/directives/kp-toggle.directive';
import { MathFloorPipeModule } from 'src/app/utils/pipes/math-floor';
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';
import { LoaderModule } from '../loader/loader.module';
import { PopUpModule } from '../popUp/pop-up.module';
import { CartUpdatesModule } from '../cartUpdates/cartUpdates.module';


@NgModule({
    imports: [
        CommonModule,
        MathFloorPipeModule,
        RouterModule,
        MathCeilPipeModule,
        LoaderModule,
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

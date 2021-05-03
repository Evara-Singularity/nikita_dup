/**
 * Created by kuldeep on 4/4/17.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./brand.routing";
import {BrandComponent} from "./brand.component";
import { KpToggleDirectiveModule } from 'src/app/utils/directives/kp-toggle.directive';
import { LoaderModule } from 'src/app/modules/loader/loader.module';

@NgModule({
    imports:[
        CommonModule,
        routing,
        RouterModule,
        KpToggleDirectiveModule,
        LoaderModule
    ],
    declarations:[
      BrandComponent
    ],
    exports: [
      BrandComponent
    ],
    providers:[]
})

export class BrandModule{}

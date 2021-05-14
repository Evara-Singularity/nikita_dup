import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./brand.routing";
import {BrandComponent} from "./brand.component";
import { KpToggleDirectiveModule } from 'src/app/utils/directives/kp-toggle.directive';

@NgModule({
    imports:[
        CommonModule,
        routing,
        RouterModule,
        KpToggleDirectiveModule,
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
